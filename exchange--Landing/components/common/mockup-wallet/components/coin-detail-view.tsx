"use client"

import { useState } from "react"
import { ArrowLeft, ChevronDown, MoreHorizontal, Maximize2 } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

// Componente para la vista detallada de una moneda desde el mercado
export default function CoinDetailView({
  coinId,
  onBack,
  marketCoins,
}: {
  coinId: string
  onBack: () => void
  marketCoins: any[]
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"day" | "week" | "month" | "year">("day")

  const coin = marketCoins.find((c) => c.id === coinId)
  if (!coin) return null

  // Generar datos de precios más detallados para la vista
  const generateDetailedPriceData = (basePrice: number, dataPoints: number) => {
    const data = []
    let price = basePrice
    const seed = coinId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)

    for (let i = 0; i < dataPoints; i++) {
      const change = Math.sin(i * 2.7 + seed % 97) * 0.01 * basePrice
      price = price + change
      price = Math.max(price, basePrice * 0.8)

      const date = new Date()
      if (selectedTimeframe === "day") {
        date.setHours(date.getHours() - (24 - i))
        data.push({
          time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          price: price,
        })
      } else if (selectedTimeframe === "week") {
        date.setDate(date.getDate() - (7 - i))
        data.push({
          time: date.toLocaleDateString([], { day: "2-digit", month: "2-digit" }),
          price: price,
        })
      } else if (selectedTimeframe === "month") {
        date.setDate(date.getDate() - (30 - i))
        data.push({
          time: date.toLocaleDateString([], { day: "2-digit", month: "2-digit" }),
          price: price,
        })
      } else {
        date.setMonth(date.getMonth() - (12 - i))
        data.push({
          time: date.toLocaleDateString([], { month: "2-digit", year: "2-digit" }),
          price: price,
        })
      }
    }

    return data
  }

  const priceData = {
    day: generateDetailedPriceData(coin.price, 24),
    week: generateDetailedPriceData(coin.price, 7),
    month: generateDetailedPriceData(coin.price, 30),
    year: generateDetailedPriceData(coin.price, 12),
  }

  const data = priceData[selectedTimeframe]
  const color = coin.color || "#3B82F6"

  // Calcular el cambio de precio
  const firstPrice = data[0].price
  const lastPrice = data[data.length - 1].price
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100
  const isPositive = priceChange >= 0
  const formattedChange = Math.abs(priceChange).toFixed(2)

  return (
    <div className="absolute inset-0 bg-black flex flex-col z-20 overflow-hidden">
      <div className="absolute inset-0 overflow-y-auto mock-wallet-scroll">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-white">{coin.name}</span>
            <button className="text-gray-400 hover:text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Información principal */}
          <div className="flex items-center mb-4">
            <img src={coin.icon || "/placeholder.svg"} alt={coin.name} className="w-12 h-12 rounded-full mr-4" />
            <div>
              <div className="text-xl font-bold text-white">${coin.price.toLocaleString()}</div>
              <div className={`text-sm ${coin.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {coin.change24h >= 0 ? "+" : ""}
                {coin.change24h.toFixed(2)}% (24h)
              </div>
            </div>
          </div>

          {/* Gráfico de precios */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex space-x-4">
                <button
                  className={`text-sm pb-1 ${selectedTimeframe === "day" ? "text-blue-500 font-medium border-b-2 border-blue-500" : "text-gray-400"}`}
                  onClick={() => setSelectedTimeframe("day")}
                >
                  Día
                </button>
                <button
                  className={`text-sm pb-1 ${selectedTimeframe === "week" ? "text-blue-500 font-medium border-b-2 border-blue-500" : "text-gray-400"}`}
                  onClick={() => setSelectedTimeframe("week")}
                >
                  Semana
                </button>
                <button
                  className={`text-sm pb-1 ${selectedTimeframe === "month" ? "text-blue-500 font-medium border-b-2 border-blue-500" : "text-gray-400"}`}
                  onClick={() => setSelectedTimeframe("month")}
                >
                  Mes
                </button>
                <button
                  className={`text-sm pb-1 ${selectedTimeframe === "year" ? "text-blue-500 font-medium border-b-2 border-blue-500" : "text-gray-400"}`}
                  onClick={() => setSelectedTimeframe("year")}
                >
                  Año
                </button>
              </div>
              <button className="text-gray-400">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start mb-2">
              <span className="text-2xl font-bold text-white">${coin.price.toLocaleString()}</span>
              <span className={`ml-2 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? "+" : "-"}
                {formattedChange}%
              </span>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradient-detail-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={color}
                    fillOpacity={1}
                    fill={`url(#gradient-detail-${coin.id})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button className="bg-green-600 text-white py-3 rounded-lg font-medium">Comprar</button>
            <button className="bg-red-600 text-white py-3 rounded-lg font-medium">Vender</button>
          </div>

          {/* Información del mercado */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <h3 className="text-white font-medium mb-3">Información del mercado</h3>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-sm text-gray-400">Precio actual</span>
              <span className="text-sm text-white">${coin.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-sm text-gray-400">Cambio 24h</span>
              <span className={`text-sm ${coin.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {coin.change24h >= 0 ? "+" : ""}
                {coin.change24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-sm text-gray-400">Volumen 24h</span>
              <span className="text-sm text-white">${(coin.volume24h / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-400">Capitalización</span>
              <span className="text-sm text-white">${(coin.marketCap / 1000000000).toFixed(1)}B</span>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <h3 className="text-white font-medium mb-3">Estadísticas</h3>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-sm text-gray-400">Máximo histórico</span>
              <span className="text-sm text-white">${(coin.price * 1.5).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-sm text-gray-400">Mínimo histórico</span>
              <span className="text-sm text-white">${(coin.price * 0.3).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-sm text-gray-400">Suministro circulante</span>
              <span className="text-sm text-white">
                {(coin.marketCap / coin.price).toLocaleString()} {coin.symbol}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-400">Ranking</span>
              <span className="text-sm text-white">#{(marketCoins.findIndex((c) => c.id === coinId) + 1) || 1}</span>
            </div>
          </div>

          {/* Acerca de */}
          <div className="bg-gray-900 rounded-lg p-4 mb-20">
            <h3 className="text-white font-medium mb-3">Acerca de {coin.name}</h3>
            <p className="text-sm text-gray-400">
              {coin.name} ({coin.symbol}) es una criptomoneda que opera en una red descentralizada. Fue creada para
              proporcionar transacciones rápidas y seguras en todo el mundo.
              {coin.isHot && " Actualmente es una de las criptomonedas más populares en el mercado."}
              {coin.isNew &&
                " Es una adición reciente al mercado de criptomonedas con un gran potencial de crecimiento."}
            </p>
            <div className="mt-3">
              <button className="text-blue-500 text-sm flex items-center">
                Leer más <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
