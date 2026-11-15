import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

import { getAdminGatewayBaseUrl } from "../../_shared/gateway"

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get("admin_token")?.value

  if (!adminToken) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { path } = await context.params
  const subPath = path?.join("/") || "status"
  const gatewayBase = getAdminGatewayBaseUrl()
  const url = `${gatewayBase}/auth/v2/reauth/${subPath}${req.nextUrl.search || ""}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${adminToken}`,
  }

  const contentType = req.headers.get("content-type")
  if (contentType) headers["content-type"] = contentType

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text()
    if (body) fetchOptions.body = body
  }

  const upstream = await fetch(url, fetchOptions).catch(() => null)
  if (!upstream) {
    return NextResponse.json(
      {
        success: false,
        error: "Gateway admin no disponible para reautenticación",
        code: "GATEWAY_UNAVAILABLE",
      },
      { status: 503 },
    )
  }

  const data = await upstream.json().catch(() => null)
  if (data === null) {
    return new NextResponse(null, { status: upstream.status })
  }

  return NextResponse.json(data, { status: upstream.status })
}

export { handler as GET, handler as POST }
