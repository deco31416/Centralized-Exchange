import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationsMenu } from '@/components/header/notifications-menu'
import { ReportsMenu } from '@/components/header/reports-menu'
import { SettingsMenu } from '@/components/header/settings-menu'
import { ThemeToggle } from '@/components/header/theme-toggle'
import { MonitoringMenu } from '@/components/header/monitoring-menu'
import { UserMenu } from '@/components/header/user-menu'
import { Badge } from '@/components/ui/badge'

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-40 mx-3 flex h-(--header-height) shrink-0 items-center gap-2 rounded-[1.25rem] border bg-background/78 px-2 shadow-[0_18px_60px_rgb(15_23_42/0.10)] backdrop-blur-xl transition-[width,height] ease-linear dark:bg-black/70 dark:shadow-[0_18px_70px_rgb(148_163_184/0.10)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) lg:mx-4">
      <div className="flex w-full items-center gap-2 px-2 lg:gap-3 lg:px-4">
        <SidebarTrigger className="-ml-1 rounded-full border bg-background/70" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 hidden sm:block"
        />
        <div className="hidden min-w-0 flex-col md:flex">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-bold tracking-tight">Centro de control</h1>
            <Badge variant="outline" className="rounded-full border-primary/35 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Gateway admin
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            Operacion, seguridad y monitoreo de DECO EXCHANGE
          </p>
        </div>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <NotificationsMenu />
          <ReportsMenu />
          <div className="hidden sm:flex items-center gap-0.5 sm:gap-1">
            <SettingsMenu />
            <ThemeToggle />
            <MonitoringMenu />
          </div>
          <Separator
            orientation="vertical"
            className="mx-1 sm:mx-2 data-[orientation=vertical]:h-6 hidden sm:block"
          />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
