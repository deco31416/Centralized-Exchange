import { NextRequest, NextResponse } from 'next/server';
import { getUserGatewayBaseUrl } from '@/app/api/_shared/gateway';
import { resolveUserId } from '@/app/api/_shared/auth';
import { getInternalAuthToken } from '@/app/api/_shared/internal-auth';
import { enforceTrustedOrigin } from '@/app/api/_shared/origin-guard';
import { getAccessToken } from '@/lib/auth/token-manager';

export const dynamic = 'force-dynamic';

const REQUEST_TIMEOUT_MS = 15_000;

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

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const blockedOrigin = enforceTrustedOrigin(req);
  if (blockedOrigin) return blockedOrigin;

  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Se requiere sesión activa para operaciones BLC.' },
      { status: 401 },
    );
  }

  const { path: pathSegments } = await context.params;
  const subPath = pathSegments?.join('/') || '';
  const headers = await buildGatewayHeaders(userId);
  const base = getUserGatewayBaseUrl();

  const queryString = req.nextUrl.search || '';
  const targetUrl = `${base}/funding/blc${subPath ? `/${subPath}` : ''}${queryString}`;

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
