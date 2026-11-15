import { NextResponse } from 'next/server';

/**
 * Deprecated for security.
 *
 * Session cookies must only be issued by trusted auth flows after the backend
 * validates credentials. Accepting browser-provided tokens here would allow
 * token injection/session fixation.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Token cookie injection is disabled. Use /api/auth/login or /api/auth/refresh.',
    },
    { status: 410 },
  );
}
