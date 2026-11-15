"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Fiat,
  getAvailableFiats,
} from "@/services/FiatService";

// ─── Internal tab components ────────────────────────────────────────────────

type BuySellRate = { currency: string; buyRate: number; sellRate: number; spread: string };
type CentralBankRate = { currency: string; interestRate: number; changeVsUSD: string; rate: number };
type P2PRate = { currency: string; minBuy: number; maxBuy: number; minSell: number; maxSell: number };

const FIAT_DISPLAY_ORDER = [
  "USD",
  "COP",
  "EUR",
  "MXN",
  "CLP",
  "PEN",
  "ARS",
  "VES",
  "AWG",
  "DOP",
  "BRL",
];

const rateCardClass =
  "overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-none dark:hover:shadow-none";

const FIAT_ICON_BY_CODE: Record<string, string> = {
  ARS: "/images/FiatAccepted/argentina-ar-ars-logo_vhf9iy.svg",
  AWG: "/images/FiatAccepted/aruba-aw-awg-logo_ygxapm.svg",
  BRL: "/images/FiatAccepted/brasil-br-brl-logo_dcxcvj.svg",
  CAD: "/images/FiatAccepted/canada-ca-cad-logo_cu35ca.svg",
  CLP: "/images/FiatAccepted/chile-cl-clp-logo.svg",
  COP: "/images/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg",
  DOP: "/images/FiatAccepted/republicadomincana-do-dot-logo_kehpud.svg",
  EUR: "/images/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg",
  MXN: "/images/FiatAccepted/mexico-mx-mxn-logo_ctxoht.svg",
  PEN: "/images/FiatAccepted/peru-pe-sol-logo_rbaixq.svg",
  SVC: "/images/FiatAccepted/elsalvador-sv-svc-logo.svg",
  USD: "/images/FiatAccepted/usa-us-usd-logo_lx28hi.svg",
  VES: "/images/FiatAccepted/venezuela-ve-ves-logo_s3y7me.svg",
};

function FiatCardHeader({ code, suffix }: { code: string; suffix?: ReactNode }) {
  const iconSrc = FIAT_ICON_BY_CODE[code];

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt={code}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">
              {code.slice(0, 2)}
            </span>
          )}
        </div>
        <h3 className="truncate text-lg font-medium">{code}</h3>
      </div>
      {suffix ? <div className="shrink-0">{suffix}</div> : null}
    </div>
  );
}

