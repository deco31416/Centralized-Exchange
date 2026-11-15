import { EcommercePluginsPage } from "@/components/company/business/ecommerce-plugins-page"

export const metadata = {
  title: "E-Commerce plugins | deco-exchange",
  description: "Plugins, widgets y SDKs de Deco Exchange para comercios e integradores.",
  alternates: {
    canonical: "/business/ecommerce-plugins",
  },
  openGraph: {
    title: "E-Commerce plugins | deco-exchange",
    description: "Plugins, widgets y SDKs de Deco Exchange para comercios e integradores.",
    type: "website",
    url: "/business/ecommerce-plugins",
  },
}

export default function EcommercePluginsRoute() {
  return <EcommercePluginsPage />
}
