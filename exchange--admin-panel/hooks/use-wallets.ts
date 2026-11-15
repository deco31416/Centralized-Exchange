'use client';

import { useState } from 'react';

export interface Balance {
  walletId: string;
  accountId: string;
  accountNumber?: string;
  currency: string;
  availableMinorUnits: string;
  lockedMinorUnits: string;
  availableFormatted: string;
  lockedFormatted: string;
  status: string;
}

export interface UserBalances {
  userId: string;
  accountId: string;
  accountNumber?: string;
  balances: Balance[];
  totalBalancesCount: number;
}

export function useUserBalances(userId: string | null) {
  const [data, setData] = useState<UserBalances | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wallets/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchBalances };
}

export function useAddBalance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBalance = async (input: {
    userId: string;
    currency: string;
    amountMinorUnits: string;
    reason?: string;
    adminId?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallets/add-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add balance');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addBalance, loading, error };
}
