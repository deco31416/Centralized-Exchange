// src/services/CurrenciesService.ts
import axiosClient from '@/lib/axiosClient';
import { Currency } from '@/types/currency';

export const getCurrencies = async (): Promise<Currency[]> => {
  const response = await axiosClient.get('/currencies/v2/public');
  return response.data;
};

export const getTimeline = async (tickers: string): Promise<any> => {
  const response = await axiosClient.get('/currencies/v2/public/timeline', {
    params: {
      dataSet: '1d',
      timeFrame: '1h',
      tickers,
    },
  });
  return response.data;
};
