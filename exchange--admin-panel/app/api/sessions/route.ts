import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function getAdminGatewayBaseUrl(): string {
  const gatewayUrl = process.env.ADMIN_GATEWAY_URL || 'http://localhost:8080';
  const apiPrefix = process.env.ADMIN_GATEWAY_API_PREFIX || '/api/v1';
  const base = gatewayUrl.replace(/\/$/, '');
  const prefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;
  return `${base}${prefix}`;
}

const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || '';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gatewayBase = getAdminGatewayBaseUrl();
    const response = await fetch(`${gatewayBase}/auth/v2/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'x-internal-auth': INTERNAL_AUTH_TOKEN,
        'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[BFF /api/sessions] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
