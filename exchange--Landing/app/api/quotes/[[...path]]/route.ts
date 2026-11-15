import { NextRequest, NextResponse } from 'next/server';
import { getPricingAggregatorBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';

export const dynamic = 'force-dynamic';

/**
 * BFF proxy → pricing-aggregator (:3013) — módulo /quotes
 *
 * Acceso directo al pricing-aggregator (no pasa por gateway-user),
 * siguiendo la misma arquitectura que /api/prices.
 *
 * Rutas disponibles en el micro:
 *   POST /api/v1/quotes   — crear quote estructurado con fees, quoteId y TTL
 *
 * Ejemplo de body:
 *   {
 *     "operation": "BUY",
 *     "fromAsset": "MXN",
 *     "toAsset": "BTC",
 *     "fromAmount": 1500,
 *     "userId": "user-uuid"
 *   }
 *
 * Response incluye: quoteId, toAmountAfterFees, fees.platformFee, exchangeRate, expiresAt
 */
async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const { path } = await context.params;
    const base = getPricingAggregatorBaseUrl();
    const subPath = path?.join('/') || '';
    const queryString = req.nextUrl.search || '';
    const url = `${base}/quotes${subPath ? `/${subPath}` : ''}${queryString}`;
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
    console.error('[BFF /api/quotes] Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy to pricing-aggregator (quotes)' },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const POST = handler;
