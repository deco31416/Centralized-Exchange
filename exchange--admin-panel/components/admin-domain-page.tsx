import Link from "next/link"

import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AdminDomain } from "@/lib/admin-product-registry"

export function AdminDomainPage({ domain }: { domain: AdminDomain }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="deco-shell-surface overflow-hidden rounded-[1.5rem] px-6 py-7 md:px-8 md:py-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
          {domain.eyebrow}
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
          {domain.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-xl md:leading-8">
          {domain.description}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {domain.modules.map((module) => {
          const Icon = module.icon

          return (
            <Link key={module.href} href={module.href}>
              <Card className="h-full cursor-pointer rounded-[1.5rem] bg-card/90 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgb(15_23_42/0.12)] dark:bg-black/45 dark:hover:shadow-[0_18px_55px_rgb(148_163_184/0.08)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full border bg-background/75">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <ConnectionStatusBadge state={module.state} percent={module.percent} />
                  </div>
                  <CardTitle className="mt-5 text-xl font-extrabold tracking-tight">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <p className="text-sm leading-6 text-muted-foreground">{module.description}</p>
                  <div className="mt-auto space-y-3 rounded-[1.1rem] border bg-background/55 p-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Estado
                      </p>
                      <p className="mt-1 text-sm font-semibold">{module.signal}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Siguiente paso
                      </p>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {module.nextStep}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
