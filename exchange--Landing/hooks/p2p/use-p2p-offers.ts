// hooks/p2p/use-p2p-offers.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { P2POffersService } from "@/services/P2PService";
import type { OfferFilters, SellerOffer } from "@/types/p2p";

export function useP2POffers(filters: OfferFilters) {
  const [data, setData] = useState<SellerOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const offers = await P2POffersService.listOffers(filters);
      setData(offers);
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
