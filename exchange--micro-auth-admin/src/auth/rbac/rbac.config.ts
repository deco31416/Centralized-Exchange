/**
 * 🔒 Sistema RBAC para Admin Panel (Exchange)
 * 
 * Jerarquía de roles:
 * super_admin > admin > operator > viewer > support
 * 
 * Permisos granulares por módulo del exchange.
 */

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  COMPLIANCE_OFFICER = 'compliance_officer',
  RISK_ANALYST = 'risk_analyst',
  SUPPORT_AGENT = 'support_agent',
  VIEWER = 'viewer',
}

export enum Permission {
  // ============ USUARIOS ============
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_EDIT = 'user:edit',
  USER_DELETE = 'user:delete',
  USER_SUSPEND = 'user:suspend',
  USER_KYC_VERIFY = 'user:kyc:verify',
  USER_KYC_REJECT = 'user:kyc:reject',
  USER_LIMITS_EDIT = 'user:limits:edit',
  
  // ============ FINANZAS ============
  DEPOSIT_VIEW = 'deposit:view',
  DEPOSIT_APPROVE = 'deposit:approve',
  DEPOSIT_REJECT = 'deposit:reject',
  
  WITHDRAWAL_VIEW = 'withdrawal:view',
  WITHDRAWAL_APPROVE = 'withdrawal:approve',
  WITHDRAWAL_REJECT = 'withdrawal:reject',
  WITHDRAWAL_MANUAL = 'withdrawal:manual',
  
  BALANCE_VIEW = 'balance:view',
  BALANCE_ADJUST = 'balance:adjust',
  
  // ============ TRADING ============
  ORDER_VIEW = 'order:view',
  ORDER_CANCEL = 'order:cancel',
  
  TRADE_VIEW = 'trade:view',
  TRADE_REVERSE = 'trade:reverse',
  
  // ============ LIQUIDEZ ============
  LIQUIDITY_VIEW = 'liquidity:view',
  LIQUIDITY_MANAGE = 'liquidity:manage',
  
  PROVIDER_VIEW = 'provider:view',
  PROVIDER_MANAGE = 'provider:manage',
  
  // ============ CUSTODIA ============
  CUSTODY_VIEW = 'custody:view',
  CUSTODY_MANAGE = 'custody:manage',
  CUSTODY_COLD_WALLET = 'custody:cold_wallet',
  
  HOT_WALLET_VIEW = 'hot_wallet:view',
  HOT_WALLET_MANAGE = 'hot_wallet:manage',
  
  // ============ COMPLIANCE ============
  COMPLIANCE_VIEW = 'compliance:view',
  COMPLIANCE_REPORTS = 'compliance:reports',
  COMPLIANCE_RULES = 'compliance:rules',
  
  AML_VIEW = 'aml:view',
  AML_FLAG = 'aml:flag',
  AML_INVESTIGATE = 'aml:investigate',
  
  // ============ CONFIGURACIÓN ============
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',
  
  FEE_VIEW = 'fee:view',
  FEE_EDIT = 'fee:edit',
  
  PAIR_VIEW = 'pair:view',
  PAIR_MANAGE = 'pair:manage',
  
  ASSET_VIEW = 'asset:view',
  ASSET_MANAGE = 'asset:manage',
  
  // ============ SISTEMA ============
  ADMIN_VIEW = 'admin:view',
  ADMIN_CREATE = 'admin:create',
  ADMIN_EDIT = 'admin:edit',
  ADMIN_DELETE = 'admin:delete',
  
  ROLE_VIEW = 'role:view',
  ROLE_ASSIGN = 'role:assign',
  
  AUDIT_VIEW = 'audit:view',
  AUDIT_EXPORT = 'audit:export',
  
  SYSTEM_RESTART = 'system:restart',
  SYSTEM_MAINTENANCE = 'system:maintenance',
  
  // ============ NOTIFICACIONES ============
  NOTIFICATION_VIEW = 'notification:view',
  NOTIFICATION_SEND = 'notification:send',
  NOTIFICATION_TEMPLATE = 'notification:template',
}

