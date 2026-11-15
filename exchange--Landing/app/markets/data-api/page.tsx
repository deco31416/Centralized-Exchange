import { redirect } from "next/navigation"

export const metadata = {
  title: "Data API redirige a Developers | deco-exchange",
  description: "La API de datos ahora vive en Developers.",
}

export default function DataApiPage() {
  redirect("/developers/data-api")
}
