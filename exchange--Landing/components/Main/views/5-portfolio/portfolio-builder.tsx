"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SafeImage } from "@/components/Main/views/1-hero/safe-image";
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCryptoBySymbols,
  getStablecoins,
} from "@/services/CryptoService";
import { CryptoPriceData } from "@/types/crypto-price-data";

// Tokens de plataforma interna que NUNCA deben aparecer en ninguna lista pública
const INTERNAL_ALWAYS_EXCLUDED_SYMBOLS = new Set(["DECOX", "DECO"]);
// Popular general: excluye adicionalmente DECO (token propio — pertenece a Novedades/Launchpad)
const POPULAR_EXCLUDED_SYMBOLS = new Set(["DECOX", "DECO", "DECO"]);

/** Formatea un porcentaje de cambio a 2 decimales. El signo +/- debe manejarse en el caller. */
function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
}

const ASSET_DISPLAY_NAMES: Record<string, string> = {
  ADA: "Cardano",
  AVAX: "Avalanche",
  BTC: "Bitcoin",
  BNB: "BNB",
  CRV: "Curve DAO",
  DAI: "Dai",
  DOGE: "Dogecoin",
  DOT: "Polkadot",
  ETH: "Ethereum",
  FRAX: "Frax",
  GUSD: "Gemini Dollar",
  NOW: "ChangeNOW",
  PEPE: "Pepe",
  PYUSD: "PayPal USD",
  SHIB: "Shiba Inu",
  SOL: "Solana",
  TON: "Toncoin",
  TUSD: "TrueUSD",
  USDC: "USD Coin",
  USDD: "USDD",
  USDT: "Tether",
  WLD: "Worldcoin",
  XLM: "Stellar",
  XDAI: "xDai",
};

const POPULAR_ASSET_SYMBOLS = ["BTC", "ETH", "BNB", "SOL", "ADA", "DOT", "DOGE", "AVAX"];
const REWARD_ASSET_SYMBOLS = ["PEPE", "WLD", "USDC", "USDT", "DAI", "PYUSD", "TUSD", "USDD"];
const STABLE_ASSET_SYMBOLS = ["USDC", "USDT", "DAI", "PYUSD", "TUSD", "USDD", "FRAX", "GUSD"];
const NEWS_ASSET_SYMBOLS = ["WLD", "PEPE", "TON", "SHIB", "NOW", "XLM", "CRV", "XDAI"];

