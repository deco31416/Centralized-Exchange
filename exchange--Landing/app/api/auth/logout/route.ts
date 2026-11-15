import { NextResponse } from 'next/server';
import { getUserGatewayBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';
import { getAccessToken, clearTokenCookies } from '@/lib/auth/token-manager';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout
 *
 * Invalida la sesión en el backend y elimina las cookies HttpOnly del browser.
 * Las cookies se limpian siempre, incluso si el upstream falla.
 */
export async function POST() {
  try {
    const accessToken = await getAccessToken();

    // Limpiar cookies antes de cualquier llamada upstream
    // para garantizar que el usuario quede deslogueado localmente
    await clearTokenCookies();

    if (accessToken) {
      const base = getUserGatewayBaseUrl();
      const url = `${base}/auth/logout`;
      const internalAuthToken = getInternalAuthToken();

      // Best-effort: no fallar el logout si el upstream está caído
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-internal-auth': internalAuthToken,
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(5_000),
        });
      } catch {
        // Ignorado intencionalmente — la sesión local ya fue invalidada
      }
    }

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[BFF /api/auth/logout] Error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
