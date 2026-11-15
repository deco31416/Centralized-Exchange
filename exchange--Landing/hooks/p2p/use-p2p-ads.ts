// hooks/p2p/use-p2p-ads.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { P2PAdsService } from "@/services/P2PService";
import type { AdFilters, UserAd } from "@/types/p2p";

export function useP2PAds(filters?: AdFilters) {
  const [data, setData] = useState<UserAd[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ads = await P2PAdsService.listMyAds(filters);
      setData(ads);
    } catch (err) {
      setError(err as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
