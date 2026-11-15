// Configuración de seguridad del admin panel
// El path se lee de las variables de entorno en build time
export const getAuthConfig = () => {
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'logindeco'
  // Base opcional para despliegues donde el BFF viva en otro host.
  // Por defecto usamos same-origin.
  const authApiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE || ''
  
  return {
    // URL ofuscada para el login (configurable vía env)
    adminPath,
    
    // Rate limiting
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    
    // Sesión
    sessionTimeout: 30 * 60 * 1000, // 30 minutos de inactividad
    
    // API endpoints (integración con Exchange--micro-auth)
    apiEndpoints: {
      login: `${authApiBase}/api/auth/login`,
      logout: `${authApiBase}/api/auth/logout`,
      refresh: `${authApiBase}/api/auth/refresh`,
      requestReset: `${authApiBase}/api/auth/request-reset`,
      resetPassword: `${authApiBase}/api/auth/reset-password`,
      verifyOtp: `${authApiBase}/api/auth/verify-otp`,
    },
    
    // Opciones de seguridad
    requireOtp: process.env.NEXT_PUBLIC_REQUIRE_OTP === 'true',
    allowedIPs: process.env.NEXT_PUBLIC_ALLOWED_IPS?.split(',').filter(Boolean) || [],
  } as const
}

// Export para compatibilidad
export const AUTH_CONFIG = getAuthConfig()
export type AuthConfig = ReturnType<typeof getAuthConfig>
