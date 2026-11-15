import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function SoporteBaseConocimientoPage() {
  return (
    <AdminModulePlaceholderPage
      title="Base de conocimiento"
      description="Artículos, guías y contenido de soporte para usuarios y equipo interno."
      state="pending"
      percent={20}
      scopes={[
        { title: "Artículos", description: "Contenido por producto, país y tipo de usuario." },
        { title: "Publicación", description: "Borrador, revisión y versión publicada." },
        { title: "Búsqueda", description: "Índice para Help Center y panel interno." },
      ]}
    />
  )
}