export default function PortfolioBuilder() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeTab, setActiveTab] = useState("popular");
  const [popularData, setPopularData] = useState<CryptoPriceData[]>([]);
  const [rewardCoinData, setRewardCoinData] = useState<CryptoPriceData[]>([]);
  const [stableCoinData, setStableCoinData] = useState<CryptoPriceData[]>([]);
  const [newsCoinData, setNewsCoinData] = useState<CryptoPriceData[]>([]);

  useEffect(() => {
    async function fetchPopular() {
      try {
        const response = await getCryptoBySymbols(POPULAR_ASSET_SYMBOLS);
        setPopularData(response.filter((c) => !POPULAR_EXCLUDED_SYMBOLS.has(c.symbol.toUpperCase())));
      } catch (error) {
        console.error("Error al obtener criptomonedas populares:", error);
      }
    }

    async function fetchStableCoins() {
      try {
        const response = await getStablecoins();
        setStableCoinData(response.filter((c) => !INTERNAL_ALWAYS_EXCLUDED_SYMBOLS.has(c.symbol.toUpperCase())));
      } catch (error) {
        console.error("Error al obtener monedas estables:", error);
      }
    }

    async function fetchRewardCoins() {
      try {
        const response = await getCryptoBySymbols(REWARD_ASSET_SYMBOLS);
        setRewardCoinData(response.filter((c) => !INTERNAL_ALWAYS_EXCLUDED_SYMBOLS.has(c.symbol.toUpperCase())));
      } catch (error) {
        console.error("Error al obtener criptomonedas de recompensas:", error);
      }
    }

    async function fetchNewsCoins() {
      try {
        const response = await getCryptoBySymbols(NEWS_ASSET_SYMBOLS);
        setNewsCoinData(response.filter((c) => !INTERNAL_ALWAYS_EXCLUDED_SYMBOLS.has(c.symbol.toUpperCase())));
      } catch (error) {
        console.error("Error al obtener criptomonedas de noticias:", error);
      }
    }

    fetchPopular();
    fetchRewardCoins();
    fetchStableCoins();
    fetchNewsCoins();
  }, []);
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getAssetName = (asset: Pick<CryptoPriceData, "name" | "symbol">) => {
    const symbol = asset.symbol.toUpperCase();
    const rawName = asset.name?.trim();

    if (!rawName || rawName.toUpperCase() === symbol) {
      return ASSET_DISPLAY_NAMES[symbol] ?? symbol;
    }

    return rawName;
  };

  const getAssetIcon = (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase();

    if (normalizedSymbol === "WLD") {
      return isDark
        ? "/images/logos/altcoins/worldcoin-wld-white-logo_noc05w.svg"
        : "/images/logos/altcoins/worldcoin-wld-dark-logo_nefjwe.svg";
    }

    return LOCAL_CURRENCY_ICONS[normalizedSymbol] || "";
  };

  const createFallbackAsset = (symbol: string): CryptoPriceData => ({
    _id: `fallback-${symbol}`,
    symbol,
    name: ASSET_DISPLAY_NAMES[symbol] ?? symbol,
    averagePrice: 0,
    averageChange24h: 0,
    averageVolume24h: 0,
    prices: {
      cryptoCompare: 0,
      coinGecko: 0,
      coinMarketCap: 0,
    },
    createdAt: "",
    updatedAt: "",
    __v: 0,
    imgUrl: "",
  });

  const buildAssetRows = (data: CryptoPriceData[], symbols: string[]) => {
    const dataBySymbol = new Map(
      data.map((asset) => [asset.symbol.toUpperCase(), asset]),
    );

    return symbols
      .map((symbol) => dataBySymbol.get(symbol) ?? createFallbackAsset(symbol))
      .slice(0, 8);
  };

  const renderPriceAssetCard = (crypto: CryptoPriceData) => {
    const symbol = crypto.symbol.toUpperCase();

    return (
      <Card
        key={crypto._id || symbol}
        className="overflow-hidden rounded-[var(--radius)] border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-none dark:hover:shadow-none"
      >
        <CardContent className="flex h-full flex-col p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
              <SafeImage
                src={getAssetIcon(symbol)}
                alt={`${symbol} logo`}
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {getAssetName(crypto)}
              </p>
              <p className="text-sm text-muted-foreground">{symbol}</p>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Precio
              </p>
              <p className="text-lg font-semibold">{formatPrice(crypto.averagePrice)}</p>
            </div>
            <span
              className={`text-sm font-medium ${
                crypto.averageChange24h >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {crypto.averageChange24h >= 0 ? "+" : ""}
              {formatPercent(crypto.averageChange24h)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="cartera" className="py-12 md:py-16 bg-background">
      <div className="container max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10 text-center">
          Construye tu cartera de criptomonedas
        </h2>

        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-8 px-2 sm:px-0">
            <TabsList className="grid h-auto w-full max-w-2xl grid-cols-4 gap-1.5 rounded-[var(--radius)] border border-border bg-muted/45 p-1.5 shadow-sm dark:bg-muted/20 sm:w-auto sm:min-w-[680px]">
              <TabsTrigger
                value="popular"
                className="rounded-[calc(var(--radius)-0.45rem)] px-2 py-3 text-xs font-semibold sm:px-6 sm:text-base data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none"
              >
                <span className="sm:hidden">Popular</span>
                <span className="hidden sm:inline">Popular</span>
              </TabsTrigger>
              <TabsTrigger
                value="recompensas"
                className="rounded-[calc(var(--radius)-0.45rem)] px-2 py-3 text-xs font-semibold sm:px-6 sm:text-base data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none"
              >
                <span className="sm:hidden">Recomp.</span>
                <span className="hidden sm:inline">Recompensas</span>
              </TabsTrigger>
              <TabsTrigger
                value="stablecoins"
                className="rounded-[calc(var(--radius)-0.45rem)] px-2 py-3 text-xs font-semibold sm:px-6 sm:text-base data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none"
              >
                <span className="sm:hidden">Estables</span>
                <span className="hidden sm:inline">Estables</span>
              </TabsTrigger>
              <TabsTrigger
                value="novedades"
                className="rounded-[calc(var(--radius)-0.45rem)] px-2 py-3 text-xs font-semibold sm:px-6 sm:text-base data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none"
              >
                <span className="sm:hidden">Nuevas</span>
                <span className="hidden sm:inline">Novedades</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="popular" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {buildAssetRows(popularData, POPULAR_ASSET_SYMBOLS).map(renderPriceAssetCard)}
            </div>
          </TabsContent>

          <TabsContent value="recompensas" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {buildAssetRows(rewardCoinData, REWARD_ASSET_SYMBOLS).map(renderPriceAssetCard)}
            </div>
          </TabsContent>

          <TabsContent value="stablecoins" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {buildAssetRows(stableCoinData, STABLE_ASSET_SYMBOLS).map(renderPriceAssetCard)}
            </div>
          </TabsContent>

          <TabsContent value="novedades" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {buildAssetRows(newsCoinData, NEWS_ASSET_SYMBOLS).map(renderPriceAssetCard)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