/**
 * Mapa de roles a permisos
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission), // TODOS los permisos
  
  [AdminRole.ADMIN]: [
    // Usuarios
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_EDIT,
    Permission.USER_SUSPEND,
    Permission.USER_KYC_VERIFY,
    Permission.USER_KYC_REJECT,
    Permission.USER_LIMITS_EDIT,
    
    // Finanzas
    Permission.DEPOSIT_VIEW,
    Permission.DEPOSIT_APPROVE,
    Permission.DEPOSIT_REJECT,
    Permission.WITHDRAWAL_VIEW,
    Permission.WITHDRAWAL_APPROVE,
    Permission.WITHDRAWAL_REJECT,
    Permission.BALANCE_VIEW,
    Permission.BALANCE_ADJUST,
    
    // Trading
    Permission.ORDER_VIEW,
    Permission.ORDER_CANCEL,
    Permission.TRADE_VIEW,
    
    // Liquidez
    Permission.LIQUIDITY_VIEW,
    Permission.LIQUIDITY_MANAGE,
    Permission.PROVIDER_VIEW,
    Permission.PROVIDER_MANAGE,
    
    // Custodia
    Permission.CUSTODY_VIEW,
    Permission.CUSTODY_MANAGE,
    Permission.HOT_WALLET_VIEW,
    Permission.HOT_WALLET_MANAGE,
    
    // Compliance
    Permission.COMPLIANCE_VIEW,
    Permission.COMPLIANCE_REPORTS,
    Permission.AML_VIEW,
    Permission.AML_FLAG,
    
    // Configuración
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,
    Permission.FEE_VIEW,
    Permission.FEE_EDIT,
    Permission.PAIR_VIEW,
    Permission.PAIR_MANAGE,
    Permission.ASSET_VIEW,
    Permission.ASSET_MANAGE,
    
    // Sistema
    Permission.ADMIN_VIEW,
    Permission.ROLE_VIEW,
    Permission.AUDIT_VIEW,
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
  ],
  
  [AdminRole.OPERATOR]: [
    // Usuarios
    Permission.USER_VIEW,
    Permission.USER_EDIT,
    Permission.USER_SUSPEND,
    
    // Finanzas
    Permission.DEPOSIT_VIEW,
    Permission.DEPOSIT_APPROVE,
    Permission.WITHDRAWAL_VIEW,
    Permission.WITHDRAWAL_APPROVE,
    Permission.BALANCE_VIEW,
    
    // Trading
    Permission.ORDER_VIEW,
    Permission.ORDER_CANCEL,
    Permission.TRADE_VIEW,
    
    // Liquidez
    Permission.LIQUIDITY_VIEW,
    Permission.PROVIDER_VIEW,
    
    // Custodia
    Permission.CUSTODY_VIEW,
    Permission.HOT_WALLET_VIEW,
    
    // Compliance
    Permission.COMPLIANCE_VIEW,
    Permission.AML_VIEW,
    
    // Configuración
    Permission.SETTINGS_VIEW,
    Permission.FEE_VIEW,
    Permission.PAIR_VIEW,
    Permission.ASSET_VIEW,
    
    // Sistema
    Permission.AUDIT_VIEW,
    Permission.NOTIFICATION_VIEW,
  ],
  
  [AdminRole.COMPLIANCE_OFFICER]: [
    // Usuarios
    Permission.USER_VIEW,
    Permission.USER_KYC_VERIFY,
    Permission.USER_KYC_REJECT,
    Permission.USER_SUSPEND,
    
    // Finanzas
    Permission.DEPOSIT_VIEW,
    Permission.WITHDRAWAL_VIEW,
    Permission.BALANCE_VIEW,
    
    // Trading
    Permission.ORDER_VIEW,
    Permission.TRADE_VIEW,
    
    // Compliance (TODOS)
    Permission.COMPLIANCE_VIEW,
    Permission.COMPLIANCE_REPORTS,
    Permission.COMPLIANCE_RULES,
    Permission.AML_VIEW,
    Permission.AML_FLAG,
    Permission.AML_INVESTIGATE,
    
    // Sistema
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT,
  ],
  
  [AdminRole.RISK_ANALYST]: [
    // Usuarios
    Permission.USER_VIEW,
    
    // Finanzas
    Permission.DEPOSIT_VIEW,
    Permission.WITHDRAWAL_VIEW,
    Permission.BALANCE_VIEW,
    
    // Trading
    Permission.ORDER_VIEW,
    Permission.TRADE_VIEW,
    
    // Liquidez
    Permission.LIQUIDITY_VIEW,
    Permission.PROVIDER_VIEW,
    
    // Compliance
    Permission.COMPLIANCE_VIEW,
    Permission.AML_VIEW,
    
    // Sistema
    Permission.AUDIT_VIEW,
  ],
  
  [AdminRole.SUPPORT_AGENT]: [
    // Usuarios
    Permission.USER_VIEW,
    Permission.USER_EDIT,
    
    // Finanzas
    Permission.DEPOSIT_VIEW,
    Permission.WITHDRAWAL_VIEW,
    Permission.BALANCE_VIEW,
    
    // Trading
    Permission.ORDER_VIEW,
    Permission.TRADE_VIEW,
    
    // Sistema
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_SEND,
  ],
  
  [AdminRole.VIEWER]: [
    // Solo lectura
    Permission.USER_VIEW,
    Permission.DEPOSIT_VIEW,
    Permission.WITHDRAWAL_VIEW,
    Permission.BALANCE_VIEW,
    Permission.ORDER_VIEW,
    Permission.TRADE_VIEW,
    Permission.LIQUIDITY_VIEW,
    Permission.CUSTODY_VIEW,
    Permission.COMPLIANCE_VIEW,
    Permission.SETTINGS_VIEW,
    Permission.FEE_VIEW,
    Permission.PAIR_VIEW,
    Permission.ASSET_VIEW,
    Permission.AUDIT_VIEW,
  ],
}

/**
 * Jerarquía de roles (para heredar permisos de roles superiores)
 */