function BuySellRatesTab({
  rates,
  formatPrice,
}: {
  rates: BuySellRate[];
  formatPrice: (p: number) => string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {rates.map((currency, index) => (
        <div
          key={index}
          className={rateCardClass}
        >
          <div className="p-6">
            <FiatCardHeader code={currency.currency} />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Compra: {formatPrice(currency.buyRate)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Venta: {formatPrice(currency.sellRate)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Diferencial: {currency.spread}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveRatesTab({
  rates,
  formatPrice,
}: {
  rates: Fiat[];
  formatPrice: (p: number) => string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {rates.map((currency, index) => (
        <div
          key={index}
          className={rateCardClass}
        >
          <div className="p-6">
            <FiatCardHeader
              code={currency.currency}
              suffix={
                <div className="flex items-center text-primary">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span className="text-xs">En vivo</span>
                </div>
              }
            />
            <div className="text-2xl font-bold">
              {formatPrice(currency.rate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {currency.currency} / {currency.base}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Actualizado: {new Date(currency.updatedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CentralBankRatesTab({ rates }: { rates: CentralBankRate[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {rates.map((currency, index) => (
        <div
          key={index}
          className={rateCardClass}
        >
          <div className="p-6">
            <FiatCardHeader code={currency.currency} />
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">
                {currency.interestRate.toFixed(2)}%
              </div>
              <div className="ml-2 text-sm text-muted-foreground">
                Tasa de referencia
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function P2PRatesTab({
  rates,
  formatPrice,
}: {
  rates: P2PRate[];
  formatPrice: (p: number) => string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {rates.map((currency, index) => (
        <div
          key={index}
          className={rateCardClass}
        >
          <div className="p-6">
            <FiatCardHeader code={currency.currency} />
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Rango de compra:
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    Mín: {formatPrice(currency.minBuy)}
                  </span>
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">
                    Máx: {formatPrice(currency.maxBuy)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Rango de venta:
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Mín: {formatPrice(currency.minSell)}
                  </span>
                  <span className="text-sm text-red-700 dark:text-red-300">
                    Máx: {formatPrice(currency.maxSell)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FiatCurrencyRates() {
  const [mounted, setMounted] = useState(false);
  const [fiatCurrencies, setFiatCurrencies] = useState<Fiat[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getVisibleFiats = () => {
    return fiatCurrencies
      .filter((fiat) => FIAT_DISPLAY_ORDER.includes(fiat.currency))
      .sort(
        (a, b) =>
          FIAT_DISPLAY_ORDER.indexOf(a.currency) -
          FIAT_DISPLAY_ORDER.indexOf(b.currency),
      );
  };

  // Función para calcular tasas de compra y venta
  const calculateBuySellRates = (fiat: Fiat) => {
    const buyRate = fiat.rate * 0.95; // -5%
    const sellRate = fiat.rate * 1.05; // +5%
    const spread = (((sellRate - buyRate) / buyRate) * 100).toFixed(2);

    return {
      currency: fiat.currency,
      buyRate,
      sellRate,
      spread: `${spread}%`,
    };
  };

  // Función para filtrar pares USD/USD
  const getFilteredLiveRates = () => {
    return fiatCurrencies.filter(
      (fiat) => !(fiat.base === "USD" && fiat.currency === "USD")
    );
  };

  // Función para obtener tasas de bancos centrales
  const getCentralBankRates = () => {
    const centralBankCurrencies = [
      "USD",
      "COP",
      "EUR",
      "MXN",
      "CLP",
      "PEN",
      "ARS",
      "VES",
      "AWG",
      "DOP",
      "BRL",
    ];

    return centralBankCurrencies.map((currency) => {
      const fiat = fiatCurrencies.find((f) => f.currency === currency);

      // RATES-CONFIG-003: deco-exchange official market reference rates. CONFIG APROBADA (2026-04-30).
      // Estos valores son tasas oficiales de referencia de mercado de deco-exchange, no datos de bancos centrales externos.
      const CENTRAL_BANK_RATES_STATIC_CONFIG: { [key: string]: number } = {
        COP: 13.25,
        MXN: 11.25,
        USD: 5.25,
        EUR: 4.0,
        CLP: 8.25,
        PEN: 5.0,
        ARS: 40.0,
        VES: 15.0,
        DOP: 8.5,
        BRL: 12.75,
        AWG: 1.0,
      };

      const changeVsUSD = fiat ? ((fiat.rate - 1) * 100).toFixed(2) : "0.00";

      return {
        currency,
        interestRate: CENTRAL_BANK_RATES_STATIC_CONFIG[currency] || 0,
        changeVsUSD: `${changeVsUSD}%`,
        rate: fiat?.rate || 1,
      };
    });
  };

  // Función para calcular rangos P2P
  const calculateP2PRates = (fiat: Fiat) => {
    const baseRate = fiat.rate;
    const variation = baseRate * 0.02; // 2% de variación

    return {
      currency: fiat.currency,
      minBuy: baseRate - variation,
      maxBuy: baseRate - variation * 0.5,
      minSell: baseRate + variation * 0.5,
      maxSell: baseRate + variation,
    };
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    getAvailableFiats().then(setFiatCurrencies).catch(setError);
  }, []);

  if (!mounted) return null;

  const visibleFiats = getVisibleFiats();
  const buySellRates = visibleFiats.map(calculateBuySellRates);
  const filteredLiveRates = getFilteredLiveRates().filter((fiat) =>
    FIAT_DISPLAY_ORDER.includes(fiat.currency),
  ).sort(
    (a, b) =>
      FIAT_DISPLAY_ORDER.indexOf(a.currency) -
      FIAT_DISPLAY_ORDER.indexOf(b.currency),
  );
  const centralBankRates = getCentralBankRates();
  const p2pRates = visibleFiats.map(calculateP2PRates);

  return (
    <section id="tasas" className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Tasas de cambio</h2>
        </div>

        <Tabs defaultValue="buy-sell" className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1.5 rounded-[var(--radius)] border border-border bg-muted/45 p-1.5 shadow-sm dark:bg-muted/20 sm:grid-cols-4">
            <TabsTrigger className="rounded-[calc(var(--radius)-0.45rem)] py-3 text-sm font-semibold data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none" value="buy-sell">Compra/Venta</TabsTrigger>
            <TabsTrigger className="rounded-[calc(var(--radius)-0.45rem)] py-3 text-sm font-semibold data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none" value="live">Tasas en vivo</TabsTrigger>
            <TabsTrigger className="rounded-[calc(var(--radius)-0.45rem)] py-3 text-sm font-semibold data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none" value="central">Referencias</TabsTrigger>
            <TabsTrigger className="rounded-[calc(var(--radius)-0.45rem)] py-3 text-sm font-semibold data-[state=active]:border data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_4px_12px_rgba(15,23,42,0.14)] dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-none" value="p2p">P2P</TabsTrigger>
          </TabsList>

          <TabsContent value="buy-sell">
            <BuySellRatesTab rates={buySellRates} formatPrice={formatPrice} />
          </TabsContent>

          <TabsContent value="live">
            <LiveRatesTab rates={filteredLiveRates} formatPrice={formatPrice} />
          </TabsContent>

          <TabsContent value="central">
            <CentralBankRatesTab rates={centralBankRates} />
          </TabsContent>

          <TabsContent value="p2p">
            <P2PRatesTab rates={p2pRates} formatPrice={formatPrice} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
