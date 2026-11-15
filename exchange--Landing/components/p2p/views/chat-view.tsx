"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Info, MessageCircle, Search, Send } from "lucide-react"
import { useAuth } from "@/components/p2p/use-auth"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { P2POrdersService, P2PChatService } from "@/services/P2PService"
import type { P2POrderRaw, P2PChatMessageRaw } from "@/types/p2p"

type ChatMsg = P2PChatMessageRaw
import { useToast } from "@/components/ui/use-toast"

const ACTIVE_STATUSES = ["CREATED", "ESCROW_PENDING", "ESCROW_LOCKED", "PAYMENT_PENDING", "PAYMENT_MARKED", "RELEASE_PENDING", "DISPUTED"]

export function ChatView() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<P2POrderRaw[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  // Helper: get order ID (P2POrderRaw uses orderId not id)
  const getOrderId = (o: P2POrderRaw) => o.orderId
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cargar órdenes activas al montar
  useEffect(() => {
    if (!user) return
    setLoadingOrders(true)
    P2POrdersService.listOrdersRaw()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false))
  }, [user])

  // Cargar mensajes cuando cambia la orden seleccionada
  useEffect(() => {
    if (!activeOrderId) { setMessages([]); return }
    setLoadingMessages(true)
    P2PChatService.getMessages(activeOrderId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false))
  }, [activeOrderId])

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status ?? ""))

  const filteredOrders = activeOrders.filter((o) => {
    if (activeTab === "active" && !ACTIVE_STATUSES.includes(o.status ?? "")) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const counterparty = (o.sellerId === user?.id ? o.buyerId : o.sellerId) ?? ""
      if (!getOrderId(o).toLowerCase().includes(q) && !counterparty.toLowerCase().includes(q) && !(o.assetCode ?? "").toLowerCase().includes(q)) return false
    }
    return true
  })

  const selectedOrder = orders.find((o) => getOrderId(o) === activeOrderId)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeOrderId) return
    const text = newMessage.trim()
    setNewMessage("")
    try {
      const sent = await P2PChatService.sendMessage(activeOrderId, text)
      setMessages((prev) => [...prev, sent])
    } catch {
      toast({ title: "Error al enviar el mensaje", variant: "destructive" } as Parameters<typeof toast>[0])
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    if (diffDays === 1) return "Ayer"
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" })
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Chat</h2>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Inicia sesión para acceder al chat</CardTitle>
            <CardDescription>Comunícate con otros usuarios sobre tus órdenes P2P activas</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Chat</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de órdenes / hilos */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Órdenes activas</CardTitle>
            <CardDescription>Selecciona una orden para chatear</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 pb-3">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="active">Activas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID u orden..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-360px)]">
              {loadingOrders ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Cargando órdenes...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No tienes órdenes activas con chat disponible</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredOrders.map((order) => {
                    const isBuyer = order.buyerId === user.id
                    return (
                      <button
                        key={order.orderId}
                        className={`w-full rounded-lg p-3 text-left transition-colors hover:bg-secondary ${activeOrderId === order.orderId ? "bg-secondary" : ""}`}
                        onClick={() => setActiveOrderId(order.orderId)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-xs">
                              {isBuyer ? "VD" : "CO"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">
                                {isBuyer ? "Vendedor" : "Comprador"}
                              </span>
                              <Badge variant={isBuyer ? "default" : "secondary"} className="text-xs shrink-0">
                                {isBuyer ? "Compra" : "Venta"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {order.assetCode} · {order.fiatCode} · #{order.orderId.slice(-6)}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1 capitalize">
                              {order.status?.replace("_", " ").toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de mensajes */}
        <Card className="md:col-span-2">
          {!selectedOrder ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-250px)]">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Selecciona una orden</h3>
              <p className="text-sm text-muted-foreground mt-2">Elige una orden de la lista para ver el chat</p>
            </div>
          ) : (
            <div className="flex flex-col h-[calc(100vh-250px)]">
              <CardHeader className="pb-3 border-b shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs">
                      {selectedOrder.buyerId === user.id ? "VD" : "CO"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {selectedOrder.buyerId === user.id ? "Vendedor" : "Comprador"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                    Orden #{selectedOrder.orderId.slice(-8)} · {selectedOrder.assetCode}/{selectedOrder.fiatCode}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">
                    {selectedOrder.status?.replace("_", " ").toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  {loadingMessages ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Cargando mensajes...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay mensajes aún. Sé el primero en escribir.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId === user.id
                        return (
                          <div key={msg.messageId} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div className={`rounded-lg px-3 py-2 max-w-[80%] ${isOwn ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                              <p className="text-sm">{msg.text}</p>
                              <p className="text-xs opacity-70 mt-1 text-right">
                                {msg.createdAt ? formatTime(msg.createdAt) : ""}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              <CardFooter className="border-t p-4 shrink-0">
                <form
                  className="flex w-full items-center gap-2"
                  onSubmit={(e) => { e.preventDefault(); void handleSendMessage() }}
                >
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </form>
              </CardFooter>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

