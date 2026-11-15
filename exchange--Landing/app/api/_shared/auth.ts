import type { NextRequest } from 'next/server';
import { getAccessToken } from '@/lib/auth/token-manager';
import { getUserGatewayBaseUrl } from './gateway';
import { getInternalAuthToken } from './internal-auth';

type UserIdentityPayload = {
  id?: unknown;
  sub?: unknown;
  userId?: unknown;
  user?: UserIdentityPayload;
  profile?: UserIdentityPayload;
  data?: UserIdentityPayload;
};

function extractUserId(payload: UserIdentityPayload | null): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const directId = payload.sub ?? payload.userId ?? payload.id;
  if (directId) return String(directId);

  return (
    extractUserId(payload.user ?? null) ||
    extractUserId(payload.profile ?? null) ||
    extractUserId(payload.data ?? null)
  );
}

/**
 * Extrae el userId autenticado:
 *  1. Cookie HttpOnly access_token
 *  2. Validacion upstream en auth backend
 *
 * Retorna null si no hay sesión.
 */
export async function resolveUserId(_req: NextRequest): Promise<string | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const base = getUserGatewayBaseUrl();
    const internalAuthToken = getInternalAuthToken();
    const response = await fetch(`${base}/auth/me/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-internal-auth': internalAuthToken,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return null;

    const data = (await response.json().catch(() => null)) as UserIdentityPayload | null;
    return extractUserId(data);
  } catch {
    return null;
  }
}
