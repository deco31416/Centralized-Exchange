"use client"

import * as React from "react"
import { Check, AlertCircle, Info, Copy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/p2p/use-auth"

interface Seller {
  id: string
  name: string
  verified: boolean
  orders: number
  completion: number
  price: number
  available: number
  min: number
  max: number
  methods: string[]
  time: number
  rating: number
  online?: boolean
}

interface P2PBuyModalProps {
  seller: Seller
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTab?: string
}

export function P2PBuyModal({ seller, open, onOpenChange, activeTab = "comprar" }: P2PBuyModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = React.useState("")
  const [total, setTotal] = React.useState(0)
  const [selectedMethod, setSelectedMethod] = React.useState(seller.methods[0])
  const [currentStep, setCurrentStep] = React.useState(1)
  const [orderPlaced, setOrderPlaced] = React.useState(false)
  const [orderDetails, setOrderDetails] = React.useState({
    id: "",
    amount: 0,
    total: 0,
    method: "",
    time: 0,
  })

  React.useEffect(() => {
    if (amount) {
      setTotal(Number.parseFloat(amount) * seller.price)
    } else {
      setTotal(0)
    }
  }, [amount, seller.price])

  React.useEffect(() => {
    if (open) {
      setAmount("")
      setTotal(0)
      setCurrentStep(1)
      setOrderPlaced(false)
    }
  }, [open])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleMaxClick = () => {
    const maxAmount = seller.max / seller.price
    setAmount(maxAmount.toFixed(2))
  }

  const handleCopyClick = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: message,
      variant: "success",
    })
  }

  const handlePlaceOrder = () => {
    if (!user) {
      toast({
        title: "Debes iniciar sesión para realizar esta operación",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Por favor, ingresa una cantidad válida",
        variant: "destructive",
      })
      return
    }

    if (Number(amount) * seller.price < seller.min) {
      toast({
        title: `El monto mínimo es $${seller.min.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }

    if (Number(amount) * seller.price > seller.max) {
      toast({
        title: `El monto máximo es $${seller.max.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }

    // Simular procesamiento
    setCurrentStep(2)

    setTimeout(() => {
      setOrderPlaced(true)
      setOrderDetails({
        id: `P2P${Math.floor(Math.random() * 1000000)}`,
        amount: Number(amount),
        total: total,
        method: selectedMethod,
        time: seller.time,
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!orderPlaced ? (
          <>
            <DialogHeader>
              <DialogTitle>{activeTab === "comprar" ? "Comprar USDT" : "Vender USDT"}</DialogTitle>
              <DialogDescription>
                {activeTab === "comprar"
                  ? `Estás comprando USDT de ${seller.name}`
                  : `Estás vendiendo USDT a ${seller.name}`}
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
                      <Badge
                        variant="outline"
                        className="ml-1 h-5 rounded-full bg-primary/10 px-1.5 text-xs text-primary"
                      >
                        <Check className="mr-0.5 h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <div>{seller.orders} órdenes</div>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
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
                  <div className="text-lg font-bold">
                    ${seller.min.toFixed(2)} - ${seller.max.toFixed(2)}
                  </div>
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
                <Label htmlFor="amount">{activeTab === "comprar" ? "Quiero comprar" : "Quiero vender"}</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    placeholder="Ingresa la cantidad"
                    value={amount}
                    onChange={handleAmountChange}
                    className="pr-16"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full gap-1 rounded-l-none border-l px-2"
                    onClick={handleMaxClick}
                  >
                    MAX
                  </Button>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {activeTab === "comprar" ? "Total a pagar:" : "Total a recibir:"}
                  </span>
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
                      <SelectItem key={index} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handlePlaceOrder}>
                {activeTab === "comprar" ? "Comprar USDT" : "Vender USDT"}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopyClick(orderDetails.id, "ID de orden copiado")}
                    >
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
                  <div className="text-sm text-muted-foreground">Tiempo límite</div>
                  <div className="font-medium">{orderDetails.time} minutos</div>
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

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Detalles de pago</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Información de la cuenta</Label>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Nombre del banco</div>
                        <div className="font-medium">{orderDetails.method}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Nombre del titular</div>
                        <div className="font-medium">John Doe</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Número de cuenta</div>
                        <div className="flex items-center gap-1">
                          <div className="font-medium">1234567890</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyClick("1234567890", "Número de cuenta copiado")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="chat" className="space-y-4 pt-4">
                  <div className="h-[200px] rounded-lg border p-3 flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      Puedes chatear con el vendedor para resolver cualquier duda.
                      <br />
                      Recuerda no compartir información sensible.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Escribe un mensaje..." />
                    <Button>Enviar</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cerrar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  toast({
                    title: "Has confirmado el pago. Esperando confirmación del vendedor.",
                    variant: "success",
                  })
                  onOpenChange(false)
                }}
              >
                He pagado <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
