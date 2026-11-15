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
import { SafeImage } from "./safe-image";
import { useFiatExchange } from "./use-fiat-exchange";

interface FiatExchangeTabProps {
  fiatCurrencies: Fiat[];
  tradeType: string;
  getCurrencyIcon: (code: string) => string;
}

export function FiatExchangeTab({
  fiatCurrencies,
  tradeType,
  getCurrencyIcon,
}: FiatExchangeTabProps) {
  const {
    fromAmount,
    toAmount,
    rate,
    fiatTradeType,
    fromCurrency,
    toCurrency,
    hasError,
    handleFromAmountChange,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleSwapCurrencies,
  } = useFiatExchange(fiatCurrencies, tradeType);

  return (
    <TabsContent value="fiat-exchange" className="mt-0">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>{fiatTradeType === "BUY" ? "Pagas" : "Vendes"}</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={fromAmount}
                min="0"
                step="any"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v !== "" && Number(v) < 0) return;
                  handleFromAmountChange(v);
                }}
                className="flex-1"
                placeholder="Ingresa un monto"
              />
              <Select
                value={fromCurrency}
                onValueChange={handleFromCurrencyChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <SafeImage
                          src={getCurrencyIcon(fromCurrency)}
                          alt={fromCurrency}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                      {fromCurrency}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom">
                  {fiatCurrencies
                    .filter((option) => option.currency !== toCurrency)
                    .map((option) => (
                      <SelectItem key={option._id} value={option.currency}>
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5">
                            <SafeImage
                              src={getCurrencyIcon(option.currency)}
                              alt={option.currency}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          </div>
                          {option.currency}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={handleSwapCurrencies}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{fiatTradeType === "BUY" ? "Recibes" : "Obtienes"}</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={toAmount}
                readOnly
                className="flex-1 bg-muted/30"
                placeholder="Monto calculado"
              />
              <Select
                value={toCurrency}
                onValueChange={handleToCurrencyChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <SafeImage
                          src={getCurrencyIcon(toCurrency)}
                          alt={toCurrency}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                      {toCurrency}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom">
                  {fiatCurrencies
                    .filter((option) => option.currency !== fromCurrency)
                    .map((option) => (
                      <SelectItem key={option._id} value={option.currency}>
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5">
                            <SafeImage
                              src={getCurrencyIcon(option.currency)}
                              alt={option.currency}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          </div>
                          {option.currency}
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
                Tasa: 1 {fromCurrency} = {rate} {toCurrency}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Tipo:</div>
                <div className="text-xs font-medium">{fiatTradeType}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Comisión:</div>
                <div className="text-xs">
                  {fiatTradeType === "BUY" ? "1.0%" : "1.2%"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Diferencial:</div>
                <div className="text-xs">
                  {fiatTradeType === "BUY" ? "0.45%" : "0.50%"}
                </div>
              </div>
            </div>
          </div>

          {hasError && (
            <div className="rounded-[calc(var(--radius)-0.75rem)] bg-red-50 p-2 text-sm text-red-500">
              Error: no pudimos obtener la tasa. Inténtalo de nuevo.
            </div>
          )}

          <Button size="lg" className="mt-2" disabled={!fromAmount || Number(fromAmount) <= 0}>
            {fiatTradeType === "BUY" ? "Comprar ahora" : "Vender ahora"}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
