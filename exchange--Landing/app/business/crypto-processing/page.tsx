import { CryptoProcessingPage } from "@/components/company/business/crypto-processing-page"

export const metadata = {
  title: "Procesamiento Cripto | deco-exchange",
  description: "Procesamiento cripto para comercios, checkout, liquidación y conciliación dentro de Deco Exchange.",
  alternates: {
    canonical: "/business/crypto-processing",
  },
  openGraph: {
    title: "Procesamiento Cripto | deco-exchange",
    description: "Procesamiento cripto para comercios, checkout, liquidación y conciliación dentro de Deco Exchange.",
    type: "website",
    url: "/business/crypto-processing",
  },
}

export default function CryptoProcessingRoute() {
  return <CryptoProcessingPage />
}
