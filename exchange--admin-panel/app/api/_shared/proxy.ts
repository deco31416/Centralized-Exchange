import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || '';

type AdminProxySensitiveRoute = {
  methods?: string[];
  pathIncludes: string;
  requiredRoles: string[];
  label: string;
  requiresEmailReauth?: boolean;
};

type AdminProxyOptions = {
  sensitiveRoutes?: AdminProxySensitiveRoute[];
};

function getAdminGatewayBaseUrl(): string {
  const gatewayUrl = process.env.ADMIN_GATEWAY_URL || 'http://localhost:8080';
  const apiPrefix = process.env.ADMIN_GATEWAY_API_PREFIX || '/api/v1';
  const base = gatewayUrl.replace(/\/$/, '');
  const prefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;
  return `${base}${prefix}`;
}

function matchSensitiveRoute(
  method: string,
  subPath: string,
  sensitiveRoutes: AdminProxySensitiveRoute[] = [],
) {
  return sensitiveRoutes.find((route) => {
    const methodMatches = !route.methods || route.methods.includes(method);
    return methodMatches && subPath.includes(route.pathIncludes);
  });
}

async function requireVerifiedAdminRole(
  token: string,
  gatewayBase: string,
  guard: AdminProxySensitiveRoute,
) {
  const upstream = await fetch(`${gatewayBase}/auth/verify-token`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-internal-auth': INTERNAL_AUTH_TOKEN,
      'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
    },
    cache: 'no-store',
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { error: 'Gateway admin unavailable', code: 'GATEWAY_UNAVAILABLE' },
      { status: 503 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'Invalid admin token', code: 'INVALID_ADMIN_TOKEN' },
      { status: 401 },
    );
  }

  const payload = await upstream.json().catch(() => null);
  const roles = payload?.user?.roles;
  const userRoles = Array.isArray(roles) ? roles : [];
  const allowed = guard.requiredRoles.some((role) => userRoles.includes(role));

  if (!allowed) {
    return NextResponse.json(
      {
        error: `${guard.label} requires elevated admin role`,
        code: 'INSUFFICIENT_ADMIN_ROLE',
        requiredRoles: guard.requiredRoles,
      },
      { status: 403 },
    );
  }

  if (guard.requiresEmailReauth) {
    const reauthUpstream = await fetch(`${gatewayBase}/auth/v2/reauth/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-internal-auth': INTERNAL_AUTH_TOKEN,
        'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
      },
      cache: 'no-store',
    }).catch(() => null);

    if (!reauthUpstream) {
      return NextResponse.json(
        { error: 'Gateway admin unavailable', code: 'GATEWAY_UNAVAILABLE' },
        { status: 503 },
      );
    }

    if (!reauthUpstream.ok) {
      return NextResponse.json(
        {
          error: 'Email reauthentication is required',
          code: 'EMAIL_REAUTH_REQUIRED',
        },
        { status: 401 },
      );
    }

    const reauth = await reauthUpstream.json().catch(() => null);
    if (!reauth?.email_verified) {
      return NextResponse.json(
        {
          error: `${guard.label} requires recent email reauthentication`,
          code: 'EMAIL_REAUTH_REQUIRED',
        },
        { status: 428 },
      );
    }
  }

  return null;
}

export function createAdminProxyHandler(gatewayPrefix: string, options: AdminProxyOptions = {}) {
  async function handler(
    req: NextRequest,
    context: { params: Promise<{ path?: string[] }> },
  ) {
    try {
      const cookieStore = await cookies();
      const adminToken = cookieStore.get('admin_token')?.value;

      if (!adminToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { path } = await context.params;
      const gatewayBase = getAdminGatewayBaseUrl();
      const subPath = path?.join('/') || '';
      const queryString = req.nextUrl.search || '';
      const url = `${gatewayBase}/${gatewayPrefix}${subPath ? `/${subPath}` : ''}${queryString}`;
      const sensitiveRoute = matchSensitiveRoute(
        req.method,
        subPath,
        options.sensitiveRoutes,
      );

      if (sensitiveRoute) {
        const guardResponse = await requireVerifiedAdminRole(
          adminToken,
          gatewayBase,
          sensitiveRoute,
        );

        if (guardResponse) {
          return guardResponse;
        }
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${adminToken}`,
        'x-internal-auth': INTERNAL_AUTH_TOKEN,
        'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
      };

      const contentType = req.headers.get('content-type');
      if (contentType) {
        headers['content-type'] = contentType;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
        cache: 'no-store',
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const body = await req.text();
        if (body) fetchOptions.body = body;
      }

      const response = await fetch(url, fetchOptions);

      const responseContentType = response.headers.get('content-type') || '';
      if (!responseContentType.includes('application/json')) {
        const body = await response.arrayBuffer();
        const passthroughHeaders = new Headers();
        const contentDisposition = response.headers.get('content-disposition');
        const contentLength = response.headers.get('content-length');

        if (responseContentType) {
          passthroughHeaders.set('content-type', responseContentType);
        }

        if (contentDisposition) {
          passthroughHeaders.set('content-disposition', contentDisposition);
        }

        if (contentLength) {
          passthroughHeaders.set('content-length', contentLength);
        }

        return new NextResponse(body, {
          status: response.status,
          headers: passthroughHeaders,
        });
      }

      const data = await response.json().catch(() => null);
      if (data === null) {
        return new NextResponse(null, { status: response.status });
      }

      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error(`[Admin BFF /api/${gatewayPrefix}] Proxy error:`, error);
      return NextResponse.json(
        { error: `Failed to proxy to ${gatewayPrefix}` },
        { status: 500 },
      );
    }
  }

  return { GET: handler, POST: handler, PUT: handler, PATCH: handler, DELETE: handler };
}
