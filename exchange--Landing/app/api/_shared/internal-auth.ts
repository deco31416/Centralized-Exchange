/**
 * Shared service-to-service token resolver for BFF routes.
 *
 * Development keeps a harmless "dev" fallback so mockups stay usable.
 * Production fails closed when INTERNAL_AUTH_TOKEN is missing.
 */
export function getInternalAuthToken(): string {
  const token = process.env.INTERNAL_AUTH_TOKEN?.trim();
  if (token) return token;

  if (process.env.NODE_ENV !== 'production') {
    return 'dev';
  }

  throw new Error('INTERNAL_AUTH_TOKEN is required in production');
}
