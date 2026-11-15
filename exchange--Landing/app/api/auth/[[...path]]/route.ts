import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId } from '../../_shared/auth';
import { getUserGatewayBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';
import { enforceTrustedOrigin } from '../../_shared/origin-guard';
import { enforceRateLimit } from '../../_shared/rate-limit';
import { getAccessToken } from '@/lib/auth/token-manager';

export const dynamic = 'force-dynamic';

const PUBLIC_AUTH_ROUTES: Record<string, string[]> = {
  'forgot-password': ['POST'],
  'reset-password': ['POST'],
  'verify-email': ['POST'],
};

function isPublicAuthRoute(path: string, method: string): boolean {
  return PUBLIC_AUTH_ROUTES[path]?.includes(method) ?? false;
}

function isPrivateAuthRoute(pathSegments: string[], method: string): boolean {
  if (pathSegments[0] !== 'sessions') return false;
  if (pathSegments.length > 2) return false;
  return ['GET', 'DELETE'].includes(method);
}

async function proxyAuthRequest(
  req: NextRequest,
  pathSegments: string[],
  userId?: string,
) {
  const base = getUserGatewayBaseUrl();
  const subPath = pathSegments.join('/');
  const queryString = req.nextUrl.search || '';
  const url = `${base}/auth/${subPath}${queryString}`;
  const internalAuthToken = getInternalAuthToken();
  const accessToken = await getAccessToken();

  const headers: Record<string, string> = {
    'x-internal-auth': internalAuthToken,
  };

  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (userId) headers['x-user-id'] = userId;

  const contentType = req.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text();
    if (body) fetchOptions.body = body;
  }

  const response = await fetch(url, fetchOptions);
  const contentTypeResponse = response.headers.get('content-type') || '';

  if (!contentTypeResponse.includes('application/json')) {
    const text = await response.text();
    return new NextResponse(text, { status: response.status });
  }

  const data = await response.json().catch(() => null);
  if (data === null) return new NextResponse(null, { status: response.status });

  return NextResponse.json(data, { status: response.status });
}

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const blockedOrigin = enforceTrustedOrigin(req);
    if (blockedOrigin) return blockedOrigin;

    const { path = [] } = await context.params;
    const subPath = path.join('/');

    if (!subPath) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (isPublicAuthRoute(subPath, req.method)) {
      const limited = enforceRateLimit(req, {
        key: `auth:${subPath}`,
        limit: 5,
        windowMs: 10 * 60_000,
      });
      if (limited) return limited;

      return proxyAuthRequest(req, path);
    }

    if (isPrivateAuthRoute(path, req.method)) {
      const limited = enforceRateLimit(req, {
        key: 'auth:sessions',
        limit: 40,
        windowMs: 60_000,
      });
      if (limited) return limited;

      const userId = await resolveUserId(req);
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return proxyAuthRequest(req, path, userId);
    }

    return NextResponse.json({ error: 'Auth route not allowed' }, { status: 404 });
  } catch (error) {
    console.error('[BFF /api/auth/*] Error:', error);
    return NextResponse.json({ error: 'Auth proxy failed' }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
