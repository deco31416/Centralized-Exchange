import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import {
  getRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from '@/lib/auth/token-manager';
import { getUserGatewayBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';
import { enforceTrustedOrigin } from '../../_shared/origin-guard';
import { enforceRateLimit } from '../../_shared/rate-limit';

/**
 * POST /api/auth/refresh
 * Refresca access_token usando refresh_token de la cookie HttpOnly.
 *
 * - 401/403 del backend → limpia cookies (sesión expirada real)
 * - 5xx/timeout/red → preserva cookies, devuelve 503 (transiente)
 */
export async function POST(_request: NextRequest) {
  try {
    const blockedOrigin = enforceTrustedOrigin(_request);
    if (blockedOrigin) return blockedOrigin;

    const limited = enforceRateLimit(_request, {
      key: 'auth:refresh',
      limit: 30,
      windowMs: 60_000,
    });
    if (limited) return limited;

    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        {
          error: 'No refresh token',
          message: 'Refresh token not found in cookies',
        },
        { status: 401 },
      );
    }

    const gatewayBase = getUserGatewayBaseUrl();
    const internalToken = getInternalAuthToken();

    const response = await axios.post(
      `${gatewayBase}/auth/refresh?include_refresh_token=true`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-auth': internalToken,
        },
        timeout: 10000,
      },
    );

    const { access_token, refresh_token } = response.data;

    if (!access_token || !refresh_token) {
      throw new Error('Invalid response from auth backend');
    }

    await setTokenCookies(access_token, refresh_token);

    return NextResponse.json(
      {
        success: true,
        message: 'Tokens refreshed successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[refresh] Error refreshing tokens:', error);

    const isAuthError =
      axios.isAxiosError(error) &&
      [401, 403].includes(error.response?.status ?? 0);

    if (isAuthError) {
      await clearTokenCookies();
      return NextResponse.json(
        {
          error: 'Session expired',
          message:
            (error as any)?.response?.data?.message ||
            'Refresh token is invalid or expired',
        },
        { status: 401 },
      );
    }

    if (axios.isAxiosError(error)) {
      console.warn('[refresh] Error transiente — cookies preservadas:', {
        status: error.response?.status,
        code: error.code,
      });
      return NextResponse.json(
        {
          error: 'Refresh temporarily unavailable',
          message:
            'Auth service is temporarily unavailable. Cookies preserved.',
          transient: true,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to refresh tokens',
        transient: true,
      },
      { status: 503 },
    );
  }
}
