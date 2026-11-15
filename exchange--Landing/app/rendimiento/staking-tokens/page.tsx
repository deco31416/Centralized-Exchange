import RendimientoContainer from "@/components/rendimiento/rendimiento-container"

export const metadata = {
  title: "Staking de Tokens | deco-exchange",
  description: "Staking de tokens elegibles con rendimiento estimado y riesgo visible.",
}

export default function StakingTokensPage() {
  return <RendimientoContainer initialView="staking" />
}
