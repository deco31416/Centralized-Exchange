"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Search,
  Star,
  StarOff,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import CoinDetailView from "./coin-detail-view";
import { getCryptoCurrencies } from "@/services/CryptoService";
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons";
import type { CryptoPriceData } from "@/types/crypto-price-data";

// ── Filtros de mercado móvil ───────────────────────────────────────────────────
const MOBILE_MARKET_EXCLUDED_SYMBOLS = new Set(["DECOX", "DECO", "DECO"]);
const MOBILE_MARKET_PRIORITY = ["BTC", "ETH", "BNB", "SOL", "USDT", "USDC"];

const SYMBOL_COLORS: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", BNB: "#F3BA2F", SOL: "#00FFA3",
  USDT: "#26A17B", USDC: "#2775CA", XRP: "#00AAE4", ADA: "#0033AD",
  DOGE: "#C2A633", DOT: "#E6007A", AVAX: "#E84142", LTC: "#BFBBBB",
  TRX: "#FF0013", LINK: "#2A5ADA", TON: "#0088CC", SHIB: "#E4921B", PEPE: "#3AA342",
};

const SYMBOL_DISPLAY_NAMES: Record<string, string> = {
  BTC: "Bitcoin", ETH: "Ethereum", BNB: "Binance Coin", SOL: "Solana",
  USDT: "Tether", USDC: "USD Coin", XRP: "Ripple", ADA: "Cardano",
  DOGE: "Dogecoin", DOT: "Polkadot", AVAX: "Avalanche", LTC: "Litecoin",
  TRX: "TRON", LINK: "Chainlink", TON: "Toncoin",
};

interface MarketCoin {
  id: string; name: string; symbol: string; icon: string;
  price: number; change24h: number; volume24h: number;
  isFavorite: boolean; isHot: boolean; isNew: boolean;
  color: string; priceData: Array<{ price: number }>;
}

function formatUsdPrice(value: number): string {
  if (value >= 1000) return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 1) return "$" + value.toFixed(2);
  if (value >= 0.01) return "$" + value.toFixed(4);
  return "$" + value.toFixed(6);
}

function generateMiniPriceData(basePrice: number, change24h: number): Array<{ price: number }> {
  const trendTotal = (change24h / 100) * basePrice;
  return Array.from({ length: 24 }, (_, i) => {
    const progress = i / 23;
    const noise = Math.sin(i * 1.5) * basePrice * 0.004;
    return { price: Math.max(0, basePrice + trendTotal * progress + noise) };
  });
}

