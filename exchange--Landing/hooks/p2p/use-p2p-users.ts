// hooks/p2p/use-p2p-users.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { P2PUsersService } from "@/services/P2PService";
import type { P2PUser, UserFilters } from "@/types/p2p";

export function useP2PUsers(filters?: UserFilters) {
  const [data, setData] = useState<P2PUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const users = await P2PUsersService.listUsers(filters);
      setData(users);
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