export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  [AdminRole.SUPER_ADMIN]: 100,
  [AdminRole.ADMIN]: 80,
  [AdminRole.OPERATOR]: 60,
  [AdminRole.COMPLIANCE_OFFICER]: 50,
  [AdminRole.RISK_ANALYST]: 40,
  [AdminRole.SUPPORT_AGENT]: 20,
  [AdminRole.VIEWER]: 10,
}

/**
 * Verificar si un rol tiene un permiso específico
 */
export function hasPermission(roles: string[], permission: Permission): boolean {
  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role as AdminRole]
    if (permissions?.includes(permission)) {
      return true
    }
  }
  return false
}

/**
 * Obtener todos los permisos de un conjunto de roles (sin duplicados)
 */
export function getAllPermissions(roles: string[]): Permission[] {
  const permissionsSet = new Set<Permission>()
  
  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role as AdminRole] || []
    permissions.forEach(p => permissionsSet.add(p))
  }
  
  return Array.from(permissionsSet)
}

/**
 * Verificar si un rol puede asignar otro rol (based on hierarchy)
 */
export function canAssignRole(
  assignerRoles: string[],
  targetRole: AdminRole
): boolean {
  const maxHierarchy = Math.max(
    ...assignerRoles.map(r => ROLE_HIERARCHY[r as AdminRole] || 0)
  )
  const targetHierarchy = ROLE_HIERARCHY[targetRole]
  
  // Solo puedes asignar roles de nivel inferior al tuyo
  return maxHierarchy > targetHierarchy
}

/**
 * Verificar si un rol puede modificar permisos de otro usuario
 */
export function canModifyUser(
  modifierRoles: string[],
  targetUserRoles: string[]
): boolean {
  const modifierMaxHierarchy = Math.max(
    ...modifierRoles.map(r => ROLE_HIERARCHY[r as AdminRole] || 0)
  )
  const targetMaxHierarchy = Math.max(
    ...targetUserRoles.map(r => ROLE_HIERARCHY[r as AdminRole] || 0)
  )
  
  // Solo puedes modificar usuarios de nivel inferior
  return modifierMaxHierarchy > targetMaxHierarchy
}
