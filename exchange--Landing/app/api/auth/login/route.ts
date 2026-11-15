import { NextRequest, NextResponse } from 'next/server';
import { getUserGatewayBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';
import { enforceTrustedOrigin } from '../../_shared/origin-guard';
import { enforceRateLimit } from '../../_shared/rate-limit';
import { setTokenCookies } from '@/lib/auth/token-manager';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login
 *
 * BFF login: llama al gateway con include_refresh_token=true,
 * almacena ambos tokens en cookies HttpOnly (server-side) y devuelve
 * solo el perfil de usuario al browser — nunca los tokens.
 */
export async function POST(request: NextRequest) {
  try {
    const blockedOrigin = enforceTrustedOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = enforceRateLimit(request, {
      key: 'auth:login',
      limit: 8,
      windowMs: 60_000,
    });
    if (limited) return limited;

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const base = getUserGatewayBaseUrl();
    const url = `${base}/auth/login?include_refresh_token=true`;
    const internalAuthToken = getInternalAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-auth': internalAuthToken,
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const { access_token, refresh_token, user } = data;

    if (!access_token) {
      return NextResponse.json(
        { error: 'No access token received from upstream' },
        { status: 500 },
      );
    }

    // Store tokens in HttpOnly cookies — never exposed to browser
    await setTokenCookies(access_token, refresh_token || '');

    // Return only the user profile, no tokens
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('[BFF /api/auth/login] Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
