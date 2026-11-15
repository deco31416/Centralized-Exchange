"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/p2p/use-auth"
import { useNavigation } from "@/components/p2p/use-navigation"
import { useToast } from "@/components/ui/use-toast"
import { P2POrdersService, P2PChatService } from "@/services/P2PService"
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Info,
  Send,
  Wallet,
  ArrowLeftRight,
} from "lucide-react"

/**
 * Feature flag: INTERNAL_FIAT_WALLET rail.
 * Mantener en false hasta que wallet-ledger implemente holdAvailable/releaseLocked.
 * Ver deuda técnica: P2P-FIAT-HOLD-INTEGRATION-001
 */
const INTERNAL_FIAT_WALLET_RAIL_AVAILABLE = false

type Seller = {
  id: string
  name: string
  verified: boolean
  orders: number
  completion: number
  price: number
  available: number
  min: number
  max: number
  time: number
  methods: string[]
  online: boolean
  rating: number
}

type TradeModalProps = {
  isOpen: boolean
  onClose: () => void
  seller: Seller | null
  isBuying: boolean
}

export function TradeModal({ isOpen, onClose, seller, isBuying }: TradeModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { setActiveView, setActiveOrderId } = useNavigation()
  const [amount, setAmount] = useState("")
  const [total, setTotal] = useState(0)
  const [selectedMethod, setSelectedMethod] = useState(seller?.methods[0] || "")
  const [currentStep, setCurrentStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderDetails, setOrderDetails] = useState({ id: "", amount: 0, total: 0, method: "", time: 0 })
  const [timeLeft, setTimeLeft] = useState(seller?.time ? seller.time * 60 : 900)
  const [chatOpen, setChatOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ id: string; senderId: string; text: string; timestamp: Date }>>([])
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const [paymentRail, setPaymentRail] = useState<"EXTERNAL_FIAT_PAYMENT" | "INTERNAL_FIAT_WALLET">("EXTERNAL_FIAT_PAYMENT")

  React.useEffect(() => {
    if (amount && seller) {
      setTotal(parseFloat(amount) * seller.price)
    } else {
      setTotal(0)
    }
  }, [amount, seller])

  React.useEffect(() => {
    if (isOpen) {
      setAmount("")
      setTotal(0)
      setCurrentStep(1)
      setOrderPlaced(false)
      setChatOpen(false)
      setDisputeOpen(false)
      setDisputeReason("")
      setPaymentRail("EXTERNAL_FIAT_PAYMENT")
      if (seller) {
        setSelectedMethod(seller.methods[0])
        setTimeLeft(seller.time * 60)
      }
    }
  }, [isOpen, seller])

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (orderPlaced && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [orderPlaced, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) setAmount(value)
  }

  const handleMaxClick = () => {
    if (seller) setAmount((seller.max / seller.price).toFixed(2))
  }

  const handleCopyClick = (text: string, msg: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: msg } as Parameters<typeof toast>[0])
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return
    const text = message.trim()
    setMessage("")
    const newMsg = { id: `msg_${Date.now()}`, senderId: user?.id || "user", text, timestamp: new Date() }
    setMessages((prev) => [...prev, newMsg])
    if (orderDetails.id) {
      try {
        await P2PChatService.sendMessage(orderDetails.id, text)
      } catch {
        // mensaje ya en UI local
      }
    }
  }

  React.useEffect(() => {
    if (!orderDetails.id) return
    P2PChatService.getMessages(orderDetails.id)
      .then((msgs) =>
        setMessages(
          msgs.map((m) => ({
            id: m.messageId,
            senderId: m.senderId,
            text: m.text,
            timestamp: new Date(m.createdAt),
          }))
        )
      )
      .catch(() => {})
  }, [orderDetails.id])

  const [placingOrder, setPlacingOrder] = React.useState(false)

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({ title: "Debes iniciar sesion para realizar esta operacion", variant: "destructive" } as Parameters<typeof toast>[0])
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast({ title: "Por favor, ingresa una cantidad valida", variant: "destructive" } as Parameters<typeof toast>[0])
      return
    }
    if (!selectedMethod) {
      toast({ title: "Selecciona un metodo de pago", variant: "destructive" } as Parameters<typeof toast>[0])
      return
    }
    if (seller) {
      if (Number(amount) * seller.price < seller.min) {
        toast({ title: `El monto minimo es $${seller.min.toFixed(2)}`, variant: "destructive" } as Parameters<typeof toast>[0])
        return
      }
      if (Number(amount) * seller.price > seller.max) {
        toast({ title: `El monto maximo es $${seller.max.toFixed(2)}`, variant: "destructive" } as Parameters<typeof toast>[0])
        return
      }
    }
    if (!seller) return
    setCurrentStep(2)
    setPlacingOrder(true)
    try {
      const order = await P2POrdersService.createOrder({
        adId: seller.id,
        cryptoAmount: Number(amount),
        paymentMethodId: selectedMethod,
        paymentRail,
      })
      setOrderPlaced(true)
      setOrderDetails({
        id: order.orderId,
        amount: Number(amount),
        total,
        method: selectedMethod,
        time: seller.time || 15,
      })
      setActiveOrderId(order.orderId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear la orden"
      toast({ title: "Error al crear orden", description: msg, variant: "destructive" } as Parameters<typeof toast>[0])
      setCurrentStep(1)
    } finally {
      setPlacingOrder(false)
    }
  }

  const handleSubmitDispute = () => {
    if (!disputeReason.trim()) {
      toast({ title: "Por favor, ingresa un motivo para la disputa", variant: "destructive" } as Parameters<typeof toast>[0])
      return
    }
    toast({ title: "Disputa enviada correctamente", description: "Un administrador revisará tu caso pronto" } as Parameters<typeof toast>[0])
    setDisputeOpen(false)
    onClose()
  }

  const handleGoToExchange = () => {
    onClose()
    setActiveView("exchange")
  }

  const handleCancelOrder = async () => {
    if (orderDetails.id) {
      try {
        await P2POrdersService.cancel(orderDetails.id)
        toast({ title: "Orden cancelada correctamente" } as Parameters<typeof toast>[0])
      } catch {
        // si falla, igual cerrar
      }
    }
    onClose()
  }

  if (!seller) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!orderPlaced ? (
          <>
            <DialogHeader>
              <DialogTitle>{isBuying ? "Comprar USDT" : "Vender USDT"}</DialogTitle>
              <DialogDescription>
                {isBuying ? `Estás comprando USDT de ${seller.name}` : `Estás vendiendo USDT a ${seller.name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-start gap-2">
                <Avatar className="h-10 w-10 rounded-full border">
                  <AvatarFallback className="bg-primary/10 text-xs">
                    {seller.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{seller.name}</span>
                    {seller.verified && (
                      <Badge variant="outline" className="ml-1 h-5 rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                        <Check className="mr-0.5 h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <div>{seller.orders} órdenes</div>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <div>{seller.completion.toFixed(2)}% Completado</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div>
                  <div className="text-sm text-muted-foreground">Precio</div>
                  <div className="text-lg font-bold">$ {seller.price.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Disponible</div>
                  <div className="text-lg font-bold">{seller.available.toFixed(2)} USDT</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Límite</div>
                  <div className="text-lg font-bold">${seller.min.toFixed(2)} - ${seller.max.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tiempo de pago</div>
                  <div className="text-lg font-bold">{seller.time} min</div>
                </div>
              </div>

              <Alert variant="destructive" className="bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Advertencia</AlertTitle>
                <AlertDescription>
                  Para evitar riesgos, no menciones Binance/BTC/ETH/USDT/criptomonedas en las notas de pago.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="amount">{isBuying ? "Quiero comprar" : "Quiero vender"}</Label>
                <div className="relative">
                  <Input id="amount" placeholder="Ingresa la cantidad" value={amount} onChange={handleAmountChange} className="pr-16" />
                  <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full gap-1 rounded-l-none border-l px-2" onClick={handleMaxClick}>
                    MAX
                  </Button>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{isBuying ? "Total a pagar:" : "Total a recibir:"}</span>
                  <span className="font-medium">${total.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Método de pago</Label>
                <Select defaultValue={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Selecciona un método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {seller.methods.map((method, index) => (
                      <SelectItem key={index} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rail de pago */}
              <div className="space-y-2">
                <Label>Rail de pago</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentRail("EXTERNAL_FIAT_PAYMENT")}
                    className={`flex items-start gap-2 rounded-lg border p-3 text-left transition-colors ${
                      paymentRail === "EXTERNAL_FIAT_PAYMENT"
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-muted-foreground/40"
                    }`}
                  >
                    <ArrowLeftRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Pago externo</div>
                      <div className="text-xs text-muted-foreground">
                        Pagas directamente al vendedor fuera de deco-exchange (transferencia bancaria, SPEI, etc.)
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={!INTERNAL_FIAT_WALLET_RAIL_AVAILABLE}
                    onClick={() => INTERNAL_FIAT_WALLET_RAIL_AVAILABLE && setPaymentRail("INTERNAL_FIAT_WALLET")}
                    className={`flex items-start gap-2 rounded-lg border p-3 text-left transition-colors ${
                      paymentRail === "INTERNAL_FIAT_WALLET"
                        ? "border-primary bg-primary/10"
                        : "border-muted"
                    } ${!INTERNAL_FIAT_WALLET_RAIL_AVAILABLE ? "cursor-not-allowed opacity-50" : "hover:border-muted-foreground/40"}`}
                  >
                    <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">deco-exchange Wallet</div>
                      <div className="text-xs text-muted-foreground">
                        {INTERNAL_FIAT_WALLET_RAIL_AVAILABLE
                          ? "Usa tu saldo fiat en deco-exchange Wallet — pago instantáneo."
                          : "Usa tu saldo fiat en deco-exchange Wallet — próximamente disponible."}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => void handlePlaceOrder()} disabled={placingOrder}>
                {placingOrder ? "Creando orden..." : (isBuying ? "Comprar USDT" : "Vender USDT")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Orden creada correctamente</DialogTitle>
              <DialogDescription>Tu orden ha sido creada y está pendiente de pago</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">ID de orden</div>
                  <div className="flex items-center gap-1">
                    <div className="font-medium">{orderDetails.id}</div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyClick(orderDetails.id, "ID de orden copiado")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Cantidad</div>
                  <div className="font-medium">{orderDetails.amount.toFixed(2)} USDT</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Precio</div>
                  <div className="font-medium">$ {seller.price.toFixed(3)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="font-medium">$ {orderDetails.total.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Método de pago</div>
                  <div className="font-medium">{orderDetails.method}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Tiempo restante</div>
                  <div className="font-medium flex items-center gap-1 text-amber-500">
                    <Clock className="h-4 w-4" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              <Alert className="bg-primary/10 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle>Instrucciones de pago</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal pl-4 space-y-1 mt-2">
                    <li>Realiza el pago utilizando el método seleccionado.</li>
                    <li>Haz clic en "He pagado" una vez completado el pago.</li>
                    <li>Espera a que el vendedor confirme la recepción del pago.</li>
                    <li>Los USDT serán liberados a tu cuenta.</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Tabs defaultValue={chatOpen ? "chat" : "details"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details" onClick={() => setChatOpen(false)}>Detalles de pago</TabsTrigger>
                  <TabsTrigger value="chat" onClick={() => setChatOpen(true)}>Chat</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Información de la cuenta</Label>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Método de pago</div>
                        <div className="font-medium text-xs break-all">{orderDetails.method}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Detalles de cuenta</div>
                        <div className="font-medium text-muted-foreground text-xs">Consulta el chat</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="chat" className="space-y-4 pt-4">
                  <ScrollArea className="h-[200px] rounded-lg border p-3">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === (user?.id || "user") ? "justify-end" : "justify-start"}`}>
                          <div className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.senderId === (user?.id || "user") ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">
                              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { void handleSendMessage() } }}
                    />
                    <Button onClick={() => void handleSendMessage()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between">
                <Button variant="outline" className="text-amber-500 border-amber-500 hover:bg-amber-500/10" onClick={() => setDisputeOpen(true)}>
                  Abrir disputa
                </Button>
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleCancelOrder}>
                  Cancelar orden
                </Button>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleGoToExchange} className="flex-1">Ver mi intercambio</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleGoToExchange}>
                Ir a Intercambio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>

      {/* Modal de disputa */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Abrir disputa</DialogTitle>
            <DialogDescription>Explica el motivo de tu disputa para que podamos ayudarte a resolver el problema</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Alert variant="destructive" className="bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>Las disputas son revisadas por administradores. Proporciona toda la información relevante y evidencias.</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="dispute-reason">Motivo de la disputa</Label>
              <Select onValueChange={setDisputeReason}>
                <SelectTrigger id="dispute-reason">
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-payment">No he recibido el pago</SelectItem>
                  <SelectItem value="wrong-amount">La cantidad recibida es incorrecta</SelectItem>
                  <SelectItem value="scam">Sospecha de estafa</SelectItem>
                  <SelectItem value="other">Otro motivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispute-details">Detalles</Label>
              <textarea
                id="dispute-details"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe detalladamente el problema..."
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDisputeOpen(false)} className="flex-1">Cancelar</Button>
            <Button className="flex-1" onClick={handleSubmitDispute}>Enviar disputa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

