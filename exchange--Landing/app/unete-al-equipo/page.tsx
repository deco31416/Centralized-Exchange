import { CareersPage } from "@/components/company/careers/careers-page"

export const metadata = {
  title: "Únete al equipo | deco-exchange",
  description: "Página pública para conocer áreas de colaboración y prevención de fraude laboral en Deco Exchange.",
  alternates: {
    canonical: "/unete-al-equipo",
  },
  openGraph: {
    title: "Únete al equipo | deco-exchange",
    description: "Página pública para conocer áreas de colaboración y prevención de fraude laboral en Deco Exchange.",
    type: "website",
    url: "/unete-al-equipo",
  },
}

export default function CareersRoute() {
  return <CareersPage />
}
