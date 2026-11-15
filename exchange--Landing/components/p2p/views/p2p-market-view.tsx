"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Star,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/components/p2p/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { LoginModal } from "@/components/p2p/login-modal"
import { TradeModal } from "@/components/p2p/modals/trade-modal"
import { ChatModal } from "@/components/p2p/modals/chat-modal"
import { P2POffersService, P2PAssetsService, PaymentMethodsService } from "@/services/P2PService"
import type { SellerOffer, PaymentMethod } from "@/types/p2p"
import { RedDecoP2PCallout } from "@/components/red-deco/red-deco-p2p-callout"

const FIAT_CURRENCIES = [
  { label: "USD", value: "usd" },
  { label: "MXN", value: "mxn" },
  { label: "COP", value: "cop" },
  { label: "EUR", value: "eur" },
]

type Seller = SellerOffer

function SellerRow({
  seller,
  activeTab,
  activeCrypto,
  favoriteIds,
  onToggleFavorite,
  onTradeClick,
  onChatClick,
}: {
  seller: Seller
  activeTab: string
  activeCrypto: string
  favoriteIds: string[]
  onToggleFavorite: (id: string) => void
  onTradeClick: (seller: Seller) => void
  onChatClick: (seller: Seller) => void
}) {
  return (
    <tr className="border-b hover:bg-secondary/30 transition-colors">
      <td className="p-3">
        <div className="flex items-start gap-2">
          <div className="relative">
            <Avatar className="h-10 w-10 rounded-full border">
              <AvatarFallback className="bg-primary/10 text-xs">
                {seller.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {seller.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{seller.name}</span>
              {seller.verified && (
                <Badge variant="outline" className="ml-1 h-5 rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                  <Check className="mr-0.5 h-3 w-3" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 ml-1 text-muted-foreground hover:text-yellow-400"
                onClick={() => onToggleFavorite(seller.id)}
              >
                <Star
                  className="h-4 w-4"
                  fill={favoriteIds.includes(seller.id) ? "rgb(250 204 21)" : "none"}
                  stroke={favoriteIds.includes(seller.id) ? "rgb(250 204 21)" : "currentColor"}
                />
              </Button>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <div>{seller.orders} ordenes</div>
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
              <div>{seller.completion.toFixed(2)}% Completado</div>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3"
                    fill={i < Math.floor(seller.rating) ? "rgb(250 204 21)" : "none"}
                    stroke={i < Math.floor(seller.rating) ? "rgb(250 204 21)" : "currentColor"}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">{seller.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="p-3 text-right">
        <div className="text-lg font-bold">$ {seller.price.toFixed(3)}</div>
      </td>
      <td className="p-3 text-right">
        <div className="font-medium">
          {seller.available.toFixed(2)} {activeCrypto.toUpperCase()}
        </div>
        <div className="text-xs text-muted-foreground">
          ${seller.min.toFixed(2)} - ${seller.max.toFixed(2)}
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-col gap-1">
          {seller.methods.slice(0, 2).map((method, index) => (
            <div key={index} className="flex items-center text-sm">
              {method}
              {index === 0 && seller.methods.length > 2 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 px-1">
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {seller.methods.slice(2).map((m, idx) => (
                      <DropdownMenuItem key={idx}>{m}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChatClick(seller)}>
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onTradeClick(seller)}>
            {activeTab === "buy" ? "Comprar" : "Vender"} {activeCrypto.toUpperCase()}
          </Button>
        </div>
      </td>
    </tr>
  )
}

function MarketFilters({
  amount,
  currency,
  paymentMethod,
  completionRate,
  orderCount,
  currencyOptions,
  pmOptions,
  onAmountChange,
  onCurrencyChange,
  onPaymentMethodChange,
  onCompletionRateChange,
  onOrderCountChange,
  onReset,
  amountInputId,
  paymentMethodInputId,
}: {
  amount: string
  currency: string
  paymentMethod: string
  completionRate: number[]
  orderCount: number[]
  currencyOptions: { label: string; value: string }[]
  pmOptions: { label: string; value: string }[]
  onAmountChange: (v: string) => void
  onCurrencyChange: (v: string) => void
  onPaymentMethodChange: (v: string) => void
  onCompletionRateChange: (v: number[]) => void
  onOrderCountChange: (v: number[]) => void
  onReset: () => void
  amountInputId: string
  paymentMethodInputId: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="space-y-2 md:col-span-1">
        <Label htmlFor={amountInputId}>Importe</Label>
        <div className="flex">
          <Input
            id={amountInputId}
            placeholder="Importe"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="rounded-r-none"
          />
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-[80px] rounded-l-none border-l-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2 md:col-span-1">
        <Label htmlFor={paymentMethodInputId}>Metodo de pago</Label>
        <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger id={paymentMethodInputId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pmOptions.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Filtros avanzados</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Tasa de finalizacion: {completionRate}%</div>
              <Slider value={completionRate} onValueChange={onCompletionRateChange} max={100} step={5} className="w-full" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Ordenes minimas: {orderCount}</div>
              <Slider value={orderCount} onValueChange={onOrderCountChange} max={1000} step={10} className="w-full" />
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={onReset}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function MarketTable({
  rows,
  activeTab,
  activeCrypto,
  favoriteIds,
  emptyLabel,
  onToggleFavorite,
  onTradeClick,
  onChatClick,
  onReset,
}: {
  rows: Seller[]
  activeTab: string
  activeCrypto: string
  favoriteIds: string[]
  emptyLabel: string
  onToggleFavorite: (id: string) => void
  onTradeClick: (seller: Seller) => void
  onChatClick: (seller: Seller) => void
  onReset: () => void
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar comerciante" className="pl-8 w-[200px] md:w-[260px]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select defaultValue="price">
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Precio</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="completion">Completado</SelectItem>
              <SelectItem value="orders">Ordenes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Comerciante</th>
              <th className="text-right p-3 font-medium">Precio</th>
              <th className="text-right p-3 font-medium">Disponible/Limites</th>
              <th className="text-left p-3 font-medium">Metodos de pago</th>
              <th className="text-right p-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">{emptyLabel}</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={onReset}>
                      Limpiar filtros
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((seller) => (
                <SellerRow
                  key={seller.id}
                  seller={seller}
                  activeTab={activeTab}
                  activeCrypto={activeCrypto}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                  onTradeClick={onTradeClick}
                  onChatClick={onChatClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function P2PMarketView() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("buy")
  const [activeCrypto, setActiveCrypto] = useState("usdt")
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [completionRate, setCompletionRate] = useState([80])
  const [orderCount, setOrderCount] = useState([10])
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("usd")
  const [paymentMethod, setPaymentMethod] = useState("all")
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  // Catálogos dinámicos
  const [assetCatalog, setAssetCatalog] = useState<{ assetCode: string; name: string; symbol: string }[]>([])
  const [pmCatalog, setPmCatalog] = useState<PaymentMethod[]>([])

  useEffect(() => {
    P2PAssetsService.listAssetCatalog().then(setAssetCatalog).catch(() => {})
    PaymentMethodsService.listCatalog().then(setPmCatalog).catch(() => {})
  }, [])

  const cryptos = assetCatalog.length > 0
    ? assetCatalog.map((a) => ({ label: a.symbol || a.assetCode, value: a.assetCode.toLowerCase() }))
    : [{ label: "USDT", value: "usdt" }, { label: "BTC", value: "btc" }, { label: "ETH", value: "eth" }]

  const currencies = FIAT_CURRENCIES

  const paymentMethodsForFilter = [
    { label: "Todos", value: "all" },
    ...pmCatalog.map((m) => ({ label: m.name, value: m.id })),
  ]
  const [sellers, setSellers] = useState<Seller[]>([])
  const [buyers, setBuyers] = useState<Seller[]>([])
  const [isLoadingSell, setIsLoadingSell] = useState(false)
  const [isLoadingBuy, setIsLoadingBuy] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Carga anuncios de compra (mostramos a vendedores → side=buy en la vista)
  useEffect(() => {
    setIsLoadingSell(true)
    setFetchError(null)
    P2POffersService.listOffers({
      side: "buy",
      crypto: activeCrypto.toUpperCase(),
      fiat: currency.toUpperCase(),
    })
      .then(setSellers)
      .catch((err: Error) => setFetchError(err.message))
      .finally(() => setIsLoadingSell(false))
  }, [activeCrypto, currency])

  // Carga anuncios de venta (mostramos a compradores → side=sell en la vista)
  useEffect(() => {
    setIsLoadingBuy(true)
    P2POffersService.listOffers({
      side: "sell",
      crypto: activeCrypto.toUpperCase(),
      fiat: currency.toUpperCase(),
    })
      .then(setBuyers)
      .catch(() => setBuyers([]))
      .finally(() => setIsLoadingBuy(false))
  }, [activeCrypto, currency])

  const isLoading = activeTab === "buy" ? isLoadingSell : isLoadingBuy

  const handleReset = () => {
    setCompletionRate([80])
    setOrderCount([10])
    setAmount("")
    setPaymentMethod("all")
  }

  const toggleFavorite = (id: string) => {
    if (favoriteIds.includes(id)) {
      setFavoriteIds(favoriteIds.filter((fid) => fid !== id))
      toast({ title: "Eliminado de favoritos" })
    } else {
      setFavoriteIds([...favoriteIds, id])
      toast({ title: "Anadido a favoritos" })
    }
  }

  const handleTradeClick = (seller: Seller) => {
    if (!user) { setLoginModalOpen(true); return }
    setSelectedSeller(seller)
    setTradeModalOpen(true)
  }

  const handleChatClick = (seller: Seller) => {
    if (!user) { setLoginModalOpen(true); return }
    setSelectedSeller(seller)
    setChatModalOpen(true)
  }

  const filteredRows = (activeTab === "buy" ? sellers : buyers).filter((seller) => {
    if (paymentMethod !== "all" && !seller.methods.some((m) => m.toLowerCase().includes(paymentMethod.toLowerCase()))) return false
    if (amount && (Number(amount) < seller.min || Number(amount) > seller.max)) return false
    if (seller.completion < completionRate[0]) return false
    if (seller.orders < orderCount[0]) return false
    return true
  })

  const sharedFilterProps = {
    amount, currency, paymentMethod, completionRate, orderCount,
    currencyOptions: currencies,
    pmOptions: paymentMethodsForFilter,
    onAmountChange: setAmount,
    onCurrencyChange: setCurrency,
    onPaymentMethodChange: setPaymentMethod,
    onCompletionRateChange: setCompletionRate,
    onOrderCountChange: setOrderCount,
    onReset: handleReset,
  }

  const sharedTableProps = {
    rows: filteredRows, activeTab, activeCrypto, favoriteIds,
    onToggleFavorite: toggleFavorite,
    onTradeClick: handleTradeClick,
    onChatClick: handleChatClick,
    onReset: handleReset,
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer obligatorio */}
      <Alert className="border-amber-500/30 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
          El pago fiat se realiza fuera de deco-exchange entre comprador y vendedor.
          deco-exchange solo gestiona la orden y el escrow crypto cuando esté disponible.
        </AlertDescription>
      </Alert>

      <RedDecoP2PCallout />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Mercado P2P</h2>
        <Button
          className="gap-2"
          onClick={() => {
            if (!user) { setLoginModalOpen(true); return }
            toast({ title: "Funcionalidad en desarrollo", description: "La creacion de anuncios estara disponible proximamente" })
          }}
        >
          <Plus className="h-4 w-4" />
          Crear anuncio
        </Button>
      </div>

      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Comprar y vender criptomonedas P2P</CardTitle>
          <CardDescription>Comercia directamente con otros usuarios utilizando tus metodos de pago preferidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
                <TabsTrigger value="buy">Comprar</TabsTrigger>
                <TabsTrigger value="sell">Vender</TabsTrigger>
              </TabsList>
              <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {cryptos.map((crypto) => (
                  <Button
                    key={crypto.value}
                    variant={activeCrypto === crypto.value ? "secondary" : "ghost"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setActiveCrypto(crypto.value)}
                  >
                    {crypto.label}
                  </Button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Cargando anuncios...</span>
              </div>
            ) : (
              <>
                <TabsContent value="buy" className="space-y-4">
                  <MarketFilters {...sharedFilterProps} amountInputId="buy-amount" paymentMethodInputId="buy-payment-method" />
                  <MarketTable {...sharedTableProps} emptyLabel="No se encontraron vendedores" />
                </TabsContent>

                <TabsContent value="sell" className="space-y-4">
                  <MarketFilters {...sharedFilterProps} amountInputId="sell-amount" paymentMethodInputId="sell-payment-method" />
                  <MarketTable {...sharedTableProps} emptyLabel="No se encontraron compradores" />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {selectedSeller && (
        <>
          <TradeModal
            isOpen={tradeModalOpen}
            onClose={() => setTradeModalOpen(false)}
            seller={selectedSeller}
            isBuying={activeTab === "buy"}
          />
          <ChatModal
            isOpen={chatModalOpen}
            onClose={() => setChatModalOpen(false)}
            seller={selectedSeller as unknown as Parameters<typeof ChatModal>[0]["seller"]}
          />
        </>
      )}

      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onRegisterClick={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