function mapToMarketCoin(cpd: CryptoPriceData): MarketCoin {
  const sym = cpd.symbol.toUpperCase();
  return {
    id: sym.toLowerCase(),
    name: SYMBOL_DISPLAY_NAMES[sym] ?? sym,
    symbol: sym,
    icon: LOCAL_CURRENCY_ICONS[sym] ?? "",
    price: cpd.averagePrice ?? 0,
    change24h: cpd.averageChange24h ?? 0,
    volume24h: cpd.averageVolume24h ?? 0,
    isFavorite: ["BTC", "ETH", "SOL"].includes(sym),
    isHot: (cpd.averageChange24h ?? 0) > 1.5,
    isNew: false,
    color: SYMBOL_COLORS[sym] ?? "#3B82F6",
    priceData: generateMiniPriceData(cpd.averagePrice ?? 0, cpd.averageChange24h ?? 0),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- datos estáticos sin uso en producción
const _marketCoinsFallback = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "/mockup-wallet/bitcoin-symbol-gold.png",
    price: 95656.0,
    change24h: 2.45,
    volume24h: 32500000000,
    marketCap: 1850000000000,
    isFavorite: true,
    isHot: true,
    isNew: false,
    color: "#F7931A",
    priceData: generateMiniPriceData(95656, 2.45),
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    icon: "/mockup-wallet/ethereum-crystal.png",
    price: 3450.0,
    change24h: 1.75,
    volume24h: 18500000000,
    marketCap: 420000000000,
    isFavorite: true,
    isHot: true,
    isNew: false,
    color: "#627EEA",
    priceData: generateMiniPriceData(3450, 1.75),
  },
  {
    id: "bnb",
    name: "Binance Coin",
    symbol: "BNB",
    icon: "/mockup-wallet/binance-coin-logo.png",
    price: 536.0,
    change24h: 0.95,
    volume24h: 2500000000,
    marketCap: 82000000000,
    isFavorite: false,
    isHot: true,
    isNew: false,
    color: "#F3BA2F",
    priceData: generateMiniPriceData(536, 0.95),
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    icon: "/mockup-wallet/placeholder.svg?key=sol",
    price: 178.5,
    change24h: 3.25,
    volume24h: 4500000000,
    marketCap: 75000000000,
    isFavorite: true,
    isHot: true,
    isNew: false,
    color: "#00FFA3",
    priceData: generateMiniPriceData(178.5, 3.25),
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    icon: "/mockup-wallet/usdc-digital-currency.png",
    price: 1.0,
    change24h: 0.01,
    volume24h: 3500000000,
    marketCap: 25000000000,
    isFavorite: false,
    isHot: false,
    isNew: false,
    color: "#2775CA",
    priceData: generateMiniPriceData(1, 0.01),
  },
  {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    icon: "/mockup-wallet/placeholder.svg?key=ada",
    price: 0.45,
    change24h: -1.25,
    volume24h: 1200000000,
    marketCap: 15000000000,
    isFavorite: false,
    isHot: false,
    isNew: false,
    color: "#0033AD",
    priceData: generateMiniPriceData(0.45, -1.25),
  },
  {
    id: "dot",
    name: "Polkadot",
    symbol: "DOT",
    icon: "/mockup-wallet/placeholder.svg?key=dot",
    price: 6.23,
    change24h: -0.75,
    volume24h: 950000000,
    marketCap: 7500000000,
    isFavorite: false,
    isHot: false,
    isNew: false,
    color: "#E6007A",
    priceData: generateMiniPriceData(6.23, -0.75),
  },
  {
    id: "doge",
    name: "Dogecoin",
    symbol: "DOGE",
    icon: "/mockup-wallet/placeholder.svg?key=doge",
    price: 0.12,
    change24h: 5.45,
    volume24h: 1800000000,
    marketCap: 16000000000,
    isFavorite: false,
    isHot: true,
    isNew: false,
    color: "#C2A633",
    priceData: generateMiniPriceData(0.12, 5.45),
  },
  {
    id: "avax",
    name: "Avalanche",
    symbol: "AVAX",
    icon: "/mockup-wallet/placeholder.svg?key=avax",
    price: 35.75,
    change24h: 2.85,
    volume24h: 1500000000,
    marketCap: 12500000000,
    isFavorite: false,
    isHot: false,
    isNew: true,
    color: "#E84142",
    priceData: generateMiniPriceData(35.75, 2.85),
  },
  {
    id: "atom",
    name: "Cosmos",
    symbol: "ATOM",
    icon: "/mockup-wallet/placeholder.svg?key=atom",
    price: 9.85,
    change24h: 1.35,
    volume24h: 850000000,
    marketCap: 3700000000,
    isFavorite: false,
    isHot: false,
    isNew: true,
    color: "#2E3148",
    priceData: generateMiniPriceData(9.85, 1.35),
  },
];

