import { StatusPage } from "@/components/status/status-page"

export const metadata = {
  title: "Estado del Servicio | deco-exchange",
  description: "Estado operativo de servicios, APIs, trading, wallet, depósitos, retiros y soporte de Deco Exchange.",
  alternates: {
    canonical: "/status",
  },
  openGraph: {
    title: "Estado del Servicio | deco-exchange",
    description: "Estado operativo de servicios, APIs, trading, wallet, depósitos, retiros y soporte de Deco Exchange.",
    type: "website",
    url: "/status",
  },
}

export default function StatusRoute() {
  return <StatusPage />
}
