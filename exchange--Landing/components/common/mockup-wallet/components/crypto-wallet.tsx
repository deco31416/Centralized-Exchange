"use client"

import { useState, useEffect } from "react"
import {
  ArrowDown,
  ArrowUp,
  Bell,
  ChevronDown,
  Circle,
  Cog,
  Eye,
  EyeOff,
  Home,
  LineChart,
  Layers,
  Plus,
  RefreshCw,
  Search,
  User,
  Wallet,
  ArrowLeft,
  MoreHorizontal,
  Maximize2,
  Users,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons"
import { getCryptoBySymbols } from "@/services/CryptoService"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import MarketView from "./market-view"
import P2PMarketView from "./p2p-market-view"
import ProfileView from "./profile-view"
import FloatingActionMenu from "./floating-action-menu"
import AnalyticsView from "./analytics-view"
import DefiView from "./defi-view"
import LearnView from "./learn-view"
import AlertsView from "./alerts-view"
import SocialView from "./social-view"

// ── Formatter de balance demo ──────────────────────────────────────────────────
function formatBalance(value: number): string {
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Balance demo fijo — señalizado en UI, no calculado desde saldos reales
const DEMO_TOTAL_BALANCE = 99828.30

// Precio de activo con manejo correcto de micro-precios
function formatUsdPrice(value: number): string {
  if (value >= 1000) return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (value >= 1) return "$" + value.toFixed(2)
  if (value >= 0.01) return "$" + value.toFixed(4)
  return "$" + value.toFixed(6)
}

// Activos base — iconos, colores y estructura (balance = 0 en landing pública)
const cryptoAssets = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    icon: LOCAL_CURRENCY_ICONS.BTC || "/placeholder.svg",
    balance: 0.0,
    value: 95656.0,
    color: "#F7931A",
  },
  {
    id: "bnb",
    name: "Binance Coin",
    symbol: "BNB",
    icon: LOCAL_CURRENCY_ICONS.BNB || "/placeholder.svg",
    balance: 0.0,
    value: 536.0,
    color: "#F3BA2F",
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    icon: LOCAL_CURRENCY_ICONS.USDC || "/placeholder.svg",
    balance: 0.0,
    value: 1.0,
    color: "#2775CA",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    icon: LOCAL_CURRENCY_ICONS.ETH || "/placeholder.svg",
    balance: 0.0,
    value: 3450.0,
    color: "#627EEA",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    icon: LOCAL_CURRENCY_ICONS.SOL || "/placeholder.svg",
    balance: 0.0,
    value: 178.5,
    color: "#00FFA3",
  },
  {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    icon: LOCAL_CURRENCY_ICONS.ADA || "/placeholder.svg",
    balance: 0.0,
    value: 0.45,
    color: "#0033AD",
  },
  {
    id: "dot",
    name: "Polkadot",
    symbol: "DOT",
    icon: LOCAL_CURRENCY_ICONS.DOT || "/placeholder.svg",
    balance: 0.0,
    value: 6.23,
    color: "#E6007A",
  },
  {
    id: "doge",
    name: "Dogecoin",
    symbol: "DOGE",
    icon: LOCAL_CURRENCY_ICONS.DOGE || "/placeholder.svg",
    balance: 0.0,
    value: 0.12,
    color: "#C2A633",
  },
]

