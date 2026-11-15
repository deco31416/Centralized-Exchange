import DataApiContainer from "@/components/markets/data-api/data-api-container"

export const metadata = {
  title: "Data API | Developers | deco-exchange",
  description: "Conecta precios, libros, candles, pares y logs desde el portal Developers.",
}

export default function DevelopersDataApiPage() {
  return <DataApiContainer />
}
