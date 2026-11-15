// hooks/p2p/use-p2p-orders.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { P2POrdersService } from "@/services/P2PService";
import type { Order } from "@/types/p2p";

export function useP2POrders() {
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orders = await P2POrdersService.listOrders();
      setData(orders);
    } catch (err) {
      setError(err as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
