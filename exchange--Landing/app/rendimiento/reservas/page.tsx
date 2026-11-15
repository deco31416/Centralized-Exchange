import RendimientoContainer from "@/components/rendimiento/rendimiento-container"

export const metadata = {
  title: "Reservas | deco-exchange",
  description: "Reservas crypto, reservas fiat, fondos de usuarios consolidados y prueba Merkle del usuario.",
}

export default function RendimientoReservasPage() {
  return <RendimientoContainer initialView="reserves" />
}
