import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || '';

function getAdminGatewayBaseUrl(): string {
  const gatewayUrl = process.env.ADMIN_GATEWAY_URL || 'http://localhost:8080';
  const apiPrefix = process.env.ADMIN_GATEWAY_API_PREFIX || '/api/v1';
  const base = gatewayUrl.replace(/\/$/, '');
  const prefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;
  return `${base}${prefix}`;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gatewayBase = getAdminGatewayBaseUrl();
    const body = await req.json();

    const response = await fetch(`${gatewayBase}/wallet/wallets/admin/add-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'x-internal-auth': INTERNAL_AUTH_TOKEN,
        'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding balance:', error);
    return NextResponse.json(
      { error: 'Failed to add balance' },
      { status: 500 }
    );
  }
}
