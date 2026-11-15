import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function CryptoPrivateKeysPage() {
  return (
    <AdminModulePlaceholderPage
      title="Claves privadas (HSM)"
      description="Gobierno de claves, firmas y acceso a infraestructura HSM."
      state="pending"
      percent={10}
      scopes={[
        { title: "HSM", description: "Estado de módulos, políticas y rotación." },
        { title: "Firmas", description: "Flujos de autorización y evidencias." },
        { title: "Acceso", description: "Roles, auditoría y controles de emergencia." },
      ]}
    />
  )
}
