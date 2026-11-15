"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bell,
  Search,
  Filter,
  Plus,
  User,
  DollarSign,
  CreditCard,
  Star,
  StarOff,
  AlertCircle,
  Info,
  Check,
  BarChart2,
  TrendingUp,
  Clock,
  Shield,
  Award,
  Zap,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer } from "recharts";

// Tipos para los datos del mercado P2P
type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

type P2POffer = {
  id: string;
  type: "buy" | "sell";
  user: {
    id: string;
    name: string;
    completedTrades: number;
    completionRate: number;
    verified: boolean;
  };
  asset: string;
  fiat: string;
  price: number;
  available: number;
  limits: {
    min: number;
    max: number;
  };
  paymentMethods: string[];
  createdAt: Date;
  isFavorite?: boolean;
};

type P2PTrend = {
  asset: string;
  change24h: number;
  volume24h: number;
  trades24h: number;
  priceData: { price: number }[];
};

type P2PTestimonial = {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: Date;
};

// Datos mockeados para el mercado P2P
const paymentMethods: PaymentMethod[] = [
  {
    id: "bank",
    name: "Transferencia bancaria",
    icon: <CreditCard className="w-4 h-4" />,
  },
  { id: "cash", name: "Efectivo", icon: <DollarSign className="w-4 h-4" /> },
  {
    id: "card",
    name: "Tarjeta de crédito",
    icon: <CreditCard className="w-4 h-4" />,
  },
  { id: "paypal", name: "PayPal", icon: <DollarSign className="w-4 h-4" /> },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    icon: <DollarSign className="w-4 h-4" />,
  },
];

