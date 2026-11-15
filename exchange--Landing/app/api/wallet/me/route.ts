import { NextRequest, NextResponse } from 'next/server';
import { resolveUserId } from '../../_shared/auth';
import { getUserGatewayBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';
import { getAccessToken } from '@/lib/auth/token-manager';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet/me
 * BFF específico que resuelve el userId del JWT server-side y llama al gateway
 * con la URL correcta: GET /wallet/wallets/user/:userId → wallet-ledger :9001
 */
export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = await getAccessToken();
  const internalAuthToken = getInternalAuthToken();
  const gatewayBase = getUserGatewayBaseUrl();
  const url = `${gatewayBase}/wallet/wallets/user/${userId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken || internalAuthToken}`,
        'x-internal-auth': internalAuthToken,
        'x-user-id': userId,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Wallet service unavailable', detail: message },
      { status: 503 },
    );
  }
}
