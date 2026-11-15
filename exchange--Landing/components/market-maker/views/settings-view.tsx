"use client"

import { MarketMakerCard } from "../market-maker-card"

export function SettingsView() {
  return (
    <div className="space-y-5">
      <MarketMakerCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mesa de liquidez</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Perfil comercial</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Presenta tu capacidad OTC con cobertura, cupo, activos y condiciones para negociar con compradores grandes o con la mesa Deco.
            </p>
          </div>
          <span className="w-fit rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground">
            Estado: listo para revisar
          </span>
        </div>
      </MarketMakerCard>

      <div className="grid gap-3 lg:grid-cols-4">
        {[
          ["Tipo de mesa", "Mesa OTC", "Liquidez profesional"],
          ["Cupo visible", "100M USDT", "Capacidad declarada"],
          ["Cobertura", "COL · USA · Global", "Mercados activos"],
          ["Respuesta", "15-30 min", "Horario comercial"],
        ].map(([label, value, detail]) => (
          <MarketMakerCard key={label} className="p-4">
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-black text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </MarketMakerCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <MarketMakerCard>
          <h3 className="text-xl font-black text-foreground">Preferencias de operación</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Activos principales", "USDT, USDC, BTC"],
              ["Tickets objetivo", "10K - 20M"],
              ["Precio preferencial", "-3% a +1%"],
              ["Cierre estimado", "T+0 / T+1"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-bold text-muted-foreground">{label}</p>
                <p className="mt-1 text-base font-black text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </MarketMakerCard>

        <MarketMakerCard>
          <h3 className="text-xl font-black text-foreground">Acceso premium</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Las mesas con cupo verificado pueden recibir solicitudes privadas, prioridad en acuerdos y exposición ante compradores de alto volumen.
          </p>
          <div className="mt-4 space-y-2">
            {["Cupo confirmado", "Mercados activos", "Historial de cierres"].map((item) => (
              <div key={item} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground">
                {item}
              </div>
            ))}
          </div>
        </MarketMakerCard>
      </div>
    </div>
  )
}
