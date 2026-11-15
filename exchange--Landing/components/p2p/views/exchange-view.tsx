"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, ArrowLeft, Check, Clock, Loader2, Send, ShieldAlert, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/p2p/use-auth"
import { useNavigation } from "@/components/p2p/use-navigation"
import { P2POrdersService, P2PChatService } from "@/services/P2PService"
import type { P2POrderRaw, P2PChatMessageRaw } from "@/types/p2p"

const ACTIVE_STATUSES: P2POrderRaw["status"][] = [
  "CREATED",
  "ESCROW_PENDING",
  "ESCROW_LOCKED",
  "PAYMENT_PENDING",
  "PAYMENT_MARKED",
  "RELEASE_PENDING",
  "DISPUTED",
]

const STATUS_LABELS: Record<P2POrderRaw["status"], string> = {
  CREATED: "Creada",
  ESCROW_PENDING: "Escrow pendiente",
  ESCROW_LOCKED: "Escrow bloqueado",
  PAYMENT_PENDING: "Esperando pago",
  PAYMENT_MARKED: "Pago marcado",
  RELEASE_PENDING: "Liberacion pendiente",
  RELEASED: "Completada",
  CANCELLED: "Cancelada",
  DISPUTED: "En disputa",
  EXPIRED: "Expirada",
  ESCROW_NOT_AVAILABLE: "Escrow no disponible",
}

function StatusBadge({ status }: { status: P2POrderRaw["status"] }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    CREATED: "secondary",
    ESCROW_PENDING: "secondary",
    ESCROW_LOCKED: "secondary",
    PAYMENT_PENDING: "outline",
    PAYMENT_MARKED: "default",
    RELEASE_PENDING: "default",
    RELEASED: "default",
    CANCELLED: "destructive",
    DISPUTED: "destructive",
    EXPIRED: "destructive",
    ESCROW_NOT_AVAILABLE: "destructive",
  }
  return <Badge variant={variants[status] ?? "secondary"}>{STATUS_LABELS[status] ?? status}</Badge>
}

