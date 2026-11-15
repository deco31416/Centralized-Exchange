import { redirect } from 'next/navigation'
import { getAuthConfig } from '@/lib/auth-config'

export default function HomePage() {
  // Redirige a la URL ofuscada del login (se lee de env)
  const { adminPath } = getAuthConfig()
  redirect(`/${adminPath}`)
}
