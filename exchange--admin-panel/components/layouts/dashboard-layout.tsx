import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

/**
 * Layout wrapper para páginas del dashboard
 * Incluye sidebar, header, y navegación
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">DECOEXCHANGE Admin</h1>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="/api/auth/logout"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cerrar Sesión
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">{children}</main>
    </div>
  )
}
