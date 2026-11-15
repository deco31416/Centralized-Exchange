"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { IconDeviceMobile, IconKey, IconLock, IconMail, IconShield } from "@tabler/icons-react"

interface AdminUser {
  id: string
  email: string
  username?: string
  status: string
  roles: string[]
  sms_otp_enabled?: boolean
  totp_enabled?: boolean
  email_verified?: boolean
}

export default function Config2FAPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await fetch("/api/admins?limit=100", { cache: "no-store" })
        if (!res.ok) throw new Error("Error al cargar admins")
        const data = await res.json()
        setAdmins(data.admins || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchAdmins()
  }, [])

  const summary = useMemo(() => {
    const total = admins.length
    const totp = admins.filter((admin) => admin.totp_enabled).length
    const smsOtp = admins.filter((admin) => admin.sms_otp_enabled).length
    const verifiedEmail = admins.filter((admin) => admin.email_verified).length
    const withMfa = admins.filter((admin) => admin.totp_enabled || admin.sms_otp_enabled).length
    const coverage = total > 0 ? Math.round((withMfa / total) * 100) : 0

    return { total, totp, smsOtp, verifiedEmail, withMfa, coverage }
  }, [admins])

  return (
    <div className="space-y-6">
      <PageConnectionHeader
        title="Configurar 2FA/MFA"
        description="Cobertura de autenticación multifactor para cuentas administrativas"
        state="partial"
        percent={60}
        note="Lectura conectada por auth-admin; políticas globales y edición centralizada quedan pendientes."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobertura MFA</CardTitle>
            <IconLock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `${summary.coverage}%`}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Cargando" : `${summary.withMfa}/${summary.total} admins`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TOTP</CardTitle>
            <IconDeviceMobile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : summary.totp}</div>
            <p className="text-xs text-muted-foreground">App autenticadora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OTP SMS</CardTitle>
            <IconKey className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : summary.smsOtp}</div>
            <p className="text-xs text-muted-foreground">Segundo factor alterno</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email verificado</CardTitle>
            <IconMail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : summary.verifiedEmail}</div>
            <p className="text-xs text-muted-foreground">Base para recuperación</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado por administrador</CardTitle>
          <CardDescription>
            {loading
              ? "Cargando admins..."
              : error
                ? error
                : `${admins.length} cuentas administrativas consultadas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Administrador</th>
                  <th className="p-3 text-left font-medium">Roles</th>
                  <th className="p-3 text-left font-medium">TOTP</th>
                  <th className="p-3 text-left font-medium">OTP SMS</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => {
                  const hasMfa = admin.totp_enabled || admin.sms_otp_enabled

                  return (
                    <tr key={admin.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <p className="font-medium">{admin.username || admin.email.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(admin.roles || []).map((role) => (
                            <Badge key={role} variant="outline">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={admin.totp_enabled ? "default" : "outline"}>
                          {admin.totp_enabled ? "Activo" : "Pendiente"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={admin.sms_otp_enabled ? "default" : "outline"}>
                          {admin.sms_otp_enabled ? "Activo" : "Pendiente"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={admin.email_verified ? "default" : "outline"}>
                          {admin.email_verified ? "Verificado" : "Pendiente"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={hasMfa ? "default" : "secondary"}>
                          {hasMfa ? "Protegido" : "Requiere MFA"}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem]">
        <CardHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
            <IconShield className="size-6 text-primary" />
          </div>
          <CardTitle>Política pendiente</CardTitle>
          <CardDescription className="leading-6">
            Falta exponer una política centralizada para exigir MFA por rol, dispositivo nuevo
            y acciones sensibles. Por ahora esta pantalla monitorea la cobertura real.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
