import { NextResponse } from 'next/server';
import { getUserGatewayBaseUrl } from '../_shared/gateway';
import { getInternalAuthToken } from '../_shared/internal-auth';

export const dynamic = 'force-dynamic';

/**
 * BFF proxy a GET /api/v1/public/landing-stats en api-gateway-user (:8081).
 * Endpoint público — no requiere token de usuario.
 */
export async function GET() {
  try {
    const base = getUserGatewayBaseUrl();
    const url = `${base}/public/landing-stats`;
    const internalAuthToken = getInternalAuthToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-internal-auth': internalAuthToken,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'landing-stats unavailable' },
        { status: 503 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'landing-stats unavailable' },
      { status: 503 },
    );
  }
}
