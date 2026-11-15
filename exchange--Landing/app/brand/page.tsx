import { BrandPage } from "@/components/company/brand/brand-page"

export const metadata = {
  title: "Guía de Marca | deco-exchange",
  description: "Guía pública de identidad, uso de marca y materiales oficiales de Deco Exchange.",
  alternates: {
    canonical: "/brand",
  },
  openGraph: {
    title: "Guía de Marca | deco-exchange",
    description: "Guía pública de identidad, uso de marca y materiales oficiales de Deco Exchange.",
    type: "website",
    url: "/brand",
  },
}

export default function BrandRoute() {
  return <BrandPage />
}
