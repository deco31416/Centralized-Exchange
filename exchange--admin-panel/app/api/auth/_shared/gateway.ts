function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

export function getAdminGatewayBaseUrl(): string {
  const gatewayUrl = process.env.ADMIN_GATEWAY_URL || 'http://localhost:8080'
  const apiPrefix = process.env.ADMIN_GATEWAY_API_PREFIX || '/api/v1'
  return joinUrl(gatewayUrl, apiPrefix)
}

export function jsonError(status: number, message: string) {
  return {
    status,
    body: {
      success: false,
      error: message,
    },
  }
}
