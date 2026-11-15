import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookies } from '@/lib/auth/token-manager';

/**
 * POST /api/auth/clear-tokens
 * Elimina cookies de sesión (logout server-side).
 */
export async function POST(_request: NextRequest) {
  try {
    await clearTokenCookies();
    return NextResponse.json(
      { success: true, message: 'Tokens cleared successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[clear-tokens] Error clearing tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to clear tokens' },
      { status: 500 },
    );
  }
}
