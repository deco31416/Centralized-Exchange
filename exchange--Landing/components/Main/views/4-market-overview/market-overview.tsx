"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  TrendingUp,
  BarChart3,
  Globe,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CryptoPriceData } from "@/types/crypto-price-data";
import { getCryptoBySymbols, getGainers, getLosers, getMarketStats, MarketStats } from "@/services/CryptoService";
import { SafeImage } from "@/components/Main/views/1-hero/safe-image";
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons";

/** Formatea un número USD grande como "2.45T", "98.7B", "123.4M" */
function formatLargeUsd(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// Tokens de plataforma interna — no exponer en sección pública de mercado general
const INTERNAL_MARKET_EXCLUDED_SYMBOLS = new Set(["DECOX", "DECO", "DECO"]);

/** Formatea porcentajes de cambio con máximo 2 decimales */
function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
}

const marketCardClass =
  "overflow-hidden rounded-[var(--radius)] border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-none dark:hover:shadow-none";

export default function MarketOverview() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const [trendingData, setTrendingData] = useState<CryptoPriceData[]>([]);
  const [gainersData, setGainersData] = useState<CryptoPriceData[]>([]);
  const [losersData, setLosersData] = useState<CryptoPriceData[]>([]);
  // MARKET-TEMP-001/002/003 — derivados del aggregator (sum marketCap+volume24h por activo)
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  // Format price with appropriate decimal places
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(3);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const getCoinIcon = (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase();

    if (normalizedSymbol === "WLD") {
      return isDark
        ? "/images/logos/altcoins/worldcoin-wld-white-logo_noc05w.svg"
        : "/images/logos/altcoins/worldcoin-wld-dark-logo_nefjwe.svg";
    }

    return LOCAL_CURRENCY_ICONS[normalizedSymbol] ?? null;
  };

  useEffect(() => {
    async function fetchTrending() {
      try {
        const response = await getCryptoBySymbols([
          "BTC", // BTC
          "ETH", // ETH
          "BNB", // BNB
          "SOL", // Solana
        ]);
        setTrendingData(response.filter((c) => !INTERNAL_MARKET_EXCLUDED_SYMBOLS.has(c.symbol.toUpperCase())));
      } catch (error) {
        console.error("Error al obtener criptomonedas tendencias:", error);
      }
    }
    async function fetchGainers() {
      try {
        const response = await getGainers();
        setGainersData(response.filter((c) => !INTERNAL_MARKET_EXCLUDED_SYMBOLS.has(c.symbol.toUpperCase())));
      } catch (error) {
        console.error("Error al obtener criptomonedas ganadoras:", error);
      }
    }
    async function fetchLosers() {
      try {
        const response = await getLosers();
        setLosersData(response.filter((c) => !INTERNAL_MARKET_EXCLUDED_SYMBOLS.has(c.symbol.toUpperCase())));
      } catch (error) {
        console.error("Error al obtener criptomonedas perdedoras:", error);
      }
    }

    async function fetchStats() {
      try {
        const stats = await getMarketStats();
        setMarketStats(stats);
      } catch (error) {
        console.error("Error al obtener market stats:", error);
      }
    }

    fetchGainers();
    fetchLosers();
    fetchTrending();
    fetchStats();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section id="mercados" className="py-10 md:py-14 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">Resumen del mercado</h2>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1.5 rounded-[var(--radius)] border border-border bg-muted/45 p-1.5 shadow-sm dark:bg-muted/20 sm:grid-cols-4">
            <TabsTrigger className="rounded-[calc(var(--radius)-0.45rem)] py-3 text-sm font-semibold data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none" value="overview">Resumen</TabsTrigger>
            <TabsTrigger className="rounded-[calc(var(--radius)-0.45rem)] py-3 text-sm font-semibold data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none" value="trending">Tendencias</TabsTrigger>
            <TabsTrigger className="rounded-[calc(var(--radius)-0.45rem)] py-3 text-sm font-semibold data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none" value="gainers">Mayores subidas</TabsTrigger>
            <TabsTrigger className="rounded-[calc(var(--radius)-0.45rem)] py-3 text-sm font-semibold data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none" value="losers">Mayores caídas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className={marketCardClass}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    Capitalización
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${formatLargeUsd(marketStats?.totalMarketCapUsd ?? 0)}
                  </div>
                  <CardDescription>
                    Capitalización total del mercado cripto
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className={marketCardClass}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    Volumen 24 h
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${formatLargeUsd(marketStats?.totalVolume24hUsd ?? 0)}
                  </div>
                  <CardDescription>
                    Volumen total operado en las últimas 24 horas
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className={marketCardClass}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    Dominancia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">BTC</span>
                    <span className="text-sm font-medium">
                      {marketStats ? `${marketStats.btcDominance.toFixed(1)}%` : "—"}
                    </span>
                  </div>
                  <Progress
                    value={marketStats?.btcDominance ?? 0}
                    className="h-2 mb-3"
                  />

                  <div className="flex justify-between mb-1">
                    <span className="text-sm">ETH</span>
                    <span className="text-sm font-medium">
                      {marketStats ? `${marketStats.ethDominance.toFixed(1)}%` : "—"}
                    </span>
                  </div>
                  <Progress
                    value={marketStats?.ethDominance ?? 0}
                    className="h-2"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {trendingData.map((coin, index) => (
                <Card key={index} className={marketCardClass}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                          <SafeImage
                            src={getCoinIcon(coin.symbol)}
                            alt={`${coin.symbol} logo`}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold">{coin.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          coin.averageChange24h >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {coin.averageChange24h >= 0 ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {formatPercent(Math.abs(coin.averageChange24h))}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Precio estimado
                    </p>
                    <div className="text-xl font-bold">
                      ${formatPrice(coin.averagePrice)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gainers">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {gainersData.map((coin, index) => (
                <Card key={index} className={marketCardClass}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                          <SafeImage
                            src={getCoinIcon(coin.symbol)}
                            alt={`${coin.symbol} logo`}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold">{coin.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-500">
                        <ArrowUp className="h-4 w-4" />
                        <span className="font-medium">
                          {formatPercent(Math.abs(coin.averageChange24h))}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Precio estimado
                    </p>
                    <div className="text-xl font-bold">
                      ${formatPrice(coin.averagePrice)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="losers">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {losersData.map((coin, index) => (
                <Card key={index} className={marketCardClass}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                          <SafeImage
                            src={getCoinIcon(coin.symbol)}
                            alt={`${coin.symbol} logo`}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold">{coin.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-red-500">
                        <ArrowDown className="h-4 w-4" />
                        <span className="font-medium">
                          {formatPercent(Math.abs(coin.averageChange24h))}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Precio estimado
                    </p>
                    <div className="text-xl font-bold">
                      ${formatPrice(coin.averagePrice)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
