"use client";

import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { type Fiat } from "@/services/FiatService";
import type { CryptoPriceData } from "@/types/crypto-price-data";
import { SafeImage } from "./safe-image";
import { useCryptoExchange } from "./use-crypto-exchange";

interface BuySellCryptoTabProps {
  fiatCurrencies: Fiat[];
  cryptoCurrencies: CryptoPriceData[];
  tradeType: string;
  getCurrencyIcon: (code: string) => string;
  getCurrencyLabel: (code: string) => string;
}

export function BuySellCryptoTab({
  fiatCurrencies,
  cryptoCurrencies,
  tradeType,
  getCurrencyIcon,
  getCurrencyLabel,
}: BuySellCryptoTabProps) {
  const {
    fromCryptoCurrency,
    toCryptoCurrency,
    cryptoFromAmount,
    cryptoToAmount,
    cryptoRate,
    cryptoTradeType,
    hasError,
    handleCryptoFromAmountChange,
    handleCryptoFromCurrencyChange,
    handleCryptoToCurrencyChange,
    handleCryptoSwapCurrencies,
  } = useCryptoExchange(fiatCurrencies, cryptoCurrencies, tradeType);

  return (
    <TabsContent value="buy-sell-crypto" className="mt-0">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>
              {cryptoTradeType === "BUY" ? "Pagas" : "Vendes"}
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={cryptoFromAmount}
                min="0"
                step="any"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v !== "" && Number(v) < 0) return;
                  handleCryptoFromAmountChange(v);
                }}
                className="flex-1"
                placeholder="Ingresa un monto"
              />
              <Select
                value={fromCryptoCurrency}
                onValueChange={handleCryptoFromCurrencyChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <SafeImage
                          src={getCurrencyIcon(fromCryptoCurrency)}
                          alt={fromCryptoCurrency}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                      {fromCryptoCurrency}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom">
                  {cryptoTradeType === "BUY"
                    ? fiatCurrencies.map((fiat) => (
                        <SelectItem key={fiat._id} value={fiat.currency}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-5">
                              <SafeImage
                                src={getCurrencyIcon(fiat.currency)}
                                alt={fiat.currency}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            </div>
                            {fiat.currency}
                          </div>
                        </SelectItem>
                      ))
                    : cryptoCurrencies.map((crypto) => (
                        <SelectItem key={crypto._id} value={crypto.symbol}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-5">
                              <SafeImage
                                src={getCurrencyIcon(crypto.symbol)}
                                alt={crypto.name}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            </div>
                            {getCurrencyLabel(crypto.symbol)}
                          </div>
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCryptoSwapCurrencies}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>
              {cryptoTradeType === "BUY" ? "Recibes" : "Obtienes"}
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={cryptoToAmount}
                readOnly
                className="flex-1 bg-muted/30"
                placeholder="Monto calculado"
              />
              <Select
                value={toCryptoCurrency}
                onValueChange={handleCryptoToCurrencyChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <SafeImage
                          src={getCurrencyIcon(toCryptoCurrency)}
                          alt={toCryptoCurrency}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                      {toCryptoCurrency}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom">
                  {cryptoTradeType === "BUY"
                    ? cryptoCurrencies.map((crypto) => (
                        <SelectItem key={crypto._id} value={crypto.symbol}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-5">
                              <SafeImage
                                src={getCurrencyIcon(crypto.symbol)}
                                alt={crypto.name}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            </div>
                            {getCurrencyLabel(crypto.symbol)}
                          </div>
                        </SelectItem>
                      ))
                    : fiatCurrencies.map((fiat) => (
                        <SelectItem key={fiat._id} value={fiat.currency}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-5 h-5">
                              <SafeImage
                                src={getCurrencyIcon(fiat.currency)}
                                alt={fiat.currency}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            </div>
                            {fiat.currency}
                          </div>
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 rounded-[calc(var(--radius)-0.5rem)] bg-white p-4 shadow-sm ring-1 ring-border/60 dark:bg-muted/10 dark:shadow-none dark:ring-0">
            <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
              <RefreshCw className="h-3 w-3" />
              <span>
                Tasa: 1 {fromCryptoCurrency} = {cryptoRate} {toCryptoCurrency}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Tipo:</div>
                <div className="text-xs font-medium">{cryptoTradeType}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Comisión:</div>
                <div className="text-xs">
                  {cryptoTradeType === "BUY" ? "0.75%" : "0.85%"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Diferencial:</div>
                <div className="text-xs">
                  {cryptoTradeType === "BUY" ? "0.35%" : "0.40%"}
                </div>
              </div>
            </div>
          </div>

          {hasError && (
            <div className="rounded-[calc(var(--radius)-0.75rem)] bg-red-50 p-2 text-sm text-red-500">
              Error: no pudimos obtener la tasa. Inténtalo de nuevo.
            </div>
          )}

          <Button size="lg" className="mt-2" disabled={!cryptoFromAmount || Number(cryptoFromAmount) <= 0}>
            {cryptoTradeType === "BUY" ? "Comprar cripto" : "Vender cripto"}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
