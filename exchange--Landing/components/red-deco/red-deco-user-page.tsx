import { Search } from "lucide-react"

import {
  redDecoControls,
  redDecoLocations,
  redDecoRoutes,
  redDecoServices,
} from "./red-deco-data"
import {
  RedDecoControlCard,
  RedDecoHero,
  RedDecoLocationCard,
  RedDecoPanel,
  RedDecoRouteCard,
  RedDecoSecurityStrip,
  RedDecoServiceCard,
  RedDecoStat,
  RedDecoSummaryRow,
} from "./red-deco-components"

export function RedDecoUserPage() {
  return (
    <div className="space-y-6">
      <RedDecoHero
        eyebrow="Bolsillito · Red Deco"
        title="Efectivo cerca de ti"
        description="Deposita, retira y envia remesas con aliados verificados. Deco protege la direccion exacta, bloquea la tasa por tiempo corto y deja comprobante para cada operacion."
        actionHref="/bolsillito/red-deco/nearby"
        actionText="Buscar punto cercano"
        secondaryHref="/earn/aliado-deco"
        secondaryText="Ser Aliado Deco"
        aside={<RedDecoStat label="Red fisica" value="3 flujos" detail="Deposito, retiro y remesas en una sola experiencia." />}
      />

      <div className="grid gap-3 md:grid-cols-3">
        {redDecoServices.map((service) => {
          const Icon = service.icon
          return (
            <RedDecoServiceCard
              key={service.id}
              description={service.description}
              detail={service.detail}
              href={service.href}
              icon={<Icon className="h-5 w-5" />}
              metric={service.metric}
              title={service.title}
            />
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <RedDecoPanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Cercanos</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Aliados disponibles</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                La lista muestra zona, horario y limites aproximados. La direccion exacta aparece al aceptar una orden.
              </p>
            </div>
            <label className="flex h-10 w-full items-center gap-2 rounded-full border border-foreground bg-foreground px-4 text-sm text-background shadow-sm sm:w-[260px]">
              <Search className="h-4 w-4 shrink-0 text-background/80" />
              <input
                placeholder="Buscar zona"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-background/75"
              />
            </label>
          </div>

          <div className="mt-5 space-y-3">
            {redDecoLocations.map((location) => (
              <RedDecoLocationCard key={location.id} {...location} />
            ))}
          </div>
        </RedDecoPanel>

        <div className="space-y-5">
          <RedDecoPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Simulador</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">100,000 COP</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ejemplo mock para deposito presencial con tasa bloqueada.
            </p>
            <div className="mt-4 space-y-3">
              <RedDecoSummaryRow label="Recibes aprox." value="24.80 USDT" />
              <RedDecoSummaryRow label="Fee Deco" value="1.2%" />
              <RedDecoSummaryRow label="Comision aliado" value="1,200 COP" />
              <RedDecoSummaryRow label="Expira" value="08:42" />
            </div>
          </RedDecoPanel>

          <RedDecoPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Controles</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Operacion protegida</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {redDecoControls.map((control) => {
                const Icon = control.icon
                return <RedDecoControlCard key={control.label} icon={<Icon className="h-4 w-4" />} label={control.label} value={control.value} />
              })}
            </div>
          </RedDecoPanel>
        </div>
      </div>

      <RedDecoPanel>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Remesas</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Rutas entre paises</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Deco puede combinar punto origen, P2P, banco, wallet, stablecoin o punto destino para bajar costo.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {redDecoRoutes.map((route) => (
            <RedDecoRouteCard key={route.id} {...route} />
          ))}
        </div>
      </RedDecoPanel>

      <RedDecoSecurityStrip />
    </div>
  )
}
