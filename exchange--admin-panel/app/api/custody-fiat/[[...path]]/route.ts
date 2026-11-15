import { createAdminProxyHandler } from "../../_shared/proxy"

export const dynamic = "force-dynamic"

export const { GET, POST, PUT, PATCH, DELETE } = createAdminProxyHandler(
  "custody-fiat",
  {
    sensitiveRoutes: [
      {
        methods: ["POST"],
        pathIncludes: "points-deco-settlement-intents",
        requiredRoles: ["super_admin", "admin"],
        label: "Puntos Deco fiat settlement provider action",
        requiresEmailReauth: true,
      },
    ],
  },
)