// Componente para el mini gráfico de precios
const MiniPriceChart = ({
  coinId,
  data,
  change,
}: {
  coinId: string;
  data: Array<{ price: number }>;
  change: number;
}) => {
  const color = change >= 0 ? "#10B981" : "#EF4444";

  return (
    <div className="h-[40px] w-[80px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id={`miniGradient-${coinId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            fillOpacity={1}
            fill={`url(#miniGradient-${coinId})`}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function MarketView({
  onAction,
}: {
  onAction: (action: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [marketCoins, setMarketCoins] = useState<MarketCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(["btc", "eth", "sol"]);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadMarket() {
      try {
        setIsLoading(true);
        const all = await getCryptoCurrencies(true);
        if (cancelled) return;
        const filtered = all
          .filter((c) => !MOBILE_MARKET_EXCLUDED_SYMBOLS.has(c.symbol.toUpperCase()))
          .map(mapToMarketCoin);
        filtered.sort((a, b) => {
          const ai = MOBILE_MARKET_PRIORITY.indexOf(a.symbol);
          const bi = MOBILE_MARKET_PRIORITY.indexOf(b.symbol);
          if (ai !== -1 && bi !== -1) return ai - bi;
          if (ai !== -1) return -1;
          if (bi !== -1) return 1;
          return (b.volume24h ?? 0) - (a.volume24h ?? 0);
        });
        setMarketCoins(filtered);
      } catch {
        // Si falla la carga, lista vacía — sin fallback hardcoded
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadMarket();
    return () => { cancelled = true; };
  }, []);

  // Filtrar monedas según la pestaña activa
  const filteredCoins = marketCoins.filter((coin) => {
    if (activeTab === "favorites") return favorites.includes(coin.id);
    if (activeTab === "hot") return coin.isHot;
    if (activeTab === "new") return coin.isNew;
    return true; // "all" tab
  });

  // Función para alternar favoritos
  const toggleFavorite = (coinId: string) => {
    setFavorites((prev) =>
      prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
    );
  };

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowLeft className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-lg font-medium text-white">Mercado</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Banner promocional */}
      <div
        className="bg-gradient-to-r from-blue-900 to-blue-700 mx-4 my-3 p-4 rounded-lg cursor-pointer"
        onClick={() => onAction("deposit-bnb")}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Explora productos cripto</h3>
            <p className="text-blue-100 text-sm mt-1">
              Consulta rendimientos disponibles en la app
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-800">
        <button
          className={cn(
            "py-3 px-4 text-sm font-medium",
            activeTab === "favorites"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400"
          )}
          onClick={() => setActiveTab("favorites")}
        >
          Favoritos
        </button>
        <button
          className={cn(
            "py-3 px-4 text-sm font-medium",
            activeTab === "all"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400"
          )}
          onClick={() => setActiveTab("all")}
        >
          Todos
        </button>
        <button
          className={cn(
            "py-3 px-4 text-sm font-medium",
            activeTab === "hot"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400"
          )}
          onClick={() => setActiveTab("hot")}
        >
          Destacados
        </button>
        <button
          className={cn(
            "py-3 px-4 text-sm font-medium",
            activeTab === "new"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400"
          )}
          onClick={() => setActiveTab("new")}
        >
          Nuevos
        </button>
      </div>

      {/* Encabezados de la tabla */}
      <div className="flex items-center px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
        <div className="w-[40%]">Nombre/Último precio</div>
        <div className="w-[20%] text-right">Cambio 24h</div>
        <div className="w-[40%] text-right">Gráfico</div>
      </div>

      {/* Lista de monedas */}
      <div className="flex-1 overflow-y-auto mock-wallet-scroll pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Cargando precios...</p>
          </div>
        ) : filteredCoins.length > 0 ? (
          filteredCoins.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center px-4 py-3 border-b border-gray-800 hover:bg-gray-900 cursor-pointer"
              onClick={() => setSelectedCoin(coin.id)}
            >
              {/* Columna izquierda */}
              <div className="flex items-center w-[60%]">
                <button
                  className="mr-2 text-gray-400 hover:text-yellow-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(coin.id);
                  }}
                >
                  {favorites.includes(coin.id) ? (
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </button>
                {coin.icon ? (
                  <img
                    src={coin.icon}
                    alt={coin.symbol}
                    className="w-8 h-8 rounded-full mr-2 object-contain bg-gray-800"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full mr-2 bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] text-gray-300 font-bold">{coin.symbol.slice(0, 3)}</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">
                      {coin.symbol}
                    </span>
                    {coin.isHot && (
                      <span className="ml-1 px-1 py-0.5 text-[10px] bg-red-600 text-white rounded">
                        HOT
                      </span>
                    )}
                    {coin.isNew && (
                      <span className="ml-1 px-1 py-0.5 text-[10px] bg-green-600 text-white rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex text-xs text-gray-400">
                    {formatUsdPrice(coin.price)}
                    <span
                      className={cn(
                        "ml-2 text-xs font-medium",
                        coin.change24h >= 0 ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {coin.change24h >= 0 ? "+" : ""}
                      {coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="w-[40%] flex justify-end items-center">
                <MiniPriceChart
                  coinId={coin.id}
                  data={coin.priceData}
                  change={coin.change24h}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">
              No hay monedas
            </h3>
            <p className="text-sm text-gray-400">
              No hay monedas que coincidan con los criterios de filtrado
              actuales.
            </p>
          </div>
        )}
      </div>
      {/* Vista detallada de la moneda */}
      {selectedCoin && (
        <CoinDetailView
          coinId={selectedCoin}
          onBack={() => setSelectedCoin(null)}
          marketCoins={marketCoins}
        />
      )}
    </div>
  );
}
