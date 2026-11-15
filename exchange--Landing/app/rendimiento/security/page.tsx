import { redirect } from "next/navigation"

export const metadata = {
  title: "Reservas | deco-exchange",
  description: "Redireccion temporal hacia la vista de reservas de rendimiento.",
}

export default function RendimientoSecurityPage() {
  redirect("/rendimiento/reservas")
}
