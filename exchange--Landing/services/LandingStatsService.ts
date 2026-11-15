export interface LandingStatsData {
  transactions: number;
  cryptocurrencies: number;
  fiatMoney: number;
  users: number;
  updatedAt: string;
}

export interface LandingStatsResponse {
  success: boolean;
  data: LandingStatsData;
  sources: {
    transactions: 'real' | 'temporary_static';
    cryptocurrencies: 'real' | 'temporary_static';
    fiatMoney: 'real' | 'temporary_static';
    users: 'real' | 'temporary_static';
  };
}

/**
 * Obtiene métricas de la landing desde el BFF.
 * El BFF llama al endpoint público del api-gateway-user (:8081).
 */
export const getLandingStats = async (): Promise<LandingStatsData> => {
  const res = await fetch('/api/landing-stats', { cache: 'no-store' });
  if (!res.ok) throw new Error(`landing-stats failed: ${res.status}`);
  const body: LandingStatsResponse = await res.json();
  if (!body.success || !body.data) throw new Error('Invalid response shape from landing-stats');
  return body.data;
};
