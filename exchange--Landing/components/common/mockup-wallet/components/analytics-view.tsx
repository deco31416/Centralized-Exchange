"use client"

import { useState } from "react"
import { ArrowLeft, Bell, Calendar, Download } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer } from "recharts"

// Datos de ejemplo para el rendimiento de la cartera.
// Definidos fuera del componente para que sean estables entre renders (sin Math.random).
const portfolioData = {
  week: Array(7)
    .fill(0)
    .map((_, i) => ({
      day: i,
      value: 10000 + Math.sin(i * 2.7 + 1.1) * 1000 + i * 100,
    })),
  month: Array(30)
    .fill(0)
    .map((_, i) => ({
      day: i,
      value: 10000 + Math.sin(i * 1.3 + 0.5) * 1500 + i * 50,
    })),
  year: Array(12)
    .fill(0)
    .map((_, i) => ({
      month: i,
      value: 10000 + Math.sin(i * 0.9 + 2.1) * 2500 + i * 200,
    })),
  all: Array(24)
    .fill(0)
    .map((_, i) => ({
      month: i,
      value: 5000 + Math.sin(i * 0.6 + 1.8) * 5000 + i * 300,
    })),
}

export default function AnalyticsView({
  onAction,
  onBack,
}: { onAction: (action: string) => void; onBack: () => void }) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year" | "all">("month")

  // Datos para la distribución de activos
  const assetDistribution = [
    { name: "BTC", value: 45, color: "#F7931A" },
    { name: "ETH", value: 25, color: "#627EEA" },
    { name: "BNB", value: 15, color: "#F3BA2F" },
    { name: "USDC", value: 10, color: "#2775CA" },
    { name: "Otros", value: 5, color: "#6C7284" },
  ]

  // Datos para el volumen de trading
  const tradingVolumeData = [
    { name: "Lun", volume: 1200 },
    { name: "Mar", volume: 1900 },
    { name: "Mié", volume: 800 },
    { name: "Jue", volume: 1600 },
    { name: "Vie", volume: 2400 },
    { name: "Sáb", volume: 1100 },
    { name: "Dom", volume: 700 },
  ]

  // Calcular el cambio en el valor de la cartera
  const currentData = portfolioData[timeframe]
  const firstValue = currentData[0].value
  const lastValue = currentData[currentData.length - 1].value
  const changePercent = ((lastValue - firstValue) / firstValue) * 100
  const isPositive = changePercent >= 0

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-white ml-3">Análisis de Cartera</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto mock-wallet-scroll pb-20">
        {/* Resumen de la cartera */}
        <div className="px-4 py-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Valor total</h3>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                <select
                  className="bg-transparent text-xs text-gray-400 focus:outline-none"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                >
                  <option value="week">Semana</option>
                  <option value="month">Mes</option>
                  <option value="year">Año</option>
                  <option value="all">Todo</option>
                </select>
              </div>
            </div>

            <div className="mb-2">
              <span className="text-2xl font-bold text-white">${lastValue.toLocaleString()}</span>
              <span className={`ml-2 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#portfolioGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Distribución de activos */}
        <div className="px-4 py-2">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">Distribución de activos</h3>

            <div className="flex items-center">
              <div className="w-[120px] h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={assetDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assetDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 ml-4">
                {assetDistribution.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: asset.color }}></div>
                      <span className="text-xs text-gray-300">{asset.name}</span>
                    </div>
                    <span className="text-xs text-white">{asset.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Volumen de trading */}
        <div className="px-4 py-2">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">Volumen de trading (7 días)</h3>

            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tradingVolumeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <Bar dataKey="volume" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Métricas de rendimiento */}
        <div className="px-4 py-2">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Métricas de rendimiento</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-sm text-gray-400">ROI (30 días)</span>
                <span className="text-sm text-green-500">+12.4%</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-sm text-gray-400">Volatilidad</span>
                <span className="text-sm text-white">Media</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-sm text-gray-400">Sharpe Ratio</span>
                <span className="text-sm text-white">1.8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Mejor activo</span>
                <span className="text-sm text-white">BTC (+18.5%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-4 py-4">
          <button
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mb-3"
            onClick={() => onAction("export-report")}
          >
            Exportar informe
          </button>

          <button
            className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium"
            onClick={() => onAction("portfolio-optimization")}
          >
            Optimizar cartera
          </button>
        </div>
      </div>
    </div>
  )
}