// Función para generar datos de precios mockeados
const generatePriceData = (basePrice: number, dataPoints: number, volatility: number, trend = 0) => {
  const data = []
  let price = basePrice

  for (let i = 0; i < dataPoints; i++) {
    // Generación determinística — sin Math.random para gráfico estable
    const change = Math.sin(i * 2.7 + (basePrice % 97)) * volatility * basePrice * 0.5
    // Añadir un componente de tendencia
    const trendChange = (trend * basePrice * i) / dataPoints

    price = price + change + trendChange
    // Asegurar que el precio no sea negativo
    price = Math.max(price, basePrice * 0.5)

    const date = new Date()
    date.setHours(0, 0, 0, 0)

    if (dataPoints <= 24) {
      // Datos por hora para el día
      date.setHours(date.getHours() - (24 - i))
      data.push({
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        price: price,
        fullTime: date,
      })
    } else if (dataPoints <= 30) {
      // Datos diarios para la semana o mes
      date.setDate(date.getDate() - (dataPoints - i))
      data.push({
        time: date.toLocaleDateString([], { day: "2-digit", month: "2-digit" }),
        price: price,
        fullTime: date,
      })
    } else {
      // Datos semanales o mensuales para el año
      date.setDate(date.getDate() - (dataPoints - i) * 7)
      data.push({
        time: date.toLocaleDateString([], { day: "2-digit", month: "2-digit" }),
        price: price,
        fullTime: date,
      })
    }
  }

  return data
}

// Generar datos para diferentes períodos de tiempo
const generateTimeframeData = (basePrice: number) => {
  return {
    day: generatePriceData(basePrice, 24, 0.01, 0.005), // 24 horas con baja volatilidad
    week: generatePriceData(basePrice, 7, 0.02, 0.01), // 7 días con volatilidad media
    month: generatePriceData(basePrice, 30, 0.03, 0.02), // 30 días con volatilidad alta
    year: generatePriceData(basePrice, 52, 0.05, 0.1), // 52 semanas con volatilidad muy alta
  }
}

// Generar datos de precios para cada criptomoneda
const cryptoPriceData = cryptoAssets.reduce(
  (acc, asset) => {
    acc[asset.id] = generateTimeframeData(asset.value)
    return acc
  },
  {} as Record<string, any>,
)

