import { NextRequest, NextResponse } from 'next/server';
import { getUserGatewayBaseUrl } from '@/app/api/_shared/gateway';
import { resolveUserId } from '@/app/api/_shared/auth';
import { getInternalAuthToken } from '@/app/api/_shared/internal-auth';
import { enforceTrustedOrigin } from '@/app/api/_shared/origin-guard';
import { getAccessToken } from '@/lib/auth/token-manager';

export const dynamic = 'force-dynamic';

/** Tiempo de espera máximo para requests al gateway (ms). */
const REQUEST_TIMEOUT_MS = 15_000;

type FallbackFundingMethod = {
  code: string;
  methodCode: string;
  name: string;
  description: string;
  fiatCode: string;
  currency: string;
  country: string;
  type: string;
  minAmount: number;
  maxAmount: number;
  requiresSavedCard: boolean;
  requiresKyc: boolean;
  settlementTime: string;
  enabled: boolean;
  displayOrder: number;
  metadata: { source: 'fallback' };
};

const fallbackMethods: FallbackFundingMethod[] = [
  {
    code: 'spei',
    methodCode: 'spei',
    name: 'SPEI',
    description: 'Banco mexicano local',
    fiatCode: 'MXN',
    currency: 'MXN',
    country: 'MX',
    type: 'Banco',
    minAmount: 100,
    maxAmount: 250_000,
    requiresSavedCard: false,
    requiresKyc: true,
    settlementTime: '5-30 min',
    enabled: true,
    displayOrder: 1,
    metadata: { source: 'fallback' },
  },
  {
    code: 'card',
    methodCode: 'card',
    name: 'Tarjeta',
    description: 'Debito o credito',
    fiatCode: 'MXN',
    currency: 'MXN',
    country: 'MX',
    type: 'Tarjeta',
    minAmount: 100,
    maxAmount: 80_000,
    requiresSavedCard: true,
    requiresKyc: true,
    settlementTime: 'Instantaneo',
    enabled: true,
    displayOrder: 2,
    metadata: { source: 'fallback' },
  },
  {
    code: 'pse',
    methodCode: 'pse',
    name: 'PSE',
    description: 'Banco colombiano local',
    fiatCode: 'COP',
    currency: 'COP',
    country: 'CO',
    type: 'Banco',
    minAmount: 10_000,
    maxAmount: 120_000_000,
    requiresSavedCard: false,
    requiresKyc: true,
    settlementTime: '5-20 min',
    enabled: true,
    displayOrder: 1,
    metadata: { source: 'fallback' },
  },
  {
    code: 'nequi',
    methodCode: 'nequi',
    name: 'Nequi',
    description: 'Wallet local',
    fiatCode: 'COP',
    currency: 'COP',
    country: 'CO',
    type: 'Electronico',
    minAmount: 10_000,
    maxAmount: 8_000_000,
    requiresSavedCard: false,
    requiresKyc: true,
    settlementTime: '5-15 min',
    enabled: true,
    displayOrder: 2,
    metadata: { source: 'fallback' },
  },
  {
    code: 'ach',
    methodCode: 'ach',
    name: 'ACH',
    description: 'Banco estadounidense',
    fiatCode: 'USD',
    currency: 'USD',
    country: 'US',
    type: 'Banco',
    minAmount: 10,
    maxAmount: 250_000,
    requiresSavedCard: false,
    requiresKyc: true,
    settlementTime: 'T+1',
    enabled: true,
    displayOrder: 1,
    metadata: { source: 'fallback' },
  },
  {
    code: 'sepa',
    methodCode: 'sepa',
    name: 'SEPA',
    description: 'Banco europeo',
    fiatCode: 'EUR',
    currency: 'EUR',
    country: 'EU',
    type: 'Banco',
    minAmount: 10,
    maxAmount: 250_000,
    requiresSavedCard: false,
    requiresKyc: true,
    settlementTime: 'T+1',
    enabled: true,
    displayOrder: 1,
    metadata: { source: 'fallback' },
  },
];

function getFallbackMethods(searchParams: URLSearchParams) {
  const fiat = searchParams.get('fiat')?.toUpperCase();
  const country = searchParams.get('country')?.toUpperCase();
  return fallbackMethods
    .filter((method) => !fiat || method.fiatCode === fiat || method.currency === fiat)
    .filter((method) => !country || method.country === country || (country === 'EU' && method.country === 'EU'))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Retorna los headers base para llamadas server-side al gateway.
 * Nunca expone el INTERNAL_AUTH_TOKEN al browser.
 */
async function buildGatewayHeaders(userId: string | null): Promise<Record<string, string>> {
  const accessToken = await getAccessToken();
  const internalAuthToken = getInternalAuthToken();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    Authorization: `Bearer ${accessToken || internalAuthToken}`,
    'x-internal-auth': internalAuthToken,
  };
  if (userId) headers['x-user-id'] = userId;
  return headers;
}

