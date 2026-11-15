"use client"

import * as React from "react"
import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCamera,
  IconChartBar,
  IconCoin,
  IconCurrencyDollar,
  IconDashboard,
  IconDatabase,
  IconExchange,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconReportAnalytics,
  IconReport,
  IconSearch,
  IconSettings,
  IconShield,
  IconTransfer,
  IconTrendingUp,
  IconUsers,
  IconWallet,
  IconLock,
  IconKey,
  IconServer,
  IconActivity,
  IconBell,
  IconMessageCircle,
  IconDroplet,
  IconMail,
  IconMapPin,
  IconApi,
  IconTarget,
  IconShieldCheck,
} from "@tabler/icons-react"

import { AdminLogo } from '@/components/header/admin-logo'
import { NavMain } from '@/components/nav-main'
import { NavOperations } from '@/components/nav-operations'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: "Administrador",
    email: "admin@deco31416.com",
    avatar: "/avatar.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Operaciones",
      url: "/operaciones",
      icon: IconExchange,
    },
    {
      title: "Custodia",
      url: "/custodia",
      icon: IconLock,
    },
    {
      title: "Usuarios y datos",
      url: "/biblioteca",
      icon: IconDatabase,
    },
    {
      title: "Administración",
      url: "/administracion",
      icon: IconShield,
    },
  ],
  dataLibrary: [
    {
      title: "Usuarios",
      url: "/biblioteca/users",
      icon: IconUsers,
      items: [
        { title: "Usuarios Activos", url: "/biblioteca/users/activos" },
        { title: "Usuarios Pendientes", url: "/biblioteca/users/pendientes" },
        { title: "Usuarios Bloqueados", url: "/biblioteca/users/bloqueados" },
        { title: "Usuarios VIP", url: "/biblioteca/users/vip" },
        { title: "Historial de Sesiones", url: "/biblioteca/users/sesiones" },
      ],
    },
    {
      title: "KYC / Cumplimiento",
      url: "/biblioteca/kyc",
      icon: IconShield,
      items: [
        { title: "Verificaciones Pendientes", url: "/biblioteca/kyc/pendientes" },
        { title: "Nivel 1 - Básico", url: "/biblioteca/kyc/nivel-1" },
        { title: "Nivel 2 - Avanzado", url: "/biblioteca/kyc/nivel-2" },
        { title: "Nivel 3 - Institucional", url: "/biblioteca/kyc/nivel-3" },
        { title: "Rechazados", url: "/biblioteca/kyc/rechazados" },
        { title: "Repositorio de Documentos", url: "/biblioteca/kyc/documentos" },
        { title: "Alertas AML", url: "/biblioteca/kyc/aml" },
      ],
    },
    {
      title: "Riesgo",
      url: "/biblioteca/risk",
      icon: IconAlertTriangle,
      items: [
        { title: "Bajo Riesgo", url: "/biblioteca/risk/bajo" },
        { title: "Medio Riesgo", url: "/biblioteca/risk/medio" },
        { title: "Alto Riesgo", url: "/biblioteca/risk/alto" },
        { title: "En Revisión", url: "/biblioteca/risk/revision" },
        { title: "Lista Negra", url: "/biblioteca/risk/blacklist" },
        { title: "Monitoreo en Tiempo Real", url: "/biblioteca/risk/monitoreo" },
      ],
    },
    {
      title: "Perfil financiero",
      url: "/biblioteca/financial",
      icon: IconCurrencyDollar,
      items: [
        { title: "Balances Generales", url: "/biblioteca/financial/balances" },
        { title: "Balances Fiat", url: "/biblioteca/financial/fiat" },
        { title: "Balances Crypto", url: "/biblioteca/financial/crypto" },
        { title: "Límites de Usuario", url: "/biblioteca/financial/limites" },
        { title: "Historial Financiero", url: "/biblioteca/financial/historial" },
        { title: "Reportes Fiscales", url: "/biblioteca/financial/fiscales" },
      ],
    },
    {
      title: "Wallets y ledger",
      url: "/biblioteca/wallets",
      icon: IconWallet,
      items: [
        { title: "Wallets Fiat", url: "/biblioteca/wallets/fiat" },
        { title: "Wallets Crypto", url: "/biblioteca/wallets/crypto" },
        { title: "Hot Wallets", url: "/biblioteca/wallets/hot" },
        { title: "Cold Wallets", url: "/biblioteca/wallets/cold" },
        { title: "Ledger Completo", url: "/biblioteca/wallets/ledger" },
        { title: "Reconciliación", url: "/biblioteca/wallets/reconciliacion" },
      ],
    },
    {
      title: "Activos",
      url: "/biblioteca/assets",
      icon: IconCoin,
      items: [
        { title: "Criptomonedas", url: "/biblioteca/assets/crypto" },
        { title: "Monedas Fiat", url: "/biblioteca/assets/fiat" },
        { title: "Pares de Trading", url: "/biblioteca/assets/pares" },
        { title: "Configuración", url: "/biblioteca/assets/config" },
        { title: "Estado de Redes", url: "/biblioteca/assets/redes" },
        { title: "Canales de Fondeo", url: "/biblioteca/assets/canales-fondeo" },
      ],
    },
    {
      title: "Transacciones",
      url: "/biblioteca/transactions",
      icon: IconExchange,
      items: [
        { title: "Todas las Transacciones", url: "/biblioteca/transactions/todas" },
        { title: "Pendientes", url: "/biblioteca/transactions/pendientes" },
        { title: "Completadas", url: "/biblioteca/transactions/completadas" },
        { title: "Fallidas", url: "/biblioteca/transactions/fallidas" },
        { title: "Disputas", url: "/biblioteca/transactions/disputas" },
        { title: "Reportes", url: "/biblioteca/transactions/reportes" },
      ],
    },
    {
      title: "Auditoría",
      url: "/biblioteca/auditoria",
      icon: IconReportAnalytics,
      items: [
        { title: "Logs de Sistema", url: "/biblioteca/auditoria/logs" },
        { title: "Auditoría de Seguridad", url: "/biblioteca/auditoria/seguridad" },
        { title: "Cambios de Configuración", url: "/biblioteca/auditoria/config" },
        { title: "Eventos Críticos", url: "/biblioteca/auditoria/eventos" },
        { title: "Integridad de Balances", url: "/biblioteca/auditoria/integridad" },
        { title: "Flujos Crypto", url: "/biblioteca/auditoria/crypto-flows" },
        { title: "Flujos Fiat", url: "/biblioteca/auditoria/fiat-flows" },
      ],
    },
  ],
  administracion: [
    {
      title: "Usuarios Administrativos",
      url: "/administracion/usuarios-admin",
      icon: IconUsers,
    },
    {
      title: "Roles y Permisos",
      url: "/administracion/roles-permisos",
      icon: IconKey,
    },
    {
      title: "Control de Acceso",
      url: "/administracion/control-acceso",
      icon: IconShield,
    },
    {
      title: "Actividad Admins",
      url: "/administracion/actividad-admins",
      icon: IconActivity,
    },
    {
      title: "Configurar 2FA/MFA",
      url: "/administracion/config-2fa",
      icon: IconLock,
    },
    {
      title: "Sesiones Activas",
      url: "/administracion/sesiones-activas",
      icon: IconKey,
    },
  ],
  configuracion: [
    {
      title: "Configuración General",
      url: "/configuracion/general",
      icon: IconSettings,
    },
    {
      title: "Pares de Trading",
      url: "/configuracion/pares-trading",
      icon: IconCoin,
    },
    {
      title: "Fees y Comisiones",
      url: "/configuracion/fees",
      icon: IconCurrencyDollar,
    },
    {
      title: "Límites Globales",
      url: "/configuracion/limites",
      icon: IconShield,
    },
    {
      title: "Mantenimiento",
      url: "/configuracion/mantenimiento",
      icon: IconSettings,
    },
    {
      title: "Multi-región",
      url: "/configuracion/multi-region",
      icon: IconServer,
    },
    {
      title: "Config APIs",
      url: "/configuracion/apis",
      icon: IconApi,
    },
  ],
  monitoreo: [
    {
      title: "Dashboard en Vivo",
      url: "/monitoreo/dashboard-vivo",
      icon: IconActivity,
    },
    {
      title: "Alertas del Sistema",
      url: "/monitoreo/alertas",
      icon: IconBell,
    },
    {
      title: "Salud de Servicios",
      url: "/monitoreo/health-checks",
      icon: IconShield,
    },
    {
      title: "Transacciones en Vivo",
      url: "/monitoreo/transacciones",
      icon: IconExchange,
    },
    {
      title: "Order Book Monitor",
      url: "/monitoreo/order-book",
      icon: IconChartBar,
    },
    {
      title: "Hot Wallets Status",
      url: "/monitoreo/hot-wallets",
      icon: IconWallet,
    },
    {
      title: "Blockchain Sync",
      url: "/monitoreo/blockchain-sync",
      icon: IconServer,
    },
  ],
  soporte: [
    {
      title: "Tickets de Usuario",
      url: "/soporte/tickets",
      icon: IconMessageCircle,
    },
    {
      title: "Chat en Vivo",
      url: "/soporte/chat",
      icon: IconMessageCircle,
    },
    {
      title: "Base de Conocimiento",
      url: "/soporte/base-conocimiento",
      icon: IconDatabase,
    },
    {
      title: "FAQs",
      url: "/soporte/faqs",
      icon: IconHelp,
    },
    {
      title: "Respuestas Predefinidas",
      url: "/soporte/respuestas-predefinidas",
      icon: IconFileDescription,
    },
    {
      title: "Métricas",
      url: "/soporte/metricas",
      icon: IconChartBar,
    },
  ],
  liquidez: [
    {
      title: "Proveedores de Liquidez",
      url: "/liquidez/proveedores",
      icon: IconDroplet,
    },
    {
      title: "Conectores a Exchanges",
      url: "/liquidez/conectores",
      icon: IconServer,
    },
    {
      title: "Order Book Management",
      url: "/liquidez/order-book",
      icon: IconChartBar,
    },
    {
      title: "Market Making Bots",
      url: "/liquidez/market-making",
      icon: IconSettings,
    },
    {
      title: "Config de Spreads",
      url: "/liquidez/spreads",
      icon: IconTrendingUp,
    },
    {
      title: "Análisis de Profundidad",
      url: "/liquidez/profundidad",
      icon: IconChartBar,
    },
  ],
  notificaciones: [
    {
      title: "Templates de Email",
      url: "/notificaciones/templates",
      icon: IconMail,
    },
    {
      title: "Notificaciones Push",
      url: "/notificaciones/push",
      icon: IconBell,
    },
    {
      title: "Configuración SMS",
      url: "/notificaciones/sms",
      icon: IconMessageCircle,
    },
    {
      title: "Webhooks",
      url: "/notificaciones/webhooks",
      icon: IconApi,
    },
    {
      title: "Alertas Automáticas",
      url: "/notificaciones/alertas",
      icon: IconAlertTriangle,
    },
    {
      title: "Personalización",
      url: "/notificaciones/personalizacion",
      icon: IconSettings,
    },
  ],
  apiManagement: [
    {
      title: "API Keys de Usuarios",
      url: "/api-management/keys",
      icon: IconKey,
    },
    {
      title: "Rate Limiting",
      url: "/api-management/rate-limiting",
      icon: IconShield,
    },
    {
      title: "Documentación API",
      url: "/api-management/documentacion",
      icon: IconFileDescription,
    },
    {
      title: "Logs de API",
      url: "/api-management/logs",
      icon: IconFileDescription,
    },
    {
      title: "Webhooks Management",
      url: "/api-management/webhooks-api",
      icon: IconApi,
    },
    {
      title: "Sandbox / Testing",
      url: "/api-management/sandbox",
      icon: IconSettings,
    },
  ],
  analytics: [
    {
      title: "Métricas de Negocio",
      url: "/analytics/metricas-negocio",
      icon: IconChartBar,
    },
    {
      title: "Análisis de Usuarios",
      url: "/analytics/usuarios",
      icon: IconUsers,
    },
    {
      title: "Volumen de Trading",
      url: "/analytics/volumen",
      icon: IconTrendingUp,
    },
    {
      title: "Revenue Dashboard",
      url: "/analytics/revenue",
      icon: IconCurrencyDollar,
    },
    {
      title: "KPIs del Exchange",
      url: "/analytics/kpis",
      icon: IconTarget,
    },
    {
      title: "Reportes Personalizados",
      url: "/analytics/reportes",
      icon: IconReport,
    },
  ],
  compliance: [
    {
      title: "Reportes Regulatorios",
      url: "/compliance/reportes-regulatorios",
      icon: IconFileDescription,
    },
    {
      title: "Travel Rule (FATF)",
      url: "/compliance/travel-rule",
      icon: IconTransfer,
    },
    {
      title: "Tax Reporting",
      url: "/compliance/tax-reporting",
      icon: IconReport,
    },
    {
      title: "Config por Jurisdicción",
      url: "/compliance/jurisdicciones",
      icon: IconServer,
    },
    {
      title: "Políticas AML/CTF",
      url: "/compliance/politicas-aml",
      icon: IconShieldCheck,
    },
    {
      title: "Investigaciones",
      url: "/compliance/investigaciones",
      icon: IconSearch,
    },
  ],
  operations: [
    {
      title: "Fondos",
      url: "/operaciones/fondos",
      icon: IconCurrencyDollar,
      items: [
        { title: "Depósitos", url: "/operaciones/fondos/depositos" },
        { title: "Retiros", url: "/operaciones/fondos/retiros" },
        { title: "Remesas", url: "/operaciones/fondos/remesas" },
        { title: "Pagos Comercios", url: "/operaciones/fondos/pagos-comercios" },
      ],
    },
    {
      title: "Transferencias Internas",
      url: "/operaciones/transferencias",
      icon: IconTransfer,
      items: [
        { title: "Usuarios", url: "/operaciones/transferencias/usuarios" },
        { title: "Tiendas", url: "/operaciones/transferencias/tiendas" },
        { title: "QR P2P", url: "/operaciones/transferencias/qr-p2p" },
      ],
    },
    {
      title: "Trading",
      url: "/operaciones/trading",
      icon: IconTrendingUp,
      items: [
        { title: "Spot", url: "/operaciones/trading/spot" },
        { title: "Futuros ⚠️ I+D+i​", url: "/operaciones/trading/futuros" },
        { title: "OTC ⚠️ I+D+i​", url: "/operaciones/trading/otc" },
        { title: "Copy Trading ⚠️ I+D+i​", url: "/operaciones/trading/copy-trading" },
        { title: "Bots ⚠️ I+D+i​", url: "/operaciones/trading/bots" },
      ],
    },
    {
      title: "Intercambio Interno",
      url: "/operaciones/intercambio",
      icon: IconExchange,
      items: [
        { 
          title: "Compras", 
          url: "/operaciones/intercambio/compras",
          items: [
            { title: "Fiat → Crypto", url: "/operaciones/intercambio/compras/fiat-crypto" },
            { title: "Crypto → Fiat", url: "/operaciones/intercambio/compras/crypto-fiat" },
            { title: "Fiat → Fiat", url: "/operaciones/intercambio/compras/fiat-fiat" },
            { title: "Crypto → Crypto", url: "/operaciones/intercambio/compras/crypto-crypto" },
          ],
        },
        { 
          title: "Ventas", 
          url: "/operaciones/intercambio/ventas",
          items: [
            { title: "Fiat → Crypto", url: "/operaciones/intercambio/ventas/fiat-crypto" },
            { title: "Crypto → Fiat", url: "/operaciones/intercambio/ventas/crypto-fiat" },
            { title: "Fiat → Fiat", url: "/operaciones/intercambio/ventas/fiat-fiat" },
            { title: "Crypto → Crypto", url: "/operaciones/intercambio/ventas/crypto-crypto" },
          ],
        },
        { 
          title: "Convertir", 
          url: "/operaciones/intercambio/convertir",
          items: [
            { title: "Fiat → Crypto", url: "/operaciones/intercambio/convertir/fiat-crypto" },
            { title: "Crypto → Fiat", url: "/operaciones/intercambio/convertir/crypto-fiat" },
            { title: "Fiat → Fiat", url: "/operaciones/intercambio/convertir/fiat-fiat" },
            { title: "Crypto → Crypto", url: "/operaciones/intercambio/convertir/crypto-crypto" },
          ],
        },
      ],
    },
    {
      title: "Mercado P2P",
      url: "/operaciones/p2p",
      icon: IconCoin,
      items: [
        { title: "Compras", url: "/operaciones/p2p/compras" },
        { title: "Ventas", url: "/operaciones/p2p/ventas" },
        { title: "Disputas", url: "/operaciones/p2p/disputas" },
        { title: "Reputación", url: "/operaciones/p2p/reputacion" },
      ],
    },
    {
      title: "Puntos Deco",
      url: "/operaciones/puntos-deco",
      icon: IconMapPin,
    },
  ],
  custody: [
    {
      title: "Custodia Crypto",
      url: "/custodia/crypto",
      icon: IconLock,
      items: [
        { title: "Wallets Maestras", url: "/custodia/crypto/master-wallets" },
        { title: "Generador HD de Wallets", url: "/custodia/crypto/hd-generator" },
        { title: "Pool de Wallets Calientes", url: "/custodia/crypto/hot-wallets" },
        { title: "Almacenamiento Frío", url: "/custodia/crypto/cold-storage" },
        { title: "Declaración de Fondos", url: "/custodia/crypto/declaracion-fondos" },
        { title: "Claves Privadas (HSM)", url: "/custodia/crypto/private-keys" },
        { title: "Barrido", url: "/custodia/crypto/sweeping" },
      ],
    },
    {
      title: "Custodia Fiat",
      url: "/custodia/fiat",
      icon: IconBuildingBank,
      items: [
        { title: "Configuración SPEI - STP", url: "/custodia/fiat/spei-config" },
        { title: "Mercado Pago", url: "/custodia/fiat/mercado-pago" },
        { title: "Stripe", url: "/custodia/fiat/stripe" },
        { title: "PayPal", url: "/custodia/fiat/paypal" },
        { title: "Wompi", url: "/custodia/fiat/wompi" },
        { title: "Bre-B", url: "/custodia/fiat/bre-b" },
        { title: "PSE", url: "/custodia/fiat/pse" },
        { title: "PayU", url: "/custodia/fiat/payu" },
        { title: "OpenPay", url: "/custodia/fiat/openpay" },
        { title: "Bancos Conectados", url: "/custodia/fiat/bancos-conectados" },
        { title: "Cuentas Bancarias", url: "/custodia/fiat/cuentas-bancarias" },
        { title: "Declaración de Fondos", url: "/custodia/fiat/declaracion-fondos" },
        { title: "Reconciliación Bancaria", url: "/custodia/fiat/reconciliacion" },
      ],
    },
    {
      title: "Reportes de Custodia",
      url: "/custodia/reports",
      icon: IconReport,
      items: [
        { title: "Hoja de Balance", url: "/custodia/reports/balance-sheet" },
        { title: "Prueba de Reservas", url: "/custodia/reports/proof-of-reserves" },
        { title: "Activos vs Pasivos", url: "/custodia/reports/assets-vs-liabilities" },
        { title: "Registro de Auditoría", url: "/custodia/reports/audit-trail" },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" className="p-3" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-16 rounded-[1.2rem] border bg-background/80 px-3 shadow-[0_12px_35px_rgb(15_23_42/0.08)] dark:bg-black/70"
            >
              <a href="/dashboard">
                <AdminLogo />
                <span className="sr-only">DECO EXCHANGE</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavOperations items={data.operations} />
        <NavOperations items={data.custody} title="Custodia" />
        <NavOperations items={data.dataLibrary} title="Usuarios y datos" />
        <NavOperations items={data.administracion} title="Administración" />
        <NavOperations items={data.configuracion} title="Configuración" />
        <NavOperations items={data.monitoreo} title="Monitoreo" />
        <NavOperations items={data.soporte} title="Soporte" />
        <NavOperations items={data.liquidez} title="Liquidez" />
        <NavOperations items={data.notificaciones} title="Notificaciones" />
        <NavOperations items={data.apiManagement} title="API y webhooks" />
        <NavOperations items={data.analytics} title="Analitica" />
        <NavOperations items={data.compliance} title="Cumplimiento" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
