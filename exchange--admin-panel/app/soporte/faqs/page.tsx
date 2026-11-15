import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function SoporteFaqsPage() {
  return (
    <AdminModulePlaceholderPage
      title="FAQs"
      description="Preguntas frecuentes, respuestas y publicación por categoría."
      state="pending"
      percent={20}
      scopes={[
        { title: "Categorías", description: "Cuenta, KYC, pagos, P2P, wallet y seguridad." },
        { title: "Contenido", description: "Respuesta corta, guía extendida y enlaces." },
        { title: "Publicación", description: "Control de cambios y versión visible al usuario." },
      ]}
    />
  )
}
