import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { SectionCards } from '@/components/section-cards'

export default function Page() {
  return (
    <AuthGuard requiredRoles={['admin', 'super_admin', 'operator']}>
      <DashboardLayout>
        <div className="flex flex-col gap-5 px-4 py-5 md:gap-7 md:py-7 lg:px-6">
          <section className="deco-shell-surface overflow-hidden rounded-[1.5rem] px-6 py-7 md:px-8 md:py-9">
            <div className="max-w-4xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Centro administrativo
              </p>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
                Control operativo de DECO EXCHANGE
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-xl md:leading-8">
                Gestiona usuarios, cumplimiento, custodia, precios y operaciones desde un panel conectado por gateway admin.
              </p>
            </div>
          </section>
          <SectionCards />
          <div>
            <ChartAreaInteractive />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
