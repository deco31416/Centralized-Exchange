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
import { useP2pExchange } from "./use-p2p-exchange";

interface P2PTradingTabProps {
  fiatCurrencies: Fiat[];
  cryptoCurrencies: CryptoPriceData[];
  tradeType: string;
  getCurrencyIcon: (code: string) => string;
  getCurrencyLabel: (code: string) => string;
}

export function P2PTradingTab({
  fiatCurrencies,
  cryptoCurrencies,
  tradeType,
  getCurrencyIcon,
  getCurrencyLabel,
}: P2PTradingTabProps) {
  const {
    p2pFromCurrency,
    p2pToCurrency,
    p2pFromAmount,
    p2pToAmount,
    p2pRate,
    p2pTradeType,
    hasError,
    handleP2pFromAmountChange,
    handleP2pFromCurrencyChange,
    handleP2pToCurrencyChange,
    handleP2pSwapCurrencies,
  } = useP2pExchange(cryptoCurrencies, tradeType);

  return (
    <TabsContent value="p2p-trading" className="mt-0">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>{p2pTradeType === "SELL" ? "Vendes" : "Pagas"}</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={p2pFromAmount}
                min="0"
                step="any"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v !== "" && Number(v) < 0) return;
                  handleP2pFromAmountChange(v);
                }}
                className="flex-1"
                placeholder="Ingresa un monto"
              />
              <Select
                value={p2pFromCurrency}
                onValueChange={handleP2pFromCurrencyChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <SafeImage
                          src={getCurrencyIcon(p2pFromCurrency)}
                          alt={p2pFromCurrency}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                      {p2pFromCurrency}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom">
                  {cryptoCurrencies.map((crypto) => (
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
              onClick={handleP2pSwapCurrencies}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{p2pTradeType === "SELL" ? "Obtienes" : "Recibes"}</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={p2pToAmount}
                readOnly
                className="flex-1 bg-muted/30"
                placeholder="Monto calculado"
              />
              <Select
                value={p2pToCurrency}
                onValueChange={handleP2pToCurrencyChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <SafeImage
                          src={getCurrencyIcon(p2pToCurrency)}
                          alt={p2pToCurrency}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                      {p2pToCurrency}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom">
                  {fiatCurrencies.map((fiat) => (
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
                Tasa: 1 {p2pFromCurrency} = {p2pRate} {p2pToCurrency}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Tipo:</div>
                <div className="text-xs font-medium">{p2pTradeType}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Comisión:</div>
                <div className="text-xs">0.5%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Diferencial:</div>
                <div className="text-xs">0.25%</div>
              </div>
            </div>
          </div>

          {hasError && (
            <div className="rounded-[calc(var(--radius)-0.75rem)] bg-red-50 p-2 text-sm text-red-500">
              Error: no pudimos obtener la tasa. Inténtalo de nuevo.
            </div>
          )}

          <Button size="lg" className="mt-2" disabled={!p2pFromAmount || Number(p2pFromAmount) <= 0}>
            Crear orden P2P de {p2pTradeType === "SELL" ? "venta" : "compra"}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
