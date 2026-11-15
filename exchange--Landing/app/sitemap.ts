import type { MetadataRoute } from "next"
import { catalogAssets, paymentMethods } from "@/components/assets/assets-data"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deco31416.com"

const staticRoutes = [
  "",
  "/roadmap",
  "/unete-al-equipo",
  "/brand",
  "/business/crypto-processing",
  "/business/ecommerce-plugins",
  "/status",
  "/assets",
  "/assets/crypto",
  "/assets/fiat",
  "/assets/tokens",
  "/assets/payment-methods",
]

const legalRoutes = [
  "/legals/roadmap",
  "/legals/unete-al-equipo",
  "/legals/brand",
  "/legals/crypto-processing",
  "/legals/ecommerce-plugins",
]

function getChangeFrequency(route: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route === "/status") return "hourly"
  if (route === "" || route === "/roadmap") return "weekly"
  return "monthly"
}

function getPriority(route: string) {
  if (route === "") return 1
  if (route === "/status") return 0.9
  if (route.startsWith("/business")) return 0.85
  if (route === "/brand" || route === "/roadmap" || route === "/unete-al-equipo") return 0.8
  if (route.startsWith("/assets")) return 0.8
  if (route.startsWith("/legals")) return 0.6
  return 0.6
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const assetRoutes = catalogAssets.map((asset) => `/assets/${asset.slug}`)
  const paymentMethodRoutes = paymentMethods.map((method) => `/assets/payment-methods/${method.slug}`)

  return [...staticRoutes, ...legalRoutes, ...assetRoutes, ...paymentMethodRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: getChangeFrequency(route),
    priority: getPriority(route),
  }))
}