const p2pOffers: P2POffer[] = [
  {
    id: "offer1",
    type: "buy",
    user: {
      id: "user1",
      name: "CryptoTrader",
      completedTrades: 245,
      completionRate: 99.2,
      verified: true,
    },
    asset: "BTC",
    fiat: "USD",
    price: 95500,
    available: 0.5,
    limits: {
      min: 100,
      max: 10000,
    },
    paymentMethods: ["bank", "card"],
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    isFavorite: true,
  },
  {
    id: "offer2",
    type: "sell",
    user: {
      id: "user2",
      name: "BitcoinMaster",
      completedTrades: 178,
      completionRate: 98.5,
      verified: true,
    },
    asset: "BTC",
    fiat: "USD",
    price: 95800,
    available: 0.25,
    limits: {
      min: 200,
      max: 5000,
    },
    paymentMethods: ["bank", "cash"],
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    isFavorite: false,
  },
  {
    id: "offer3",
    type: "buy",
    user: {
      id: "user3",
      name: "CoinCollector",
      completedTrades: 56,
      completionRate: 100,
      verified: true,
    },
    asset: "ETH",
    fiat: "USD",
    price: 3440,
    available: 5,
    limits: {
      min: 50,
      max: 3000,
    },
    paymentMethods: ["bank", "paypal"],
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
    isFavorite: false,
  },
  {
    id: "offer4",
    type: "sell",
    user: {
      id: "user4",
      name: "EtherExpert",
      completedTrades: 89,
      completionRate: 97.8,
      verified: false,
    },
    asset: "ETH",
    fiat: "USD",
    price: 3460,
    available: 2.5,
    limits: {
      min: 100,
      max: 2000,
    },
    paymentMethods: ["bank", "mercadopago"],
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    isFavorite: true,
  },
  {
    id: "offer5",
    type: "buy",
    user: {
      id: "user5",
      name: "BNBBuyer",
      completedTrades: 124,
      completionRate: 99.5,
      verified: true,
    },
    asset: "BNB",
    fiat: "USD",
    price: 535,
    available: 10,
    limits: {
      min: 50,
      max: 5000,
    },
    paymentMethods: ["bank", "card", "paypal"],
    createdAt: new Date(Date.now() - 1000 * 60 * 180),
    isFavorite: false,
  },
  {
    id: "offer6",
    type: "sell",
    user: {
      id: "user6",
      name: "SolanaSeller",
      completedTrades: 67,
      completionRate: 98.2,
      verified: true,
    },
    asset: "SOL",
    fiat: "USD",
    price: 179,
    available: 25,
    limits: {
      min: 30,
      max: 3000,
    },
    paymentMethods: ["bank", "cash"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    isFavorite: false,
  },
  {
    id: "offer7",
    type: "buy",
    user: {
      id: "user7",
      name: "USDCTrader",
      completedTrades: 312,
      completionRate: 99.8,
      verified: true,
    },
    asset: "USDC",
    fiat: "USD",
    price: 1.01,
    available: 5000,
    limits: {
      min: 100,
      max: 10000,
    },
    paymentMethods: ["bank", "card", "paypal"],
    createdAt: new Date(Date.now() - 1000 * 60 * 240),
    isFavorite: true,
  },
  {
    id: "offer8",
    type: "sell",
    user: {
      id: "user8",
      name: "DogeLover",
      completedTrades: 45,
      completionRate: 96.5,
      verified: false,
    },
    asset: "DOGE",
    fiat: "USD",
    price: 0.121,
    available: 10000,
    limits: {
      min: 20,
      max: 1000,
    },
    paymentMethods: ["paypal", "mercadopago"],
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
    isFavorite: false,
  },
];

const p2pTrends: P2PTrend[] = [
  {
    asset: "BTC",
    change24h: 1.2,
    volume24h: 1250000,
    trades24h: 342,
    priceData: Array(24)
      .fill(0)
      .map((_, i) => ({ price: 95500 + Math.sin(i * 1.5 + 11) * 500 })),
  },
  {
    asset: "ETH",
    change24h: 0.8,
    volume24h: 750000,
    trades24h: 215,
    priceData: Array(24)
      .fill(0)
      .map((_, i) => ({ price: 3450 + Math.sin(i * 1.5 + 23) * 50 })),
  },
  {
    asset: "BNB",
    change24h: -0.5,
    volume24h: 320000,
    trades24h: 128,
    priceData: Array(24)
      .fill(0)
      .map((_, i) => ({ price: 536 + Math.sin(i * 1.5 + 7) * 5 })),
  },
  {
    asset: "USDC",
    change24h: 0.01,
    volume24h: 890000,
    trades24h: 267,
    priceData: Array(24)
      .fill(0)
      .map((_, i) => ({ price: 1 + Math.sin(i * 1.5 + 31) * 0.0025 })),
  },
];

const p2pTestimonials: P2PTestimonial[] = [
  {
    id: "t1",
    user: "CryptoEnthusiast",
    rating: 5,
    comment: "Excelente experiencia. Transacción rápida y segura.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "t2",
    user: "BitcoinTrader",
    rating: 4,
    comment: "Buen servicio, aunque el proceso podría ser más rápido.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: "t3",
    user: "CryptoNewbie",
    rating: 5,
    comment: "Muy fácil de usar para principiantes. Recomendado.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
];

// Componente para la vista de mercado P2P
export default function P2PMarketView({
  onAction,
}: {
  onAction: (action: string, data?: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [selectedFiat, setSelectedFiat] = useState<string>("USD");
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >([]);
  const [favorites, setFavorites] = useState<string[]>(
    p2pOffers.filter((offer) => offer.isFavorite).map((offer) => offer.id)
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [showTrends, setShowTrends] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(false);

  // Asegurar que todos los elementos scrollables tengan el scrollbar personalizado
  useEffect(() => {
    const p2pContainer = document.querySelector(".p2p-container");
    if (p2pContainer) {
      // Asegurar que el contenedor principal tenga las clases de scroll
      p2pContainer.classList.add("mock-wallet-scroll");

      // Aplicar a otros elementos scrollables dentro del contenedor
      const scrollElements = p2pContainer.querySelectorAll(
        'div[style*="overflow"], div[class*="overflow"]'
      );
      scrollElements.forEach((el) => {
        el.classList.add("mock-wallet-scroll");
      });
    }
  }, []);

  // Filtrar ofertas según los criterios seleccionados
  const filteredOffers = p2pOffers.filter((offer) => {
    // Filtrar por tipo (compra/venta)
    if (offer.type !== activeTab) return false;

    // Filtrar por activo
    if (selectedAsset && offer.asset !== selectedAsset) return false;

    // Filtrar por moneda fiat
    if (selectedFiat && offer.fiat !== selectedFiat) return false;

    // Filtrar por métodos de pago (si hay alguno seleccionado)
    if (
      selectedPaymentMethods.length > 0 &&
      !offer.paymentMethods.some((method) =>
        selectedPaymentMethods.includes(method)
      )
    ) {
      return false;
    }

    return true;
  });

  // Función para alternar favoritos
  const toggleFavorite = (offerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(offerId)
        ? prev.filter((id) => id !== offerId)
        : [...prev, offerId]
    );
  };

  // Función para formatear la fecha relativa
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  };

  // Componente para mini gráfico de tendencias
  const TrendMiniChart = ({
    data,
    change,
    chartId = "default",
  }: {
    data: any[];
    change: number;
    chartId?: string;
  }) => {
    const color = change >= 0 ? "#10B981" : "#EF4444";
    const gradientId = `trendGradient-${chartId}`;

    return (
      <div className="h-[40px] w-[80px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={gradientId}
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
              fill={`url(#${gradientId})`}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Componente para gráfico de volumen
  const VolumeChart = ({ asset }: { asset: string }) => {
    // Datos mockeados para el volumen por hora (determinístico basado en asset)
    const assetSeed = asset.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const volumeData = Array(24)
      .fill(0)
      .map((_, i) => ({
        hour: i,
        volume: Math.abs(Math.sin(i * 2.7 + assetSeed % 97)) * 40000 + 10000,
      }));

    return (
      <div className="h-[100px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={volumeData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <Bar dataKey="volume" fill="#3B82F6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Renderizar estrellas para calificación
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Award
          key={i}
          className={`w-3 h-3 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
          }`}
        />
      ));
  };

  // Renderizar la vista de detalles de la oferta
  const renderOfferDetails = () => {
    const offer = p2pOffers.find((o) => o.id === selectedOffer);
    if (!offer) return null;

    return (
      <div className="absolute inset-0 bg-black flex flex-col z-20 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto mock-wallet-scroll">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedOffer(null)}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium text-white">
                {offer.type === "buy" ? "Comprar" : "Vender"} {offer.asset}
              </span>
              <div className="w-5"></div>
            </div>
          </div>

          <div className="p-4">
            {/* Información del anunciante */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-white font-medium">
                        {offer.user.name}
                      </span>
                      {offer.user.verified && (
                        <Check className="w-4 h-4 text-green-500 ml-1" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {offer.user.completedTrades} operaciones |{" "}
                      {offer.user.completionRate}% de finalización
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => toggleFavorite(offer.id, e)}
                  className="text-gray-400 hover:text-yellow-400"
                >
                  {favorites.includes(offer.id) ? (
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    Última actividad: {formatRelativeTime(offer.createdAt)}
                  </span>
                </div>
                <div className="flex items-center text-xs text-green-500">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>Comerciante verificado</span>
                </div>
              </div>
            </div>

            {/* Detalles de la oferta */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="text-white font-medium mb-3">
                Información de la oferta
              </h3>

              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Precio</span>
                <span className="text-sm text-white font-medium">
                  ${offer.price.toLocaleString()} {offer.fiat}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Disponible</span>
                <div className="text-right">
                  <span className="text-sm text-white font-medium">
                    {offer.available} {offer.asset}
                  </span>
                  <div className="text-xs text-gray-400">
                    (${(offer.available * offer.price).toLocaleString()})
                  </div>
                </div>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Límites</span>
                <span className="text-sm text-white">
                  ${offer.limits.min.toLocaleString()} - $
                  {offer.limits.max.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Tiempo de pago</span>
                <span className="text-sm text-white">15 minutos</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-400">Métodos de pago</span>
                <div className="text-right">
                  {offer.paymentMethods.map((methodId) => {
                    const method = paymentMethods.find(
                      (m) => m.id === methodId
                    );
                    return (
                      <div
                        key={methodId}
                        className="text-sm text-white flex items-center justify-end mb-1"
                      >
                        {method?.icon}
                        <span className="ml-1">{method?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Estadísticas de mercado */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="text-white font-medium mb-3">
                Estadísticas de mercado
              </h3>

              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Precio promedio</span>
                <span className="text-sm text-white">
                  ${(offer.price * 0.995).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Volumen 24h</span>
                <span className="text-sm text-white">
                  ${Math.round(offer.price * offer.available * 0.3).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-400">
                  Operaciones completadas
                </span>
                <span className="text-sm text-white">
                  {offer.user.completedTrades}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-xs text-gray-400 mb-1">
                  Tendencia de precio (24h)
                </div>
                <TrendMiniChart
                  data={Array(24)
                    .fill(0)
                    .map((_, i) => ({
                      price: offer.price * (1 + Math.sin(i * 1.5 + offer.price % 100) * 0.02),
                    }))}
                  change={1.2}
                  chartId={`stats-${offer.id}`}
                />
              </div>
            </div>

            {/* Formulario de operación */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="text-white font-medium mb-3">
                {offer.type === "buy" ? "Vender" : "Comprar"} {offer.asset}
              </h3>

              <div className="mb-3">
                <label className="text-sm text-gray-400 block mb-1">
                  Quiero {offer.type === "buy" ? "vender" : "comprar"}
                </label>
                <div className="flex">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="bg-gray-800 text-white p-3 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500 mock-wallet-scroll"
                  />
                  <div className="bg-gray-700 text-white p-3 rounded-r-lg flex items-center">
                    {offer.asset}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Min: {(offer.limits.min / offer.price).toFixed(8)}{" "}
                  {offer.asset} | Max:{" "}
                  {(offer.limits.max / offer.price).toFixed(8)} {offer.asset}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-1">
                  Recibiré
                </label>
                <div className="flex">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="bg-gray-800 text-white p-3 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500 mock-wallet-scroll"
                  />
                  <div className="bg-gray-700 text-white p-3 rounded-r-lg flex items-center">
                    {offer.fiat}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onAction("p2p-trade", { offerId: offer.id })}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {offer.type === "buy" ? "Vender" : "Comprar"} {offer.asset}
              </button>
            </div>

            {/* Términos y condiciones */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">
                  Al iniciar esta operación, acepta los términos y condiciones
                  del comerciante y de deco-exchange P2P. Asegúrese de revisar los
                  detalles de la operación antes de proceder.
                </p>
              </div>
            </div>

            {/* Reseñas del comerciante */}
            <div className="bg-gray-900 rounded-lg p-4 mb-20">
              <h3 className="text-white font-medium mb-3">
                Reseñas del comerciante
              </h3>

              {p2pTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border-b border-gray-800 py-3 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                        <User className="w-3 h-3 text-gray-300" />
                      </div>
                      <span className="text-sm text-white">
                        {testimonial.user}
                      </span>
                    </div>
                    <div className="flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    {testimonial.comment}
                  </p>
                  <div className="text-xs text-gray-500">
                    {formatRelativeTime(testimonial.date)}
                  </div>
                </div>
              ))}

              <button className="text-blue-500 text-sm mt-2 flex items-center">
                Ver todas las reseñas <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-y-auto mock-wallet-scroll p2p-container">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowLeft className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-lg font-medium text-white">P2P Trading</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white">
              <Search className="w-5 h-5" />
            </button>
            <button
              className={`text-gray-400 hover:text-white ${
                showFilters ? "text-blue-500" : ""
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Banner promocional mejorado */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 mx-4 my-3 p-4 rounded-lg shadow-lg">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-300 mr-2" />
              <h3 className="text-white font-medium">Comercio P2P Seguro</h3>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Compra y vende criptomonedas con +50 métodos de pago
            </p>
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2 mt-2 text-xs text-blue-200">
            <div className="flex items-center">
              <Check className="w-3 h-3 mr-1" />
              <span>0% comisiones</span>
            </div>
            <div className="flex items-center">
              <Check className="w-3 h-3 mr-1" />
              <span>Custodia segura</span>
            </div>
            <div className="flex items-center">
              <Check className="w-3 h-3 mr-1" />
              <span>KYC verificado</span>
            </div>
          </div>

          </div>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm w-fit"
            onClick={() => onAction("p2p-guide")}
          >
            Comenzar
          </button>
        </div>
      </div>

      {/* Estadísticas del mercado P2P */}
      {showTrends && (
        <div className="mx-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white flex items-center">
              <BarChart2 className="w-4 h-4 mr-1 text-blue-500" />
              Tendencias del mercado P2P
            </h3>
            <button
              className="text-xs text-blue-500"
              onClick={() => setShowTrends(!showTrends)}
            >
              {showTrends ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {p2pTrends.slice(0, 4).map((trend) => (
              <div key={trend.asset} className="bg-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">
                    {trend.asset}/USD
                  </span>
                  <span
                    className={`text-xs ${
                      trend.change24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {trend.change24h >= 0 ? "+" : ""}
                    {trend.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    Vol: ${(trend.volume24h / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-xs text-gray-400">
                    {trend.trades24h} trades
                  </span>
                </div>
                <TrendMiniChart
                  data={trend.priceData}
                  change={trend.change24h}
                  chartId={trend.asset}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerta de seguridad */}
      <div className="mx-4 mb-3 bg-yellow-900 bg-opacity-30 border border-yellow-800 rounded-lg p-3">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-500">
              Consejos de seguridad
            </h4>
            <p className="text-xs text-yellow-200 mt-1">
              Nunca realice pagos fuera de la plataforma. Verifique siempre la
              reputación del comerciante.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-gray-900 mx-4 my-2 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Activo</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded-lg mock-wallet-scroll"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="BNB">BNB</option>
                <option value="USDC">USDC</option>
                <option value="SOL">SOL</option>
                <option value="DOGE">DOGE</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Moneda</label>
              <select
                className="w-full bg-gray-800 text-white p-2 rounded-lg mock-wallet-scroll"
                value={selectedFiat}
                onChange={(e) => setSelectedFiat(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-400 block mb-1">
              Métodos de pago
            </label>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  className={cn(
                    "flex items-center px-2 py-1 rounded-full text-xs",
                    selectedPaymentMethods.includes(method.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300"
                  )}
                  onClick={() => {
                    setSelectedPaymentMethods((prev) =>
                      prev.includes(method.id)
                        ? prev.filter((id) => id !== method.id)
                        : [...prev, method.id]
                    );
                  }}
                >
                  {method.icon}
                  <span className="ml-1">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-400 block mb-1">
              Opciones adicionales
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-gray-800 rounded-lg p-2">
                <input type="checkbox" className="mr-2" id="verified-only" />
                <label
                  htmlFor="verified-only"
                  className="text-xs text-gray-300"
                >
                  Solo verificados
                </label>
              </div>
              <div className="flex items-center bg-gray-800 rounded-lg p-2">
                <input type="checkbox" className="mr-2" id="online-only" />
                <label htmlFor="online-only" className="text-xs text-gray-300">
                  Solo en línea
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              className="text-gray-400 text-sm"
              onClick={() => {
                setSelectedAsset("BTC");
                setSelectedFiat("USD");
                setSelectedPaymentMethods([]);
              }}
            >
              Restablecer
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm"
              onClick={() => setShowFilters(false)}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-800">
        <button
          className={cn(
            "py-3 px-4 text-sm font-medium",
            activeTab === "buy"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400"
          )}
          onClick={() => setActiveTab("buy")}
        >
          Comprar
        </button>
        <button
          className={cn(
            "py-3 px-4 text-sm font-medium",
            activeTab === "sell"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400"
          )}
          onClick={() => setActiveTab("sell")}
        >
          Vender
        </button>
      </div>

      {/* Volumen de trading */}
      <div className="px-4 py-3 border-b border-gray-800">
  <div className="flex items-center justify-between flex-wrap gap-y-1">
    <div className="flex items-center flex-shrink-0 space-x-1">
      <TrendingUp className="w-4 h-4 text-blue-500" />
      <span className="!text-[9px] sm:text-xs text-gray-400">Volumen 24h:</span>
      <span className="!text-[9px] sm:text-xs text-white">${(3250000).toLocaleString()}</span>
    </div>
    <div className="flex items-center flex-shrink-0 space-x-1 mt-1 sm:mt-0">
      <Zap className="w-4 h-4 text-blue-500" />
      <span className="!text-[9px] sm:text-xs text-gray-400">Operaciones:</span>
      <span className="!text-[9px] sm:text-xs text-white">1,245</span>
    </div>
  </div>
</div>



      {/* Lista de ofertas */}
      <div className="flex-1 pb-20">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="px-4 py-3 border-b border-gray-800 hover:bg-gray-900 cursor-pointer mb-[40px]"
              onClick={() => setSelectedOffer(offer.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-white">
                        {offer.user.name}
                      </span>
                      {offer.user.verified && (
                        <Check className="w-3 h-3 text-green-500 ml-1" />
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{offer.user.completedTrades} operaciones</span>
                      <span className="mx-1">•</span>
                      <span>{offer.user.completionRate}%</span>
                      {offer.user.completionRate > 98 && (
                        <>
                          <span className="mx-1">•</span>
                          <Award className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-yellow-500">Top trader</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => toggleFavorite(offer.id, e)}
                  className="text-gray-400 hover:text-yellow-400"
                >
                  {favorites.includes(offer.id) ? (
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-lg font-bold text-white">
                  ${offer.price.toLocaleString()}
                </span>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(offer.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex flex-wrap gap-1">
                  {offer.paymentMethods.map((methodId) => {
                    const method = paymentMethods.find(
                      (m) => m.id === methodId
                    );
                    return (
                      <div
                        key={methodId}
                        className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded-full flex items-center"
                      >
                        {method?.icon}
                        <span className="ml-1">{method?.name}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Disponible:{" "}
                    <span className="text-white font-medium">
                      {offer.available} {offer.asset}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Límites: ${offer.limits.min.toLocaleString()} - $
                    {offer.limits.max.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Info className="w-12 h-12 text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">
              No hay ofertas disponibles
            </h3>
            <p className="text-sm text-gray-400">
              No hay ofertas que coincidan con los criterios de filtrado
              actuales.
            </p>
          </div>
        )}

        {/* Testimonios de usuarios */}
        {showTestimonials && (
          <div className="px-4 py-3 mt-2 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white flex items-center">
                <Award className="w-4 h-4 mr-1 text-yellow-500" />
                Testimonios de usuarios
              </h3>
              <button
                className="text-xs text-blue-500"
                onClick={() => setShowTestimonials(!showTestimonials)}
              >
                {showTestimonials ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-3">
              {p2pTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border-b border-gray-800 py-2 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">
                      {testimonial.user}
                    </span>
                    <div className="flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{testimonial.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante para crear oferta */}
      <div className="absolute bottom-20 right-4">
        <button
          className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
          onClick={() => onAction("create-p2p-offer")}
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Vista detallada de la oferta */}
      {selectedOffer && renderOfferDetails()}
    </div>
  );
}
