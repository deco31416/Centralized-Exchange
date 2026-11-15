import axios, { AxiosError } from 'axios';

/**
 * Cliente HTTP del dashboard autenticado.
 *
 * Reglas:
 * - SIEMPRE pega contra rutas BFF locales (`/api/*`), nunca contra el gateway directamente
 * - Las cookies HttpOnly viajan automáticamente (`withCredentials: true`)
 * - Tokens NUNCA se leen ni se guardan en localStorage
 *
 * Uso:
 *   import { dashboardClient } from '@/lib/dashboardClient';
 *   const { data } = await dashboardClient.get('/wallet/wallets/user/me');
 */
export const dashboardClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

/**
 * Interceptor de respuesta:
 * - 401 → intenta /api/auth/refresh una vez y reintenta el request original
 * - Si el refresh falla, propaga el error (la UI debe redirigir a login)
 */
let refreshPromise: Promise<void> | null = null;

dashboardClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post('/api/auth/refresh', {}, { withCredentials: true })
            .then(() => {
              refreshPromise = null;
            })
            .catch((e) => {
              refreshPromise = null;
              throw e;
            });
        }
        await refreshPromise;
        return dashboardClient(original);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
