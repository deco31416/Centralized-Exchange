import RendimientoContainer from "@/components/rendimiento/rendimiento-container"

export const metadata = {
  title: "Boveda Programada | deco-exchange",
  description: "Bloquea activos por periodos definidos y consulta proyecciones estimadas antes de confirmar.",
}

export default function BovedaProgramadaPage() {
  return <RendimientoContainer initialView="vault" />
}
