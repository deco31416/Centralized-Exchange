"use client"

import { useState } from "react"
import { ArrowLeft, Bell, Percent, Clock, Shield, TrendingUp, Info, Lock } from "lucide-react"

type StakingOption = {
  id: string
  asset: string
  apy: string
  lockPeriod: string
  minAmount: number
  risk: "Bajo" | "Medio" | "Alto"
  platform: string
  tvl: string
}

type YieldFarmOption = {
  id: string
  pair: string
  apy: string
  platform: string
  tvl: string
  risk: "Bajo" | "Medio" | "Alto"
}

export default function DefiView({
  onAction,
  onBack,
}: { onAction: (action: string, data?: any) => void; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"staking" | "yield" | "lending">("staking")

  // Datos de referencia — APY/TVL sujetos a disponibilidad de producto (DEFI-DEMO-001)
  const stakingOptions: StakingOption[] = [
    {
      id: "btc-stake",
      asset: "BTC",
      apy: "Rendimiento variable",
      lockPeriod: "30 días",
      minAmount: 0.01,
      risk: "Bajo",
      platform: "deco-exchange",
      tvl: "Consulta condiciones",
    },
    {
      id: "eth-stake",
      asset: "ETH",
      apy: "Rendimiento variable",
      lockPeriod: "60 días",
      minAmount: 0.1,
      risk: "Bajo",
      platform: "deco-exchange",
      tvl: "Consulta condiciones",
    },
    {
      id: "bnb-stake",
      asset: "BNB",
      apy: "Rendimiento variable",
      lockPeriod: "90 días",
      minAmount: 1,
      risk: "Medio",
      platform: "deco-exchange",
      tvl: "Consulta condiciones",
    },
    {
      id: "sol-stake",
      asset: "SOL",
      apy: "Rendimiento variable",
      lockPeriod: "Flexible",
      minAmount: 5,
      risk: "Medio",
      platform: "deco-exchange",
      tvl: "Consulta condiciones",
    },
  ]

  // Datos de referencia — APY/TVL sujetos a disponibilidad de producto (DEFI-DEMO-001)
  const yieldFarmOptions: YieldFarmOption[] = [
    {
      id: "btc-usdc",
      pair: "BTC-USDC",
      apy: "Rendimiento variable",
      platform: "deco-exchange",
      tvl: "Consulta condiciones",
      risk: "Medio",
    },
    {
      id: "eth-usdc",
      pair: "ETH-USDC",
      apy: "Rendimiento variable",
      platform: "deco-exchange",
      tvl: "Consulta condiciones",
      risk: "Medio",
    },
    {
      id: "bnb-busd",
      pair: "BNB-BUSD",
      apy: "Rendimiento variable",
      platform: "deco-exchange",
      tvl: "Consulta condiciones",
      risk: "Alto",
    },
    {
      id: "sol-usdc",
      pair: "SOL-USDC",
      apy: "Rendimiento variable",
      platform: "deco-exchange",
      tvl: "Consulta condiciones",
      risk: "Alto",
    },
  ]

  // Función para renderizar el color del riesgo
  const getRiskColor = (risk: "Bajo" | "Medio" | "Alto") => {
    switch (risk) {
      case "Bajo":
        return "text-green-500"
      case "Medio":
        return "text-yellow-500"
      case "Alto":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
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
            <span className="text-lg font-medium text-white ml-3">DeFi</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-800">
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "staking" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("staking")}
        >
          Staking
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "yield" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("yield")}
        >
          Yield Farming
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "lending" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("lending")}
        >
          Préstamos
        </button>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto mock-wallet-scroll pb-20">
        {/* Banner informativo */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-800 rounded-lg mx-4 my-3 p-3">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" />
            <p className="text-xs text-blue-200">
              {activeTab === "staking"
                ? "Gana recompensas pasivas bloqueando tus criptomonedas. Cuanto más tiempo bloquees, mayor será el rendimiento."
                : activeTab === "yield"
                  ? "Proporciona liquidez a pares de trading y gana comisiones más recompensas en tokens. Mayor riesgo, mayor recompensa."
                  : "Presta tus activos para ganar intereses o toma prestado contra tus criptomonedas como garantía."}
            </p>
          </div>
        </div>

        {activeTab === "staking" && (
          <div className="px-4 py-2">
            <div className="space-y-3">
              {stakingOptions.map((option) => (
                <div
                  key={option.id}
                  className="bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-800"
                  onClick={() => onAction("stake", { optionId: option.id })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center mr-2">
                        <span className="text-sm font-medium text-white">{option.asset}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{option.asset} Staking</div>
                        <div className="text-xs text-gray-400">{option.platform}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-500">{option.apy}</div>
                      <div className="text-xs text-gray-400">TVL: {option.tvl}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-300">{option.lockPeriod}</span>
                    </div>
                    <div className="flex items-center">
                      <Lock className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-300">
                        Min: {option.minAmount} {option.asset}
                      </span>
                    </div>
                    <div className="flex items-center justify-end">
                      <Shield className="w-3 h-3 text-gray-400 mr-1" />
                      <span className={`text-xs ${getRiskColor(option.risk)}`}>Riesgo: {option.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mt-4"
              onClick={() => onAction("view-all-staking")}
            >
              Ver todas las opciones
            </button>
          </div>
        )}

        {activeTab === "yield" && (
          <div className="px-4 py-2">
            <div className="space-y-3">
              {yieldFarmOptions.map((option) => (
                <div
                  key={option.id}
                  className="bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-800"
                  onClick={() => onAction("farm", { optionId: option.id })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-900 rounded-full flex items-center justify-center mr-2">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{option.pair}</div>
                        <div className="text-xs text-gray-400">{option.platform}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-500">{option.apy}</div>
                      <div className="text-xs text-gray-400">TVL: {option.tvl}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center">
                      <Percent className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-300">Comisiones + Recompensas</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 text-gray-400 mr-1" />
                      <span className={`text-xs ${getRiskColor(option.risk)}`}>Riesgo: {option.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mt-4"
              onClick={() => onAction("view-all-farming")}
            >
              Ver todas las opciones
            </button>
          </div>
        )}

        {activeTab === "lending" && (
          <div className="px-4 py-2">
            <div className="bg-gray-900 rounded-lg p-4 mb-3">
              <h3 className="text-sm font-medium text-white mb-3">Préstamos disponibles</h3>
              <p className="text-xs text-gray-400 mb-4">
                Presta tus activos para ganar intereses o toma prestado contra tus criptomonedas como garantía.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-white">BTC</span>
                    </div>
                    <span className="text-sm text-white">Bitcoin</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-500">Variable</div>
                    <div className="text-xs text-gray-400">Préstamo</div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-white">ETH</span>
                    </div>
                    <span className="text-sm text-white">Ethereum</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-500">Variable</div>
                    <div className="text-xs text-gray-400">Préstamo</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-white">USDC</span>
                    </div>
                    <span className="text-sm text-white">USD Coin</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-500">Variable</div>
                    <div className="text-xs text-gray-400">Préstamo</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">Tomar prestado</h3>
              <p className="text-xs text-gray-400 mb-4">
                Usa tus criptomonedas como garantía para obtener préstamos en otras monedas o stablecoins.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-white">BTC</span>
                    </div>
                    <span className="text-sm text-white">Bitcoin</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-500">Variable</div>
                    <div className="text-xs text-gray-400">Tomar prestado</div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-white">ETH</span>
                    </div>
                    <span className="text-sm text-white">Ethereum</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-500">Variable</div>
                    <div className="text-xs text-gray-400">Tomar prestado</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-white">USDC</span>
                    </div>
                    <span className="text-sm text-white">USD Coin</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-500">Variable</div>
                    <div className="text-xs text-gray-400">Tomar prestado</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="py-3 bg-blue-600 text-white rounded-lg font-medium" onClick={() => onAction("lend")}>
                Prestar
              </button>
              <button className="py-3 bg-gray-700 text-white rounded-lg font-medium" onClick={() => onAction("borrow")}>
                Tomar prestado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
