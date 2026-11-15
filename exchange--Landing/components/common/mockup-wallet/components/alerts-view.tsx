"use client"

import { useState } from "react"
import { ArrowLeft, Bell, Plus, Trash2, Edit, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

type PriceAlert = {
  id: string
  asset: string
  condition: "above" | "below"
  price: number
  createdAt: Date
  triggered?: boolean
  icon?: string
}

type NewsAlert = {
  id: string
  keywords: string[]
  assets: string[]
  createdAt: Date
}

export default function AlertsView({
  onAction,
  onBack,
}: { onAction: (action: string, data?: any) => void; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"price" | "news">("price")
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [newAlertAsset, setNewAlertAsset] = useState("BTC")
  const [newAlertCondition, setNewAlertCondition] = useState<"above" | "below">("above")
  const [newAlertPrice, setNewAlertPrice] = useState("")

  // Datos de ejemplo para alertas de precio
  const priceAlerts: PriceAlert[] = [
    {
      id: "alert1",
      asset: "BTC",
      condition: "above",
      price: 100000,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      icon: "/bitcoin-symbol-gold.png",
    },
    {
      id: "alert2",
      asset: "ETH",
      condition: "below",
      price: 3000,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      icon: "/ethereum-crystal.png",
    },
    {
      id: "alert3",
      asset: "BNB",
      condition: "above",
      price: 600,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      triggered: true,
      icon: "/binance-coin-logo.png",
    },
  ]

  // Datos de ejemplo para alertas de noticias
  const newsAlerts: NewsAlert[] = [
    {
      id: "news1",
      keywords: ["halving", "fork", "actualización"],
      assets: ["BTC", "ETH"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    {
      id: "news2",
      keywords: ["regulación", "SEC", "impuestos"],
      assets: ["Todas"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    },
  ]

  // Función para formatear la fecha relativa
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoy"
    if (diffDays === 1) return "Ayer"
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    return `Hace ${Math.floor(diffDays / 30)} meses`
  }

  // Función para manejar la creación de una nueva alerta
  const handleCreateAlert = () => {
    // Resetear el formulario y cerrar el panel
    setNewAlertAsset("BTC")
    setNewAlertCondition("above")
    setNewAlertPrice("")
    setShowAddAlert(false)

    // Mostrar confirmación
    onAction("alert-created")
  }

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-white ml-3">Alertas</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white" onClick={() => setShowAddAlert(!showAddAlert)}>
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-800">
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "price" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("price")}
        >
          Precio
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "news" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("news")}
        >
          Noticias
        </button>
      </div>

      {/* Panel para añadir alerta */}
      {showAddAlert && (
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
          <h3 className="text-sm font-medium text-white mb-3">Nueva alerta de precio</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Activo</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newAlertAsset}
                onChange={(e) => setNewAlertAsset(e.target.value)}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="BNB">Binance Coin (BNB)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="USDC">USD Coin (USDC)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Condición</label>
              <div className="flex space-x-2">
                <button
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center ${
                    newAlertCondition === "above" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
                  }`}
                  onClick={() => setNewAlertCondition("above")}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Por encima de</span>
                </button>
                <button
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center ${
                    newAlertCondition === "below" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
                  }`}
                  onClick={() => setNewAlertCondition("below")}
                >
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span>Por debajo de</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Precio (USD)</label>
              <div className="flex">
                <div className="bg-gray-700 text-white p-2 rounded-l-lg flex items-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 bg-gray-800 text-white p-2 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newAlertPrice}
                  onChange={(e) => setNewAlertPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button className="flex-1 py-2 bg-gray-800 text-white rounded-lg" onClick={() => setShowAddAlert(false)}>
                Cancelar
              </button>
              <button
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleCreateAlert}
                disabled={!newAlertPrice}
              >
                Crear alerta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto mock-wallet-scroll pb-20">
        {activeTab === "price" && (
          <div className="px-4 py-3">
            {priceAlerts.length > 0 ? (
              <div className="space-y-3">
                {priceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-gray-900 rounded-lg p-3 ${alert.triggered ? "border border-yellow-800" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src={alert.icon || "/placeholder.svg"}
                          alt={alert.asset}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{alert.asset}</div>
                          <div className="text-xs text-gray-400">{formatRelativeTime(alert.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {alert.condition === "above" ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className="text-sm text-gray-300">
                        {alert.condition === "above" ? "Por encima de" : "Por debajo de"} $
                        {alert.price.toLocaleString()}
                      </span>
                    </div>

                    {alert.triggered && (
                      <div className="mt-2 flex items-start bg-yellow-900 bg-opacity-30 p-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1 flex-shrink-0" />
                        <span className="text-xs text-yellow-200">
                          Esta alerta se ha activado. El precio de {alert.asset} ha{" "}
                          {alert.condition === "above" ? "superado" : "caído por debajo de"} $
                          {alert.price.toLocaleString()}.
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="w-12 h-12 text-gray-600 mb-3" />
                <h3 className="text-lg font-medium text-white mb-1">No hay alertas de precio</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Crea alertas para recibir notificaciones cuando los precios alcancen niveles específicos.
                </p>
                <button className="py-2 px-4 bg-blue-600 text-white rounded-lg" onClick={() => setShowAddAlert(true)}>
                  Crear alerta
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "news" && (
          <div className="px-4 py-3">
            {newsAlerts.length > 0 ? (
              <div className="space-y-3">
                {newsAlerts.map((alert) => (
                  <div key={alert.id} className="bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-white">Alerta de noticias</div>
                      <div className="text-xs text-gray-400">{formatRelativeTime(alert.createdAt)}</div>
                    </div>

                    <div className="mb-2">
                      <div className="text-xs text-gray-400 mb-1">Palabras clave:</div>
                      <div className="flex flex-wrap gap-1">
                        {alert.keywords.map((keyword, index) => (
                          <span key={index} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400 mb-1">Activos:</div>
                      <div className="flex flex-wrap gap-1">
                        {alert.assets.map((asset, index) => (
                          <span key={index} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="w-12 h-12 text-gray-600 mb-3" />
                <h3 className="text-lg font-medium text-white mb-1">No hay alertas de noticias</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Crea alertas para recibir notificaciones sobre noticias importantes relacionadas con tus activos.
                </p>
                <button
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg"
                  onClick={() => onAction("create-news-alert")}
                >
                  Crear alerta
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
