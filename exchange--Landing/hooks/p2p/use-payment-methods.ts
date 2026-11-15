// hooks/p2p/use-payment-methods.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { PaymentMethodsService } from "@/services/P2PService";
import type { PaymentMethod } from "@/types/p2p";

export function usePaymentMethods() {
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const methods = await PaymentMethodsService.list();
      setData(methods);
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
