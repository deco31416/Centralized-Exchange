import { NextResponse } from 'next/server';
import { getUserGatewayBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';
import { getAccessToken } from '@/lib/auth/token-manager';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 *
 * Devuelve el perfil del usuario autenticado leyendo el access_token
 * desde la cookie HttpOnly (server-side). El browser nunca accede al token.
 */
export async function GET() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const base = getUserGatewayBaseUrl();
    const url = `${base}/auth/me/profile`;
    const internalAuthToken = getInternalAuthToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-internal-auth': internalAuthToken,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[BFF /api/auth/me] Error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}
