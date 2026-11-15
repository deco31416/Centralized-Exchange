'use client';

import { useCallback, useEffect, useState } from 'react';

export interface AdminSession {
  sessionId: string;
  userId: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  device?: string;
  location?: string;
  createdAt: string;
  lastActivity?: string;
  expiresAt?: string;
  status?: string;
}

export function useAdminSessions() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sessions', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : data.sessions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error('Failed to revoke session');
      await fetchSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { sessions, loading, error, refetch: fetchSessions, revokeSession };
}
