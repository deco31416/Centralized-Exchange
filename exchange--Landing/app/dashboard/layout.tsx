import type { Metadata } from 'next';
import { hasValidAccessToken } from '@/lib/auth/token-manager';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Mi cuenta — deco-exchange',
  description: 'Gestiona tu perfil, wallet, seguridad y firma digital.',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthed = await hasValidAccessToken();
  if (!isAuthed) {
    redirect('/');
  }

  return <>{children}</>;
}
