/**
 * catalogApi.ts
 * Client-side API helper para gestionar el catálogo de activos desde admin panel.
 * Usa la BFF route /api/catalog, que pasa por api-gateway-admin.
 * Todos los datos vienen del backend — no hay hardcoding de catálogo aquí.
 */

export interface FundingChannel {
  type: 'bank_transfer' | 'mobile_payment' | 'cash_reference' | 'internal_credit' | string;
  provider: string;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  routingNumber?: string;
  phone?: string;
  documentId?: string;
  bankCode?: string;
  alias?: string;
  holderName: string;
  currency: string;
  country: string;
  instructions?: string;
  isTest: boolean;
  environment: 'development' | 'staging' | 'production' | string;
  enabled?: boolean;
}

export interface CatalogAsset {
  code: string;
  name: string;
  type: 'fiat' | 'crypto' | 'internal';
  decimals: number;
  category: string;
  description?: string;
  iconUrl?: string;
  logoUrl?: string;
  enabled: boolean;
  isVisibleInFrontend: boolean;
  displayOrder?: number;
  rolloutPhase?: string;
  badge?: string;
  paymentMethods?: string[];
  fundingChannels?: FundingChannel[];
  canBuy: boolean;
  canSell: boolean;
  canConvert: boolean;
  canSend: boolean;
}

/** GET /api/catalog/admin/assets — todos los activos (incluyendo hidden) */
export async function getAllAssetsForAdmin(type?: string): Promise<CatalogAsset[]> {
  const params = type ? `?type=${type}` : '';
  const res = await fetch(`/api/catalog/admin/assets${params}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Error fetching assets: ${res.status}`);
  }
  return res.json();
}

/** GET /api/catalog/assets/grouped — activos visibles agrupados (público) */
export async function getGroupedAssets(): Promise<{ fiat: CatalogAsset[]; crypto: CatalogAsset[]; internal: CatalogAsset[] }> {
  const res = await fetch('/api/catalog/assets/grouped', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

/** PATCH /api/catalog/admin/assets/:code — actualizar cualquier campo editable del asset */
export async function updateAsset(code: string, data: Partial<CatalogAsset>): Promise<CatalogAsset> {
  const res = await fetch(`/api/catalog/admin/assets/${code}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.message || `Error updating asset: ${res.status}`);
  }
  return res.json();
}

/** Reemplaza el array completo de fundingChannels de un asset */
export async function updateFundingChannels(
  code: string,
  channels: FundingChannel[],
): Promise<CatalogAsset> {
  return updateAsset(code, { fundingChannels: channels });
}

/** Agrega un canal al array existente */
export async function addFundingChannel(
  asset: CatalogAsset,
  channel: FundingChannel,
): Promise<CatalogAsset> {
  const current = asset.fundingChannels ?? [];
  return updateFundingChannels(asset.code, [...current, channel]);
}

/** Reemplaza un canal en el índice dado */
export async function updateFundingChannel(
  asset: CatalogAsset,
  index: number,
  channel: FundingChannel,
): Promise<CatalogAsset> {
  const channels = [...(asset.fundingChannels ?? [])];
  channels[index] = channel;
  return updateFundingChannels(asset.code, channels);
}

/** Elimina un canal en el índice dado */
export async function removeFundingChannel(
  asset: CatalogAsset,
  index: number,
): Promise<CatalogAsset> {
  const channels = [...(asset.fundingChannels ?? [])];
  channels.splice(index, 1);
  return updateFundingChannels(asset.code, channels);
}

/** Activa/desactiva (enabled) un canal en el índice dado */
export async function toggleFundingChannel(
  asset: CatalogAsset,
  index: number,
  enabled: boolean,
): Promise<CatalogAsset> {
  const channels = [...(asset.fundingChannels ?? [])];
  channels[index] = { ...channels[index], enabled };
  return updateFundingChannels(asset.code, channels);
}
