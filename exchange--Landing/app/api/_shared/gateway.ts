/**
 * Resuelve la URL base del API Gateway User (server-side).
 * Lee NEXT_PUBLIC_GATEWAY_URL → NEXT_PUBLIC_API_BASE_URL → fallback localhost:8081.
 */
function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export function getUserGatewayBaseUrl(): string {
  const explicitGateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const raw = explicitGateway || apiBase || 'http://localhost:8081';

  const normalized = raw.replace(/\/$/, '');
  if (/\/api\/v1$/i.test(normalized)) {
    return normalized;
  }

  return joinUrl(normalized, '/api/v1');
}

/**
 * Pricing aggregator se accede directo (NO va por gateway, según arquitectura DECOX).
 * Solo desde server-side (BFF).
 */
export function getPricingAggregatorBaseUrl(): string {
  const raw =
    process.env.PRICING_AGGREGATOR_URL || 'http://localhost:3013/api/v1';
  return raw.replace(/\/$/, '');
}

/**
 * Asset Registry se accede directo desde BFF (NO vía gateway, igual que pricing-aggregator).
 * Solo desde server-side.
 */
export function getAssetRegistryBaseUrl(): string {
  const raw = process.env.ASSET_REGISTRY_URL || 'http://localhost:3010/api/v1';
  return raw.replace(/\/$/, '');
}
