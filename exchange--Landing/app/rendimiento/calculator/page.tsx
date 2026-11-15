import RendimientoContainer from "@/components/rendimiento/rendimiento-container"

export const metadata = {
  title: "Calculadora de Retorno | deco-exchange",
  description: "Simula escenarios de rendimiento estimado antes de activar staking o boveda programada.",
}

export default function RendimientoCalculatorPage() {
  return <RendimientoContainer initialView="calculator" />
}
