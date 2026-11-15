export type AnalyticsRange = '7d' | '30d' | '90d';

export type AnalyticsPoint = {
  date: string;
  users: number;
  operations: number;
  volumeUsd: number;
  revenueUsd: number;
};

export type AnalyticsSourceStatus = {
  key: string;
  label: string;
  status: 'connected' | 'unavailable';
  detail?: string;
  checkedAt: string;
};

export type AdminAnalyticsOverview = {
  generatedAt: string;
  range: AnalyticsRange;
  dataCompleteness: number;
  source: 'empty' | 'aggregated';
  sources?: AnalyticsSourceStatus[];
  totals: {
    users: number;
    operations: number;
    volumeUsd: number;
    revenueUsd: number;
    riskCases: number;
  };
};

export type AdminAnalyticsKpi = {
  key: string;
  label: string;
  value: number;
  unit: 'count' | 'usd' | 'percent';
  status: 'connected_empty' | 'connected';
};
