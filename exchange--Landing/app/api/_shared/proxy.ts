import { NextRequest, NextResponse } from 'next/server';
import { getUserGatewayBaseUrl } from './gateway';
import { resolveUserId } from './auth';
import { getInternalAuthToken } from './internal-auth';
import { getAccessToken } from '@/lib/auth/token-manager';
import { enforceTrustedOrigin } from './origin-guard';

interface ProxyOptions {
  /** Si true, no se exige sesión (útil para /auth/login, /auth/register). */
  public?: boolean;
  /** Metodos permitidos sin sesion cuando public=true. */
  publicMethods?: string[];
}

/**
 * Crea un handler catch-all que reenvía requests del BFF al API Gateway.
 *
 * Uso en un route.ts:
 *   export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('funding');
 */
export function createProxyHandler(
  gatewayPrefix: string,
  options: ProxyOptions = {},
) {
  async function handler(
    req: NextRequest,
    context: { params: Promise<{ path?: string[] }> },
  ) {
    try {
      const blockedOrigin = enforceTrustedOrigin(req);
      if (blockedOrigin) return blockedOrigin;

      let userId: string | null = null;

      if (!options.public) {
        userId = await resolveUserId(req);
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      } else {
        // En rutas públicas todavía intentamos resolver, pero no bloqueamos.
        userId = await resolveUserId(req);
        if (
          !userId &&
          options.publicMethods &&
          !options.publicMethods.includes(req.method)
        ) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      const { path } = await context.params;
      const gatewayBase = getUserGatewayBaseUrl();
      const subPath = path?.join('/') || '';
      const queryString = req.nextUrl.search || '';
      const url = `${gatewayBase}/${gatewayPrefix}${subPath ? `/${subPath}` : ''}${queryString}`;

      const accessToken = await getAccessToken();
      const internalAuthToken = getInternalAuthToken();

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken || internalAuthToken}`,
        'x-internal-auth': internalAuthToken,
      };
      if (userId) headers['x-user-id'] = userId;

      const contentType = req.headers.get('content-type');
      if (contentType) headers['content-type'] = contentType;

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const body = await req.text();
        if (body) fetchOptions.body = body;
      }

      const response = await fetch(url, fetchOptions);

      const responseContentType = response.headers.get('content-type') || '';
      if (!responseContentType.includes('application/json')) {
        const text = await response.text();
        return new NextResponse(text, { status: response.status });
      }

      const data = await response.json().catch(() => null);
      if (data === null) {
        return new NextResponse(null, { status: response.status });
      }

      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error(`[BFF /api/${gatewayPrefix}] Proxy error:`, error);
      return NextResponse.json(
        { error: `Failed to proxy to ${gatewayPrefix}` },
        { status: 500 },
      );
    }
  }

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
  };
}
