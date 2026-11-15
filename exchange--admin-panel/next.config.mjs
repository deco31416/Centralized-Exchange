import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  
  // 🔒 SECURITY HEADERS CRÍTICOS PARA EXCHANGE
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS - Forzar HTTPS en producción (2 años)
          ...(isProd ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }] : []),
          
          // CSP - Content Security Policy estricto
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com", // unsafe-inline necesario para Next.js
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              "frame-ancestors 'none'", // No permitir iframes
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
          
          // X-Frame-Options - Prevenir clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          
          // X-Content-Type-Options - Prevenir MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          
          // X-DNS-Prefetch-Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          
          // Referrer-Policy - No enviar referrer a externos
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          
          // Permissions-Policy - Deshabilitar features peligrosos
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()', // Bloquear FLoC de Google
              'payment=()'
            ].join(', ')
          },
          
          // X-XSS-Protection (legacy pero útil)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
        ],
      },
    ]
  },
}

export default nextConfig
