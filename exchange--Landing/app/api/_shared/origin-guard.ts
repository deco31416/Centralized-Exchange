import { NextRequest, NextResponse } from 'next/server';

function getAllowedOrigins(req: NextRequest): Set<string> {
  const origins = new Set<string>([req.nextUrl.origin]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl).origin);
    } catch {
      // Invalid env values are ignored so local development keeps working.
    }
  }

  return origins;
}

export function enforceTrustedOrigin(req: NextRequest): NextResponse | null {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return null;

  const origin = req.headers.get('origin');
  if (!origin) return null;

  if (getAllowedOrigins(req).has(origin)) return null;

  return NextResponse.json(
    {
      error: 'Forbidden origin',
      message: 'Request origin is not allowed.',
    },
    { status: 403 },
  );
}