// Componente para el gráfico de precios
const PriceChart = ({ assetId, timeframe, currentPrice }: { assetId: string; timeframe: string; currentPrice?: number }) => {
  const asset = cryptoAssets.find((a) => a.id === assetId)
  if (!asset) return null

  const data = cryptoPriceData[assetId][timeframe]
  const color = asset.color || "#3B82F6"

  // Calcular el cambio de precio
  const firstPrice = data[0].price
  const lastPrice = data[data.length - 1].price
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100
  const isPositive = priceChange >= 0

  // Formatear para mostrar solo 2 decimales
  const formattedChange = Math.abs(priceChange).toFixed(2)

  return (
    <div className="w-full">
      <div className="flex items-start mb-2">
        <span className="text-2xl font-bold text-white">{formatUsdPrice(currentPrice ?? asset.value)}</span>
        <span className={`ml-2 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : "-"}
          {formattedChange}%
        </span>
      </div>

      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${assetId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              fillOpacity={1}
              fill={`url(#gradient-${assetId})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function CryptoWallet() {
  const [hideBalance, setHideBalance] = useState(false)
  const [currency, setCurrency] = useState("USD")
  const [hideSmallBalances, setHideSmallBalances] = useState(false)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("day")
  const [activeView, setActiveView] = useState<string>("home") // "home", "market", "p2p", "trade", "profile"
  const [showFloatingMenu, setShowFloatingMenu] = useState(false)
  const [additionalView, setAdditionalView] = useState<string | null>(null)

  // Precios reales desde pricing aggregator (saldos personales siguen demo)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [pricesLoaded, setPricesLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    getCryptoBySymbols(["BTC", "BNB", "USDC", "ETH", "SOL", "ADA", "DOT", "DOGE"])
      .then((data) => {
        if (cancelled) return
        const map: Record<string, number> = {}
        data.forEach((d) => { map[d.symbol.toUpperCase()] = d.averagePrice ?? 0 })
        setLivePrices(map)
        setPricesLoaded(true)
      })
      .catch(() => { if (!cancelled) setPricesLoaded(true) })
    return () => { cancelled = true }
  }, [])

  // Demo balance fijo — no calculado desde saldos reales (todos son 0 en landing)
  const totalBalance = DEMO_TOTAL_BALANCE
  const lockedFunds = 0.0

  const handleAction = (action: string, data?: any) => {
    // Manejar acciones específicas
    switch (action) {
      case "analytics":
        setAdditionalView("analytics")
        break
      case "defi":
        setAdditionalView("defi")
        break
      case "social":
        setAdditionalView("social")
        break
      case "learn":
        setAdditionalView("learn")
        break
      case "alerts":
        setAdditionalView("alerts")
        break
      default:
        setShowModal(action)
        // Para modales temporales, cerrarlos después de un tiempo
        if (
          action !== "earnings" &&
          action !== "crypto-savings" &&
          !action.startsWith("stake") &&
          !action.startsWith("farm")
        ) {
          setTimeout(() => setShowModal(null), 1500)
        }
        break
    }
  }

  // Función para volver desde vistas adicionales
  const handleBackFromAdditionalView = () => {
    setAdditionalView(null)
  }

  // Renderizar la vista activa
  const renderActiveView = () => {
    // Si hay una vista adicional activa, mostrarla
    if (additionalView) {
      switch (additionalView) {
        case "analytics":
          return <AnalyticsView onAction={handleAction} onBack={handleBackFromAdditionalView} />
        case "defi":
          return <DefiView onAction={handleAction} onBack={handleBackFromAdditionalView} />
        case "social":
          return <SocialView onAction={handleAction} onBack={handleBackFromAdditionalView} />
        case "learn":
          return <LearnView onAction={handleAction} onBack={handleBackFromAdditionalView} />
        case "alerts":
          return <AlertsView onAction={handleAction} onBack={handleBackFromAdditionalView} />
        default:
          return null
      }
    }

    // Si no hay vista adicional, mostrar la vista principal
    switch (activeView) {
      case "market":
        return <MarketView onAction={handleAction} />
      case "p2p":
        return <P2PMarketView onAction={handleAction} />
      case "profile":
        return <ProfileView onAction={handleAction} />
      default:
        return (
          <div className="absolute inset-0 overflow-y-auto mock-wallet-scroll">
            {/* Status bar */}
            <div className="h-6 bg-black sticky top-0 z-10"></div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sticky top-6 bg-black z-10">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-sm font-medium text-gray-200">User deco-exchange</span>
              </div>
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-white">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <Cog className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Balance section */}
            <div className="px-4 py-3 bg-gray-900 rounded-lg mx-4 mt-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Balance demo</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">Vista previa</span>
                </div>
                <div className="flex items-center bg-gray-800 rounded-full px-2 py-1">
                  <span className="text-xs text-white mr-1">$</span>
                  <span className="text-xs text-white mr-1">{currency}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center mb-1">
                <span className="text-2xl font-bold text-white mr-2">
                  {hideBalance ? "•••••" : formatBalance(totalBalance)}
                </span>
                <button onClick={() => setHideBalance(!hideBalance)} className="text-gray-400 hover:text-white">
                  {hideBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-xs text-gray-400">Fondos bloqueados: ${lockedFunds.toFixed(2)}</div>
            </div>

            {/* Action buttons */}
            {/* Main action buttons - First row */}
            <div className="grid grid-cols-4 gap-2 px-4 mt-4">
              <button
                onClick={() => handleAction("deposit")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700",
                  showModal === "deposit" && "bg-gray-700",
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full mb-1">
                  <ArrowDown className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-300">Depósito</span>
              </button>

              <button
                onClick={() => handleAction("send")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700",
                  showModal === "send" && "bg-gray-700",
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full mb-1">
                  <ArrowUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-300">Enviar</span>
              </button>

              <button
                onClick={() => handleAction("convert")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700",
                  showModal === "convert" && "bg-gray-700",
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full mb-1">
                  <RefreshCw className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-300">Convertir</span>
              </button>

              <button
                onClick={() => handleAction("withdraw")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700",
                  showModal === "withdraw" && "bg-gray-700",
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full mb-1">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-300">Retirar</span>
              </button>
            </div>

            {/* Secondary action buttons - Second row */}
            <div className="grid grid-cols-4 gap-2 px-4 mt-2">
              <button
                onClick={() => setActiveView("p2p")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700",
                  showModal === "p2p" && "bg-gray-700",
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full mb-1">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-300">P2P</span>
              </button>

              <button
                onClick={() => handleAction("spot")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700",
                  showModal === "spot" && "bg-gray-700",
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full mb-1">
                  <LineChart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-300">Spot</span>
              </button>

              <button
                onClick={() => handleAction("cashback")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700",
                  showModal === "cashback" && "bg-gray-700",
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full mb-1">
                  <Circle className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-xs text-gray-300">Cashback</span>
              </button>

              <button
                onClick={() => handleAction("customize")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700",
                  showModal === "customize" && "bg-gray-700",
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full mb-1">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-300">Añadir</span>
              </button>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3 px-4 mt-4">
              <div
                className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleAction("earnings")}
              >
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded-full mr-2">
                    <Circle className="w-3 h-3 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Ganancias</span>
                </div>
                <p className="text-xs text-gray-400">Recibe recompensas diarias por mantener tus fondos en la cuenta</p>
              </div>

              <div
                className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleAction("crypto-savings")}
              >
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded-full mr-2">
                    <Circle className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Crypto Ahorro</span>
                </div>
                <p className="text-xs text-gray-400">Obtén rendimientos competitivos al invertir en criptomonedas</p>
              </div>
            </div>

            {/* Convert small balances */}
            <div className="mx-4 mt-4">
              <button
                onClick={() => handleAction("convert-small")}
                className={cn(
                  "flex items-center justify-between w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700",
                  showModal === "convert-small" && "bg-gray-700",
                )}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-full mr-3">
                    <Circle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-white">Convertir activos de bajo valor a USDC</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Assets section */}
            <div className="mt-4 pb-24">
              {/* Aumentamos el padding-bottom para evitar que el contenido quede oculto bajo la barra de navegación */}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white">Activos</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                </div>
                <button className="text-gray-400 hover:text-white">
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {/* Hide small balances toggle */}
              <div className="flex items-center px-4 py-2">
                <input
                  type="checkbox"
                  id="hideSmallBalances"
                  checked={hideSmallBalances}
                  onChange={() => setHideSmallBalances(!hideSmallBalances)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="hideSmallBalances" className="ml-2 text-xs text-gray-400">
                  Ocultar montos pequeños
                </label>
              </div>
              {/* Asset list */}
              <div className="px-4">
                {cryptoAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 rounded-md px-2"
                    onClick={() => setSelectedAsset(asset.id)}
                  >
                    <div className="flex items-center">
                      <img
                        src={asset.icon || "/placeholder.svg"}
                        alt={asset.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{asset.symbol}</div>
                        <div className="text-xs text-gray-400">{pricesLoaded ? formatUsdPrice(livePrices[asset.symbol] ?? 0) : "—"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{asset.balance.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">0.00</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 md:px-8 py-0">
      {/* Phone frame */}
      <div className="relative max-w-[325px] h-full w-full rounded-[40px] bg-gray-800 p-3 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-50"></div>

        {/* Screen content - Aplicamos estilos de scroll de shadcn */}
        <div className="relative rounded-[32px] bg-black h-[578px] overflow-hidden">
          {/* Contenido principal */}
          {renderActiveView()}

          {/* Bottom navigation - Fijamos la barra de navegación en la parte inferior dentro del contenedor */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around py-3 bg-gray-900 z-10 rounded-b-[32px]">
            <button className="flex flex-col items-center" onClick={() => setActiveView("home")}>
              <Home className={`w-5 h-5 ${activeView === "home" ? "text-white" : "text-gray-500"}`} />
            </button>
            <button className="flex flex-col items-center" onClick={() => setActiveView("market")}>
              <Layers className={`w-5 h-5 ${activeView === "market" ? "text-white" : "text-gray-500"}`} />
            </button>
            <div className="relative -mt-8">
              <button
                className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white"
                onClick={() => setShowFloatingMenu(true)}
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <button className="flex flex-col items-center" onClick={() => setActiveView("p2p")}>
              <Users className={`w-5 h-5 ${activeView === "p2p" ? "text-white" : "text-gray-500"}`} />
            </button>
            <button className="flex flex-col items-center" onClick={() => setActiveView("profile")}>
              <User className={`w-5 h-5 ${activeView === "profile" ? "text-white" : "text-gray-500"}`} />
            </button>
          </div>

          {/* Floating Action Menu */}
          {showFloatingMenu && (
            <div className="absolute inset-0 z-30">
              <FloatingActionMenu onAction={handleAction} onClose={() => setShowFloatingMenu(false)} />
            </div>
          )}

          {/* Modal overlay */}
          {showModal && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
              <div className="bg-gray-800 p-4 rounded-lg max-w-xs w-full">
                <h3 className="text-lg font-medium text-white mb-2">
                  {showModal === "deposit" && "Depositar Fondos"}
                  {showModal === "send" && "Enviar Crypto"}
                  {showModal === "convert" && "Convertir Crypto"}
                  {showModal === "withdraw" && "Retirar Fondos"}
                  {showModal === "convert-small" && "Convertir Saldos Pequeños"}
                  {showModal === "p2p-trade" && "Trading P2P"}
                  {showModal === "p2p-guide" && "Guía de P2P Trading"}
                  {showModal === "create-p2p-offer" && "Crear Oferta P2P"}
                  {showModal === "spot" && "Spot Trading"}
                  {showModal === "cashback" && "Recompensas Cashback"}
                  {showModal === "customize" && "Personalizar Secciones"}
                  {showModal === "deposit-bnb" && "Depositar BNB"}
                  {showModal === "earnings" && "Programa de Ganancias"}
                  {showModal === "crypto-savings" && "Crypto Ahorro"}
                  {showModal === "stake" && "Staking de Criptomonedas"}
                  {showModal === "farm" && "Yield Farming"}
                  {showModal === "alert-created" && "Alerta Creada"}
                  {showModal === "start-conversation" && "Iniciar Conversación"}
                </h3>

                {showModal === "earnings" ? (
                  <div>
                    <div className="flex items-center mb-3">
                      <Circle className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-white font-medium">Programa de Recompensas Diarias</span>
                    </div>

                    <p className="text-sm text-gray-400 mb-3">
                      Mantén tus criptomonedas en tu cuenta y recibe recompensas diarias basadas en tu balance.
                    </p>

                    <div className="bg-gray-700 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-medium text-white mb-2">Tasas de recompensa actuales:</h4>
                      <p className="text-sm text-gray-400">
                        Los rendimientos varían según el activo y las condiciones del mercado. Consulta las tasas actuales en la app.
                      </p>
                    </div>

                    <div className="text-xs text-gray-400 mb-4">
                      Las recompensas se calculan diariamente y se distribuyen semanalmente. Cuanto mayor sea tu
                      balance, mayores serán tus recompensas.
                    </div>

                    <button
                      onClick={() => setShowModal(null)}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Entendido
                    </button>
                  </div>
                ) : showModal === "crypto-savings" ? (
                  <div>
                    <div className="flex items-center mb-3">
                      <Circle className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-white font-medium">Programa de Crypto Ahorro</span>
                    </div>

                    <p className="text-sm text-gray-400 mb-3">
                      Invierte tus criptomonedas en nuestros planes de ahorro y obtén rendimientos competitivos con
                      diferentes plazos.
                    </p>

                    <div className="bg-gray-700 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-medium text-white mb-2">Planes disponibles:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <div>
                            <div className="text-sm text-white">Plan Flexible</div>
                            <div className="text-xs text-gray-400">Sin bloqueo, retiro en cualquier momento</div>
                          </div>
                          <div className="text-sm text-green-500">Rendimiento variable</div>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <div>
                            <div className="text-sm text-white">Plan 30 días</div>
                            <div className="text-xs text-gray-400">Bloqueo por 30 días</div>
                          </div>
                          <div className="text-sm text-green-500">Rendimiento variable</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-white">Plan 90 días</div>
                            <div className="text-xs text-gray-400">Bloqueo por 90 días</div>
                          </div>
                          <div className="text-sm text-green-500">Rendimiento variable</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mb-4">
                      Los rendimientos pueden variar según las condiciones del mercado. Invierte de manera responsable y
                      considera los riesgos asociados.
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowModal(null)}
                        className="py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cerrar
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(null)
                          // Aquí podríamos navegar a una vista de inversión
                        }}
                        className="py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Invertir ahora
                      </button>
                    </div>
                  </div>
                ) : showModal === "stake" || showModal === "farm" ? (
                  <div>
                    <div className="flex items-center mb-3">
                      <Circle className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-white font-medium">
                        {showModal === "stake" ? "Staking de Criptomonedas" : "Yield Farming"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-3">
                      {showModal === "stake"
                        ? "Has seleccionado una opción de staking. Confirma los detalles antes de proceder."
                        : "Has seleccionado una opción de farming. Confirma los detalles antes de proceder."}
                    </p>

                    <div className="bg-gray-700 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Activo</span>
                        <span className="text-sm text-white">{showModal === "stake" ? "BTC" : "BTC-USDC"}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">APY estimado</span>
                        <span className="text-sm text-green-500">Rendimiento variable</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Periodo</span>
                        <span className="text-sm text-white">{showModal === "stake" ? "30 días" : "Flexible"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Monto mínimo</span>
                        <span className="text-sm text-white">{showModal === "stake" ? "0.01 BTC" : "$100"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowModal(null)}
                        className="py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(null)
                          // Aquí podríamos navegar a una vista de confirmación
                        }}
                        className="py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                ) : showModal === "alert-created" ? (
                  <div>
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
                        <Bell className="w-6 h-6 text-green-500" />
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-4 text-center">
                      Tu alerta ha sido creada con éxito. Recibirás una notificación cuando se cumplan las condiciones
                      establecidas.
                    </p>

                    <button
                      onClick={() => setShowModal(null)}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Entendido
                    </button>
                  </div>
                ) : showModal === "start-conversation" ? (
                  <div>
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-4 text-center">
                      Conecta con otros usuarios de la comunidad crypto para intercambiar ideas, consejos y realizar
                      operaciones P2P.
                    </p>

                    <div className="bg-gray-700 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-white mb-2">Usuarios sugeridos:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
                            <span className="text-sm text-white">Crypto Trader</span>
                          </div>
                          <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Conectar</button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
                            <span className="text-sm text-white">DeFi Expert</span>
                          </div>
                          <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Conectar</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowModal(null)}
                        className="py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(null)
                          setAdditionalView("social")
                        }}
                        className="py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Explorar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">
                    {showModal === "customize"
                      ? "Personaliza tus acciones rápidas añadiendo o eliminando secciones según tus necesidades."
                      : showModal === "deposit-bnb"
                        ? "Deposita BNB y accede a productos de ahorro cripto. Esta función está disponible en la app."
                        : showModal === "p2p-guide"
                          ? "Aprende cómo comprar y vender criptomonedas de forma segura a través de nuestro sistema P2P. Conecta con otros usuarios y realiza transacciones directas."
                          : showModal === "create-p2p-offer"
                            ? "Crea tu propia oferta para comprar o vender criptomonedas directamente con otros usuarios. Establece tu precio y métodos de pago preferidos."
                            : showModal === "p2p-trade"
                              ? "Estás a punto de iniciar una operación P2P. Asegúrate de revisar todos los detalles antes de proceder."
                              : "Esta es una acción simulada en la interfaz de demostración del wallet."}
                  </p>
                )}

                {showModal !== "earnings" &&
                  showModal !== "crypto-savings" &&
                  showModal !== "stake" &&
                  showModal !== "farm" &&
                  showModal !== "alert-created" &&
                  showModal !== "start-conversation" && (
                    <button
                      onClick={() => setShowModal(null)}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {showModal === "customize"
                        ? "Guardar cambios"
                        : showModal === "deposit-bnb"
                          ? "Entendido"
                          : "Cerrar"}
                    </button>
                  )}
              </div>
            </div>
          )}

          {/* Asset Detail View */}
          {selectedAsset && (
            <div className="absolute inset-0 bg-black flex flex-col z-20 overflow-hidden">
              {/* Contenedor con scroll interno para la vista detallada */}
              <div className="absolute inset-0 overflow-y-auto mock-wallet-scroll">
                <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-medium text-white">
                      {cryptoAssets.find((a) => a.id === selectedAsset)?.name}
                    </span>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <img
                      src={cryptoAssets.find((a) => a.id === selectedAsset)?.icon || "/placeholder.svg"}
                      alt={cryptoAssets.find((a) => a.id === selectedAsset)?.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="text-xl font-bold text-white">
                        {formatUsdPrice(livePrices[cryptoAssets.find((a) => a.id === selectedAsset)?.symbol ?? ""] ?? 0)}
                      </div>
                      <div className="text-sm text-green-500">+2.45% (24h)</div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Tu balance</span>
                      <span className="text-sm text-white">
                        {cryptoAssets.find((a) => a.id === selectedAsset)?.balance.toFixed(8)}{" "}
                        {cryptoAssets.find((a) => a.id === selectedAsset)?.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Valor en USD</span>
                      <span className="text-sm text-white">
                        $
                        {(cryptoAssets.find((a) => a.id === selectedAsset)?.balance ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

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

                    {/* Gráfico de precios */}
                    {selectedAsset && <PriceChart assetId={selectedAsset} timeframe={selectedTimeframe} currentPrice={livePrices[cryptoAssets.find((a) => a.id === selectedAsset)?.symbol ?? ""] ?? 0} />}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button className="bg-green-600 text-white py-3 rounded-lg font-medium">Comprar</button>
                    <button className="bg-red-600 text-white py-3 rounded-lg font-medium">Vender</button>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <h3 className="text-white font-medium mb-3">Información del mercado</h3>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-sm text-gray-400">Precio actual</span>
                      <span className="text-sm text-white">
                        {formatUsdPrice(livePrices[cryptoAssets.find((a) => a.id === selectedAsset)?.symbol ?? ""] ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-sm text-gray-400">Cambio 24h</span>
                      <span className="text-sm text-green-500">+2.45%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-sm text-gray-400">Máximo 24h</span>
                      <span className="text-sm text-white">
                        ${(cryptoAssets.find((a) => a.id === selectedAsset)?.value || 0 * 1.05).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-400">Mínimo 24h</span>
                      <span className="text-sm text-white">
                        ${(cryptoAssets.find((a) => a.id === selectedAsset)?.value || 0 * 0.95).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 mb-20">
                    <h3 className="text-white font-medium mb-3">Operaciones recientes</h3>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <div>
                        <span className="text-sm text-white">Compra</span>
                        <div className="text-xs text-gray-400">Ayer, 15:30</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-white">
                          +0.0025 {cryptoAssets.find((a) => a.id === selectedAsset)?.symbol}
                        </span>
                        <div className="text-xs text-gray-400">
                          ${(0.0025 * (cryptoAssets.find((a) => a.id === selectedAsset)?.value || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between py-2">
                      <div>
                        <span className="text-sm text-white">Venta</span>
                        <div className="text-xs text-gray-400">12 Abr, 09:45</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-white">
                          -0.0050 {cryptoAssets.find((a) => a.id === selectedAsset)?.symbol}
                        </span>
                        <div className="text-xs text-gray-400">
                          ${(0.005 * (cryptoAssets.find((a) => a.id === selectedAsset)?.value || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
