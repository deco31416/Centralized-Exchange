import { ArrowRightLeft, MapPin, QrCode, ReceiptText } from "lucide-react"

import {
  redDecoLocations,
  redDecoRoutes,
} from "./red-deco-data"
import {
  RedDecoHero,
  RedDecoLocationCard,
  RedDecoPanel,
  RedDecoRouteCard,
  RedDecoStat,
  RedDecoSummaryRow,
} from "./red-deco-components"

const flowConfig = {
  deposit: {
    eyebrow: "Bolsillito · Red Deco",
    title: "Depositar efectivo",
    description: "Entrega efectivo con un aliado verificado y recibe saldo Deco, fiat digital o USDT con tasa temporal y comprobante.",
    amountLabel: "Entregas",
    amountValue: "100,000 COP",
    resultLabel: "Recibes aprox.",
    resultValue: "24.80 USDT",
    nextStep: "Confirmar efectivo",
  },
  withdraw: {
    eyebrow: "Bolsillito · Red Deco",
    title: "Retirar efectivo",
    description: "Bloquea saldo Deco, elige un aliado cercano y retira efectivo con QR dinamico, PIN y doble confirmacion.",
    amountLabel: "Usas",
    amountValue: "350,000 COP",
    resultLabel: "Recibes",
    resultValue: "Efectivo local",
    nextStep: "Validar entrega",
  },
  remittance: {
    eyebrow: "Bolsillito · Remesa Red Deco",
    title: "Enviar remesa",
    description: "Envia dinero entre paises con ruta inteligente: aliado origen, P2P, banco, wallet o aliado destino segun costo y disponibilidad.",
    amountLabel: "Envias",
    amountValue: "200,000 COP",
    resultLabel: "Destino aprox.",
    resultValue: "920 MXN",
    nextStep: "Reservar ruta",
  },
  nearby: {
    eyebrow: "Bolsillito · Red Deco",
    title: "Aliados cercanos",
    description: "Consulta zonas, horarios y limites aproximados. La direccion exacta se protege hasta que la orden queda aceptada.",
    amountLabel: "GPS",
    amountValue: "Zona aproximada",
    resultLabel: "Privacidad",
    resultValue: "Direccion protegida",
    nextStep: "Elegir punto",
  },
} as const

export type RedDecoFlowType = keyof typeof flowConfig

export function RedDecoFlowPage({ type }: { type: RedDecoFlowType }) {
  const flow = flowConfig[type]
  const isRemittance = type === "remittance"

  return (
    <div className="space-y-6">
      <RedDecoHero
        eyebrow={flow.eyebrow}
        title={flow.title}
        description={flow.description}
        actionHref="/bolsillito/red-deco"
        actionText="Volver a Red Deco"
        aside={<RedDecoStat label="Mock frontend" value="Guiado" detail="Luego se conecta a ordenes, KYC, rutas y ledger." />}
      />

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <RedDecoPanel>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Orden</p>
          <h2 className="mt-2 text-2xl font-black text-foreground">Resumen operativo</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            El punto no calcula manualmente. Deco define monto, tasa, fee, QR y comprobante.
          </p>
          <div className="mt-5 space-y-3">
            <RedDecoSummaryRow label={flow.amountLabel} value={flow.amountValue} />
            <RedDecoSummaryRow label={flow.resultLabel} value={flow.resultValue} />
            <RedDecoSummaryRow label="Fee estimado" value={isRemittance ? "1.5%" : "1.2%"} />
            <RedDecoSummaryRow label="Estado" value="Cotizado" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Tasa", value: "08:42", icon: ArrowRightLeft },
              { label: "QR", value: "Un uso", icon: QrCode },
              { label: "Recibo", value: "PDF/CSV", icon: ReceiptText },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="mt-3 text-sm font-black text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.value}</p>
                </div>
              )
            })}
          </div>
        </RedDecoPanel>

        <RedDecoPanel>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {isRemittance ? "Rutas destino" : "Aliados compatibles"}
          </p>
          <h2 className="mt-2 text-2xl font-black text-foreground">{flow.nextStep}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isRemittance
              ? "Cada ruta reserva liquidez destino antes de prometer entrega final."
              : "La direccion exacta solo aparece cuando el aliado acepta la operacion."}
          </p>
          <div className="mt-5 space-y-3">
            {isRemittance
              ? redDecoRoutes.map((route) => <RedDecoRouteCard key={route.id} {...route} />)
              : redDecoLocations.map((location) => <RedDecoLocationCard key={location.id} {...location} />)}
          </div>
        </RedDecoPanel>
      </div>

      <RedDecoPanel className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-primary">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-foreground">Privacidad operativa</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            GPS valida cercania, pero la app no expone caja, direccion exacta ni datos sensibles antes de que exista una orden protegida.
          </p>
        </div>
      </RedDecoPanel>
    </div>
  )
}
