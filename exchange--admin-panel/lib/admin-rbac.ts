export const PUNTOS_DECO_RESOLUTION_EXECUTOR_ROLES = ["super_admin", "admin"] as const

export function hasAnyAdminRole(
  userRoles: readonly string[] | undefined,
  allowedRoles: readonly string[],
) {
  if (!userRoles?.length) return false
  return allowedRoles.some((role) => userRoles.includes(role))
}

export function canExecutePuntosDecoResolution(userRoles: readonly string[] | undefined) {
  return hasAnyAdminRole(userRoles, PUNTOS_DECO_RESOLUTION_EXECUTOR_ROLES)
}
