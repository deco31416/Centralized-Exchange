"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SafeImage } from "@/components/Main/views/1-hero/safe-image"
import { LOCAL_CURRENCY_ICONS } from "@/components/Main/views/1-hero/currency-icons"
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getRandomCryptos } from '@/services/CryptoService';
import { CryptoPriceData } from "@/types/crypto-price-data";

// Tokens de plataforma interna — no exponer en el ticker público de mercado
const INTERNAL_TICKER_EXCLUDED_SYMBOLS = new Set(["DECOX", "DECO", "DECO"]);
const createFallbackToken = (
  symbol: string,
  price: number,
): CryptoPriceData => ({
  _id: `fallback-${symbol.toLowerCase()}`,
  symbol,
  name: symbol,
  averagePrice: price,
  averageChange24h: 0,
  averageVolume24h: 0,
  prices: {
    cryptoCompare: price,
    coinGecko: price,
    coinMarketCap: price,
  },
  createdAt: "",
  updatedAt: "",
  __v: 0,
  imgUrl: "",
});

const FALLBACK_TICKER_TOKENS: CryptoPriceData[] = [
  createFallbackToken("BTC", 65000),
  createFallbackToken("SOL", 150),
  createFallbackToken("ETH", 3500),
  createFallbackToken("BNB", 600),
];

const tickerCardClass =
  "h-full overflow-hidden rounded-[var(--radius)] border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-none dark:hover:shadow-none";

/** Formatea volumen diario como valor compacto en USD */
function formatVolume(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "$0";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}
// Sample token data - in a real app, you would fetch this from an API
// const tokens = [
//   {
//     id: "bitcoin",
//     name: "Bitcoin",
//     symbol: "BTC",
//     price: 68432.51,
//     change: 2.34,
//     logo: "/images/logos/coins/bitcoin-btc-logo.svg",
//     volume: "32.5B",
//   },
//   {
//     id: "ethereum",
//     name: "Ethereum",
//     symbol: "ETH",
//     price: 3521.78,
//     change: -1.23,
//     logo: "/images/logos/coins/ethereum-eth-logo.svg",
//     volume: "15.2B",
//   },
//   {
//     id: "optimism",
//     name: "Optimism",
//     symbol: "OP",
//     price: 172.45,
//     change: 5.67,
//     logo: "/images/logos/coins/optimism-op-logo.svg",
//     volume: "4.8B",
//   },
//   {
//     id: "polygon",
//     name: "Polygon",
//     symbol: "POL",
//     price: 0.58,
//     change: -0.89,
//     logo: "/images/logos/coins/polygon-matic-logo.svg",
//     volume: "1.2B",
//   },
//   {
//     id: "tron",
//     name: "Tron",
//     symbol: "TRX",
//     price: 0.62,
//     change: 3.45,
//     logo: "/images/logos/coins/tron-trx-logo.svg",
//     volume: "2.1B",
//   },
//   {
//     id: "polkadot",
//     name: "Polkadot",
//     symbol: "DOT",
//     price: 7.82,
//     change: 1.23,
//     logo: "/images/logos/coins/polkadot-dot-logo.svg",
//     volume: "890M",
//   },
//   {
//     id: "ton",
//     name: "Ton",
//     symbol: "TON",
//     price: 0.12,
//     change: -2.56,
//     logo: "/images/logos/coins/toncoin-ton-logo.svg",
//     volume: "950M",
//   },
//   {
//     id: "binance",
//     name: "Binance",
//     symbol: "BNB",
//     price: 35.67,
//     change: 4.32,
//     logo: "/images/logos/coins/binance-coin-bnb-logo.svg",
//     volume: "1.5B",
//   },
//   {
//     id: "gnosischain",
//     name: "Gnosis",
//     symbol: "XDAI",
//     price: 0.12,
//     change: -2.56,
//     logo: "/images/logos/coins/gnosis-gno-gno-logo.svg",
//     volume: "950M",
//   },
//   {
//     id: "stellar",
//     name: "Stellar",
//     symbol: "XLM",
//     price: 0.12,
//     change: -2.56,
//     logo: "/images/logos/coins/stellar-xlm-white-logo.svg",
//     volume: "950M",
//   },
// ]

export default function TokenPriceTicker() {
  const [mounted, setMounted] = useState(false)
  const [tokens, setTokens] = useState<CryptoPriceData[]>([]);

  useEffect(() => {
      async function fetchTokens() {
        try {
          const response = await getRandomCryptos(10); 
          setTokens(response.filter((t) => !INTERNAL_TICKER_EXCLUDED_SYMBOLS.has(t.symbol.toUpperCase())));
        } catch (error) {
          console.error("Error al obtener criptomonedas random:", error);
        }
      }
  
      fetchTokens();
  }, []);
  // Placeholder images for tokens that don't have logos
  // const getTokenImage = (token: (typeof tokens)[0]) => {
  //   return token.logo || `/placeholder.svg?height=40&width=40&query=${token.symbol} logo`
  // }

  // Format price with appropriate decimal places
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    if (price < 10) return price.toFixed(3)
    if (price < 1000) return price.toFixed(2)
    return price.toLocaleString("en-US", { maximumFractionDigits: 2 })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const tickerTokens = tokens.length > 0 ? tokens : FALLBACK_TICKER_TOKENS;
  const marqueeTokens = [...tickerTokens, ...tickerTokens];

  return (
    <section className="py-8 md:py-12 bg-background overflow-hidden">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Precios del mercado</h2>
          <span className="inline-flex rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background shadow-sm ring-1 ring-foreground/10 dark:bg-white dark:text-black dark:shadow-none dark:ring-0">
            Precios en vivo
          </span>
        </div>

        <div className="group relative -mx-4 overflow-hidden px-4 py-8 md:py-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-background to-transparent" />
          <div className="deco-token-marquee flex w-max gap-5">
            {marqueeTokens.map((token, index) => (
              <Card
                key={`${token._id}-${index}`}
                className={`${tickerCardClass} w-[280px] shrink-0 sm:w-[300px]`}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden bg-accent/20">
                        <SafeImage
                          src={LOCAL_CURRENCY_ICONS[token.symbol?.toUpperCase() ?? ''] || ''}
                          alt={token.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-base md:text-lg">{token.name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">{token.symbol}</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${token.averageChange24h >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {token.averageChange24h >= 0 ? (
                        <ArrowUp className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <ArrowDown className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                      <span className="text-xs md:text-sm font-medium">{Math.abs(token.averageChange24h).toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg md:text-xl font-bold">${formatPrice(token.averagePrice)}</div>
                    <div className="text-xs text-muted-foreground">Vol: {formatVolume(token.averageVolume24h)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-center md:mt-4">
          <Button
            asChild
            className="rounded-full bg-foreground px-7 text-base font-semibold text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Link href="#">
              Ver todos los precios
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <style>{`
        .deco-token-marquee {
          animation: deco-token-marquee 36s linear infinite;
        }

        .group:hover .deco-token-marquee {
          animation-play-state: paused;
        }

        @keyframes deco-token-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .deco-token-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
