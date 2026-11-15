// Redirect legacy: /verify-email → /auth/verify-email (path canónico generado por micro-auth)
import { redirect } from "next/navigation"

export default async function VerifyEmailLegacyRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const token = params["token"]
  const query = token ? `?token=${token}` : ""
  redirect(`/auth/verify-email${query}`)
}
