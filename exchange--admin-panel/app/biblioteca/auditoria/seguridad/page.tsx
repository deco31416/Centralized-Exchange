import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function AuditoriaSeguridadPage() {
  return (
    <AdminModulePlaceholderPage
      title="Auditoría de seguridad"
      description="Eventos de acceso, sesión, permisos y actividad sensible."
      state="pending"
      percent={20}
      scopes={[
        { title: "Acceso", description: "Login, MFA, bloqueo y recuperación." },
        { title: "Permisos", description: "Cambios de rol, políticas y acciones admin." },
        { title: "Señales", description: "Intentos anómalos y alertas de riesgo." },
      ]}
    />
  )
}
