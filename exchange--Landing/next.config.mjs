const isProd = process.env.NODE_ENV === "production"

function buildContentSecurityPolicy() {
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const pricingUrl = process.env.PRICING_AGGREGATOR_URL || ""
  const assetRegistryUrl = process.env.ASSET_REGISTRY_URL || ""
  const explicitConnectSources = [gatewayUrl, pricingUrl, assetRegistryUrl]
    .map((url) => {
      try {
        return url ? new URL(url).origin : ""
      } catch {
        return ""
      }
    })
    .filter(Boolean)

  const connectSrc = [
    "'self'",
    ...explicitConnectSources,
    "https://*.tradingview.com",
    "wss://*.tradingview.com",
    ...(isProd
      ? []
      : [
          "http://localhost:*",
          "http://127.0.0.1:*",
          "ws://localhost:*",
          "ws://127.0.0.1:*",
        ]),
  ]

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isProd ? [] : ["'unsafe-eval'"]),
  ]

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${Array.from(new Set(connectSrc)).join(" ")}`,
    "frame-src 'self' https://s.tradingview.com https://www.tradingview.com https://*.tradingview.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self' blob:",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ]

  return directives.join("; ")
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    const baseHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(self), microphone=(), geolocation=(self), browsing-topics=()",
      },
    ]

    const productionHeaders = isProd
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(),
          },
        ]
      : []

    return [
      {
        source: "/(.*)",
        headers: [...baseHeaders, ...productionHeaders],
      },
    ]
  },
}

export default nextConfig