function ChatPanel({ orderId, currentUserId }: { orderId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<P2PChatMessageRaw[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await P2PChatService.getMessages(orderId)
      setMessages(msgs)
    } catch {
      // silencioso
    }
  }, [orderId])

  useEffect(() => {
    void loadMessages()
    const interval = setInterval(() => void loadMessages(), 12_000)
    return () => clearInterval(interval)
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)
    try {
      const sent = await P2PChatService.sendMessage(orderId, trimmed)
      setMessages((prev) => [...prev, sent])
      setText("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Chat de la orden</p>
      <div className="flex-1 overflow-y-auto min-h-[120px] max-h-[260px] flex flex-col gap-2 pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Sin mensajes aun</p>
        )}
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId
          return (
            <div key={m.messageId} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-xl px-3 py-1.5 text-sm max-w-[80%] ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p>{m.text}</p>
                <p className="text-[10px] opacity-60 mt-0.5">
                  {new Date(m.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="text-sm"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend() } }}
          disabled={sending}
        />
        <Button size="sm" onClick={() => void handleSend()} disabled={sending || !text.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

function OrderPanel({ order, currentUserId, onRefresh, onBack }: {
  order: P2POrderRaw
  currentUserId: string
  onRefresh: () => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const [showDisputeInput, setShowDisputeInput] = useState(false)
  const { toast } = useToast()

  const isBuyer = order.buyerId === currentUserId

  async function run(fn: () => Promise<P2POrderRaw>, successMsg: string) {
    setLoading(true)
    try {
      await fn()
      toast({ title: successMsg })
      onRefresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = () => void run(() => P2POrdersService.markPaid(order.orderId), "Pago marcado correctamente")
  const handleConfirmReceived = () => void run(() => P2POrdersService.confirmReceived(order.orderId), "Recepcion confirmada")
  const handleRelease = () => void run(() => P2POrdersService.release(order.orderId), "Crypto liberado — operacion completada")
  const handleCancel = () => void run(() => P2POrdersService.cancel(order.orderId), "Orden cancelada")
  const handleDispute = () => {
    if (disputeReason.trim().length < 20) {
      toast({ title: "Describe el problema", description: "Minimo 20 caracteres", variant: "destructive" })
      return
    }
    void run(() => P2POrdersService.dispute(order.orderId, disputeReason), "Disputa abierta — el equipo revisara el caso")
  }

  const isTerminal = ["RELEASED", "CANCELLED", "EXPIRED", "ESCROW_NOT_AVAILABLE"].includes(order.status)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-1 h-auto">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Orden #{order.orderId.slice(-8).toUpperCase()}</p>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          Rol: <span className="font-semibold">{isBuyer ? "Comprador" : "Vendedor"}</span>
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Cripto</p>
          <p className="font-semibold">{order.cryptoAmount} {order.assetCode}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Total fiat</p>
          <p className="font-semibold">{order.fiatAmount.toLocaleString("es-MX")} {order.fiatCode}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Precio unitario</p>
          <p className="font-semibold">{order.price.toLocaleString("es-MX")} {order.fiatCode}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Expira</p>
          <p className="font-semibold text-xs">
            {order.expiresAt ? new Date(order.expiresAt).toLocaleString("es-MX") : "—"}
          </p>
        </div>
      </div>
      <Separator />
      {!isTerminal && (
        <div className="flex flex-col gap-3">
          {isBuyer && order.status === "PAYMENT_PENDING" && (
            <>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Realiza el pago por <strong>{order.fiatAmount.toLocaleString("es-MX")} {order.fiatCode}</strong> usando el metodo acordado. Una vez enviado, presiona el boton de abajo.
                </AlertDescription>
              </Alert>
              <Button onClick={handleMarkPaid} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Ya pague — marcar pago
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={loading} className="w-full">
                <X className="h-4 w-4 mr-2" /> Cancelar orden
              </Button>
            </>
          )}
          {isBuyer && order.status === "PAYMENT_MARKED" && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Pago marcado. El vendedor debe confirmar la recepcion del fiat para liberar el crypto.</AlertDescription>
              </Alert>
              {!showDisputeInput ? (
                <Button variant="destructive" size="sm" onClick={() => setShowDisputeInput(true)}>
                  <ShieldAlert className="h-4 w-4 mr-2" /> Abrir disputa
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Describe el problema detalladamente (min. 20 caracteres)..." rows={3} />
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleDispute} disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Confirmar disputa
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowDisputeInput(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </>
          )}
          {!isBuyer && order.status === "PAYMENT_MARKED" && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El comprador marco el pago. Verifica en tu cuenta externa que hayas recibido <strong>{order.fiatAmount.toLocaleString("es-MX")} {order.fiatCode}</strong> antes de confirmar.
                </AlertDescription>
              </Alert>
              <Button onClick={handleConfirmReceived} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Confirme recepcion del fiat
              </Button>
            </>
          )}
          {!isBuyer && order.status === "RELEASE_PENDING" && (
            <>
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <AlertDescription>
                  <strong>Advertencia:</strong> Solo libera si ya verificaste la recepcion del fiat en tu cuenta bancaria o billetera <strong>fuera de deco-exchange</strong>. Esta accion es irreversible.
                </AlertDescription>
              </Alert>
              <Button onClick={handleRelease} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Liberar {order.cryptoAmount} {order.assetCode}
              </Button>
              {!showDisputeInput ? (
                <Button variant="destructive" size="sm" onClick={() => setShowDisputeInput(true)}>
                  <ShieldAlert className="h-4 w-4 mr-2" /> Abrir disputa
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Describe el problema detalladamente (min. 20 caracteres)..." rows={3} />
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleDispute} disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Confirmar disputa
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowDisputeInput(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </>
          )}
          {order.status === "DISPUTED" && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <AlertDescription>Esta orden esta en disputa. El equipo de soporte revisara el caso. Mantente disponible en el chat.</AlertDescription>
            </Alert>
          )}
        </div>
      )}
      {order.status === "RELEASED" && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription>Operacion completada. El crypto fue liberado correctamente.</AlertDescription>
        </Alert>
      )}
      {(order.status === "CANCELLED" || order.status === "EXPIRED") && (
        <Alert className="border-muted">
          <X className="h-4 w-4" />
          <AlertDescription>Orden {order.status === "EXPIRED" ? "expirada" : "cancelada"}.</AlertDescription>
        </Alert>
      )}
      <Separator />
      <ChatPanel orderId={order.orderId} currentUserId={currentUserId} />
    </div>
  )
}

function OrderList({ orders, onSelect }: { orders: P2POrderRaw[]; onSelect: (order: P2POrderRaw) => void }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="font-medium">No tienes ordenes activas</p>
        <p className="text-sm mt-1">Ve al <strong>Mercado</strong> para encontrar ofertas y crear una orden.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <button key={order.orderId} onClick={() => onSelect(order)} className="w-full text-left rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{order.cryptoAmount} {order.assetCode} — {order.fiatAmount.toLocaleString("es-MX")} {order.fiatCode}</p>
              <p className="text-xs text-muted-foreground mt-0.5">#{order.orderId.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("es-MX")}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </button>
      ))}
    </div>
  )
}

export default function ExchangeView() {
  const { user } = useAuth()
  const { activeOrderId } = useNavigation()
  const [orders, setOrders] = useState<P2POrderRaw[]>([])
  const [selectedOrder, setSelectedOrder] = useState<P2POrderRaw | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const raw = await P2POrdersService.listOrdersRaw()
      const yesterday = Date.now() - 24 * 60 * 60 * 1000
      const filtered = raw.filter(
        (o) => ACTIVE_STATUSES.includes(o.status) || new Date(o.updatedAt).getTime() > yesterday,
      )
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setOrders(filtered)
      if (activeOrderId) {
        const target = filtered.find((o) => o.orderId === activeOrderId) ?? null
        if (target) setSelectedOrder(target)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar ordenes")
    } finally {
      setLoading(false)
    }
  }, [user, activeOrderId])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const handleRefresh = useCallback(() => {
    if (!selectedOrder) { void loadOrders(); return }
    P2POrdersService.getOrderRaw(selectedOrder.orderId)
      .then((updated) => {
        setSelectedOrder(updated)
        setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? updated : o)))
      })
      .catch(() => void loadOrders())
  }, [selectedOrder, loadOrders])

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <AlertCircle className="h-10 w-10 opacity-40" />
        <p className="font-medium">Inicia sesion para ver tus intercambios</p>
      </div>
    )
  }

  return (
    <Card className="rounded-2xl border border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{selectedOrder ? "Detalle del intercambio" : "Mis intercambios activos"}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : selectedOrder ? (
          <OrderPanel order={selectedOrder} currentUserId={user.id} onRefresh={handleRefresh} onBack={() => setSelectedOrder(null)} />
        ) : (
          <OrderList orders={orders} onSelect={setSelectedOrder} />
        )}
      </CardContent>
    </Card>
  )
}
