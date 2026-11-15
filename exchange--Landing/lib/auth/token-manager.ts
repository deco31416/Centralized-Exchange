import { cookies } from 'next/headers';

/**
 * Cookies HttpOnly para tokens de autenticación.
 * Réplica del patrón usado en Exchange--dashboard-user.
 *
 * Reglas:
 * - Tokens NUNCA tocan localStorage (XSS protection)
 * - HttpOnly + SameSite previene CSRF/XSS
 * - Refresh token solo accesible vía /api/auth/refresh
 */

const COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    name: 'access_token',
    maxAge: 10 * 60, // 10 minutos
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
  REFRESH_TOKEN: {
    name: 'refresh_token',
    maxAge: 45 * 24 * 60 * 60, // 45 días
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/api/auth/refresh',
  },
};

export async function setTokenCookies(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_CONFIG.ACCESS_TOKEN.name, accessToken, {
    httpOnly: COOKIE_CONFIG.ACCESS_TOKEN.httpOnly,
    secure: COOKIE_CONFIG.ACCESS_TOKEN.secure,
    sameSite: COOKIE_CONFIG.ACCESS_TOKEN.sameSite,
    maxAge: COOKIE_CONFIG.ACCESS_TOKEN.maxAge,
    path: COOKIE_CONFIG.ACCESS_TOKEN.path,
  });

  if (refreshToken) {
    cookieStore.set(COOKIE_CONFIG.REFRESH_TOKEN.name, refreshToken, {
      httpOnly: COOKIE_CONFIG.REFRESH_TOKEN.httpOnly,
      secure: COOKIE_CONFIG.REFRESH_TOKEN.secure,
      sameSite: COOKIE_CONFIG.REFRESH_TOKEN.sameSite,
      maxAge: COOKIE_CONFIG.REFRESH_TOKEN.maxAge,
      path: COOKIE_CONFIG.REFRESH_TOKEN.path,
    });
  }
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN.name)?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_CONFIG.REFRESH_TOKEN.name)?.value || null;
}

export async function clearTokenCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_CONFIG.ACCESS_TOKEN.name, '', {
    httpOnly: COOKIE_CONFIG.ACCESS_TOKEN.httpOnly,
    secure: COOKIE_CONFIG.ACCESS_TOKEN.secure,
    sameSite: COOKIE_CONFIG.ACCESS_TOKEN.sameSite,
    path: COOKIE_CONFIG.ACCESS_TOKEN.path,
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.set(COOKIE_CONFIG.REFRESH_TOKEN.name, '', {
    httpOnly: COOKIE_CONFIG.REFRESH_TOKEN.httpOnly,
    secure: COOKIE_CONFIG.REFRESH_TOKEN.secure,
    sameSite: COOKIE_CONFIG.REFRESH_TOKEN.sameSite,
    path: COOKIE_CONFIG.REFRESH_TOKEN.path,
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function hasValidAccessToken(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null && token.length > 0;
}
