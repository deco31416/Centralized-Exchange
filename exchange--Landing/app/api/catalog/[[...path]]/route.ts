import { NextRequest, NextResponse } from 'next/server';
import { getAssetRegistryBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';

export const dynamic = 'force-dynamic';

/**
 * Proxy server-side a asset-registry (:3010).
 * NO va por gateway-user (acceso directo desde BFF, igual que pricing-aggregator).
 *
 * Endpoints públicos del catálogo:
 *   GET /api/catalog/assets              → listado plano (filtrable por ?type=fiat|crypto|internal)
 *   GET /api/catalog/assets/grouped      → { fiat, crypto, internal }
 *   GET /api/catalog                     → catálogo completo (sync-manifest)
 *
 * Endpoints admin (requieren INTERNAL_AUTH_TOKEN):
 *   GET   /api/catalog/admin/assets      → todos los activos (para admin panel)
 *   PATCH /api/catalog/admin/assets/:code → actualizar campos de catálogo
 */
async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const { path } = await context.params;
    const base = getAssetRegistryBaseUrl();
    const subPath = path?.join('/') || '';
    const queryString = req.nextUrl.search || '';

    if (path?.[0] === 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin catalog routes require an authenticated admin BFF.' },
        { status: 403 },
      );
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return NextResponse.json(
        { error: 'Method not allowed', message: 'Public catalog is read-only.' },
        { status: 405 },
      );
    }

    const url = `${base}/catalog${subPath ? `/${subPath}` : ''}${queryString}`;
    const internalAuthToken = getInternalAuthToken();

    const headers: Record<string, string> = {
      'x-internal-auth': internalAuthToken,
    };
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
    console.error('[BFF /api/catalog] Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy to asset-registry' },
      { status: 502 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
