import { RoadmapPage } from "@/components/company/roadmap/roadmap-page"

export const metadata = {
  title: "Roadmap Deco | deco-exchange",
  description: "Roadmap público de producto, fases y dependencias de Deco Exchange.",
  alternates: {
    canonical: "/roadmap",
  },
  openGraph: {
    title: "Roadmap Deco | deco-exchange",
    description: "Roadmap público de producto, fases y dependencias de Deco Exchange.",
    type: "website",
    url: "/roadmap",
  },
}

export default function RoadmapRoute() {
  return <RoadmapPage />
}
