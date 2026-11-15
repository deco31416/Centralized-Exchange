'use client';

import { useEffect, useState } from 'react';

export interface AdminAuthUser {
  id: string;
  email: string;
  roles: string[];
  sessionId?: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify', { credentials: 'include' });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  return { user, loading, authenticated: !!user };
}
