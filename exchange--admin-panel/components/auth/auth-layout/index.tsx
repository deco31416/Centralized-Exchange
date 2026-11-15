'use client'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg shadow-lg border p-8">
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && (
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          {children}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} DECO EXCHANGE Admin. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
