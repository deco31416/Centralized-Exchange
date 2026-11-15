import RendimientoContainer from "@/components/rendimiento/rendimiento-container"

export const metadata = {
  title: "Actividad de Rendimiento | deco-exchange",
  description: "Posiciones, vencimientos, actividad y retiros flexibles de productos de rendimiento.",
}

export default function RendimientoActivityPage() {
  return <RendimientoContainer initialView="activity" />
}