/**
 * Obtiene el walletId del usuario para la moneda indicada.
 * Llama al gateway → wallet-ledger GET /wallet/wallets/user/:userId
 * Devuelve el walletId del primer wallet con currency === currency,
 * o el primer wallet disponible, o null si no hay ninguno.
 */
async function resolveWalletId(
  userId: string,
  currency: string,
  headers: Record<string, string>,
): Promise<string | null> {
  try {
    const base = getUserGatewayBaseUrl();
    const url = `${base}/wallet/wallets/user/${userId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data?.balances?.length) return null;

    // Preferir wallet de la moneda solicitada
    const match = data.balances.find(
      (w: { currency: string; walletId: string }) =>
        w.currency.toUpperCase() === currency.toUpperCase(),
    );
    if (match?.walletId) return match.walletId;

    // Fallback: primer wallet disponible
    return data.balances[0]?.walletId ?? null;
  } catch {
    return null;
  }
}

/**
 * Enruta la request al gateway según el path:
 *
 *  GET  /api/easy-crypto/buy/methods          → GET  {gateway}/funding/methods
 *  POST /api/easy-crypto/buy/intent           → POST {gateway}/funding/intent  (inyecta userId + walletId)
 *  POST /api/easy-crypto/buy/confirm          → POST {gateway}/funding/confirm (inyecta userId + walletId)
 *  GET  /api/easy-crypto/buy/orders/:intentId → 404 (funding-core no tiene GET intent por ID)
 *  *                                          → proxy directo a {gateway}/funding/<path>
 */
async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const blockedOrigin = enforceTrustedOrigin(req);
  if (blockedOrigin) return blockedOrigin;

  const userId = await resolveUserId(req);

  // Rutas que requieren sesión activa
  const { path: pathSegments } = await context.params;
  const subPath = pathSegments?.join('/') || '';

  const requiresAuth = subPath !== 'methods';
  if (requiresAuth && !userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Se requiere sesión activa para continuar.' },
      { status: 401 },
    );
  }

  const headers = await buildGatewayHeaders(userId);
  const base = getUserGatewayBaseUrl();

  // ── GET /methods — proxy simple ────────────────────────────────────────────
  if (req.method === 'GET' && subPath === 'methods') {
    const queryString = req.nextUrl.search || '';
    try {
      const res = await fetch(`${base}/funding/methods${queryString}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      if (res.ok && list.length > 0) return NextResponse.json(data ?? {}, { status: res.status });
    } catch {
      // Mantener vivo el mockup UX cuando el gateway aun no entrega catalogo.
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: getFallbackMethods(req.nextUrl.searchParams),
    });
  }

  // ── POST /intent — inyecta userId + walletId ───────────────────────────────
  if (req.method === 'POST' && subPath === 'intent') {
    let bodyJson: Record<string, unknown> = {};
    try {
      bodyJson = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Body JSON inválido.' },
        { status: 400 },
      );
    }

    const currency =
      typeof bodyJson.currency === 'string' ? bodyJson.currency : 'MXN';

    // Intentar resolver walletId — si falla, funding-core puede devolver error real
    const walletId = userId ? await resolveWalletId(userId, currency, headers) : null;

    const payload: Record<string, unknown> = {
      ...bodyJson,
      userId: userId ?? bodyJson.userId,
      ...(walletId ? { walletId } : {}),
    };

    const res = await fetch(`${base}/funding/intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: res.status });
  }

  // ── POST /confirm — inyecta userId + walletId ──────────────────────────────
  if (req.method === 'POST' && subPath === 'confirm') {
    let bodyJson: Record<string, unknown> = {};
    try {
      bodyJson = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Body JSON inválido.' },
        { status: 400 },
      );
    }

    const currency =
      typeof bodyJson.currency === 'string' ? bodyJson.currency : 'MXN';
    const walletId = userId ? await resolveWalletId(userId, currency, headers) : null;

    const payload: Record<string, unknown> = {
      ...bodyJson,
      userId: userId ?? bodyJson.userId,
      ...(walletId ? { walletId } : {}),
    };

    const res = await fetch(`${base}/funding/confirm`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: res.status });
  }

  // ── GET /orders/:id — no soportado (funding-core no tiene GET intent) ──────
  if (req.method === 'GET' && subPath.startsWith('orders/')) {
    return NextResponse.json(
      {
        error: 'Not Implemented',
        message:
          'La consulta de órdenes por ID no está disponible. funding-core no expone GET /funding/intents/:id.',
        debtCode: 'FUNDING-INTENT-QUERY-001',
      },
      { status: 501 },
    );
  }

  // ── Proxy genérico para cualquier otro path ────────────────────────────────
  const queryString = req.nextUrl.search || '';
  const targetUrl = `${base}/funding${subPath ? `/${subPath}` : ''}${queryString}`;

  let fetchOptions: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text();
    if (body) fetchOptions = { ...fetchOptions, body };
  }

  const res = await fetch(targetUrl, fetchOptions);
  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
