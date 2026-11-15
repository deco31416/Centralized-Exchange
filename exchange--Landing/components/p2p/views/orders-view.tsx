"use client"

import React from "react"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Eye,
  Filter,
  MessageCircle,
  MoreHorizontal,
  Search,
  X,
  AlertCircle,
  Clock,
  Check,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { LoginModal } from "@/components/p2p/login-modal"
import { RegisterModal } from "@/components/p2p/register-modal"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Tabs as TabsComponent,
  TabsContent,
  TabsList as TabsListComponent,
  TabsTrigger as TabsTriggerComponent,
} from "@/components/ui/tabs"
import { useP2POrders } from "@/hooks/p2p/use-p2p-orders"
import { useAuth } from "@/components/p2p/use-auth"
import { useNavigation } from "@/components/p2p/use-navigation"

// Componente para el modal de detalles de la orden
function OrderDetailsModal({ isOpen, onClose, order, onGoToExchange }: { isOpen: boolean; onClose: () => void; order: any; onGoToExchange?: (orderId: string) => void }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [timeLeft, setTimeLeft] = useState<number>(order?.timeLeft || 0)
  const [disputeReason, setDisputeReason] = useState("")
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)

  // Contador de tiempo para órdenes en proceso
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (order?.status === "processing" && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [order, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleConfirmPayment = () => {
    toast({
      title: "Pago confirmado",
      description: "Has confirmado el pago. Esperando la liberación de los fondos.",
    })
    onClose()
  }

  const handleConfirmReceipt = () => {
    toast({
      title: "Recepción confirmada",
      description: "Has confirmado la recepción de los fondos. La transacción ha sido completada.",
    })
    onClose()
  }

  const handleCancelOrder = () => {
    toast({
      title: "Orden cancelada",
      description: "La orden ha sido cancelada correctamente.",
    })
    onClose()
  }

  const handleOpenDispute = () => {
    setDisputeModalOpen(true)
  }

  const handleSubmitDispute = () => {
    if (!disputeReason) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un motivo para la disputa.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Disputa abierta",
      description: "Tu disputa ha sido enviada. Un administrador la revisará pronto.",
    })
    setDisputeModalOpen(false)
    onClose()
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de la orden</DialogTitle>
          <DialogDescription>
            Información detallada sobre tu orden de {order.type === "buy" ? "compra" : "venta"} de {order.crypto}
          </DialogDescription>
        </DialogHeader>

        <TabsComponent defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsListComponent className="grid w-full grid-cols-1">
            <TabsTriggerComponent value="details">Detalles</TabsTriggerComponent>
          </TabsListComponent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">ID de orden</div>
                <div className="font-medium">{order.id}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Estado</div>
                <Badge
                  variant={
                    order.status === "completed"
                      ? "default"
                      : order.status === "processing"
                        ? "outline"
                        : order.status === "disputed"
                          ? "destructive"
                          : "secondary"
                  }
                >
                  {order.status === "completed"
                    ? "Completado"
                    : order.status === "processing"
                      ? "En proceso"
                      : order.status === "cancelled"
                        ? "Cancelado"
                        : "En disputa"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Tipo</div>
                <Badge variant={order.type === "buy" ? "default" : "secondary"}>
                  {order.type === "buy" ? "Compra" : "Venta"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Criptomoneda</div>
                <div className="font-medium">{order.crypto}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Cantidad</div>
                <div className="font-medium">{order.amount} {order.crypto}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Precio</div>
                <div className="font-medium">${order.price.toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="font-medium">${order.total.toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Método de pago</div>
                <div className="font-medium">{order.paymentMethod}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Comerciante</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {order.counterparty.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{order.counterparty.name}</span>
                  {order.counterparty.verified && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Fecha de creación</div>
                <div className="font-medium">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</div>
              </div>
              {order.completedAt && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Fecha de finalización</div>
                  <div className="font-medium">{format(new Date(order.completedAt), "dd/MM/yyyy HH:mm")}</div>
                </div>
              )}
              {order.status === "processing" && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Tiempo restante</div>
                  <div className="font-medium flex items-center gap-1 text-amber-500">
                    <Clock className="h-4 w-4" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}
              {order.status === "disputed" && order.disputeReason && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-1">Motivo de la disputa</div>
                  <Alert variant="destructive" className="bg-destructive/10 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{order.disputeReason}</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            {order.status === "processing" && (
              <div className="flex flex-col gap-2">
                <Alert className="bg-primary/10 border-primary/20">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <AlertTitle>Información importante</AlertTitle>
                  <AlertDescription>
                    {order.type === "buy"
                      ? "Realiza el pago utilizando el método seleccionado y confirma cuando hayas completado la transacción."
                      : "Espera a que el comprador realice el pago y confirma la recepción antes de liberar los fondos."}
                  </AlertDescription>
                </Alert>
                <div className="flex justify-between gap-2 mt-2">
                  <Button variant="outline" onClick={handleCancelOrder}>
                    Cancelar orden
                  </Button>
                  <Button variant="outline" onClick={handleOpenDispute}>
                    Abrir disputa
                  </Button>
                  {order.type === "buy" ? (
                    <Button onClick={handleConfirmPayment}>Confirmar pago</Button>
                  ) : (
                    <Button onClick={handleConfirmReceipt}>Liberar fondos</Button>
                  )}
                </div>
              </div>
            )}

            {order.status === "disputed" && (
              <Alert className="bg-amber-500/10 border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Disputa en curso</AlertTitle>
                <AlertDescription>
                  Tu disputa está siendo revisada por nuestro equipo. Te notificaremos cuando haya una resolución.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </TabsComponent>

        <DialogFooter>
          {onGoToExchange && (
            <Button variant="default" onClick={() => { onClose(); onGoToExchange(order.id) }} className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Ir al Intercambio
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Modal de disputa */}
      <Dialog open={disputeModalOpen} onOpenChange={setDisputeModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Abrir disputa</DialogTitle>
            <DialogDescription>
              Explica el motivo de tu disputa para que podamos ayudarte a resolver el problema
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Alert variant="destructive" className="bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Las disputas son revisadas por administradores. Proporciona toda la información relevante y evidencias.
              </AlertDescription>
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
                  <SelectItem value="no-release">El vendedor no ha liberado los fondos</SelectItem>
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
            <div className="space-y-2">
              <Label>Evidencia (opcional)</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Haz clic para subir</span>
                    </p>
                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG o GIF (MAX. 800x400px)</p>
                  </div>
                </label>
                <input id="dropzone-file" type="file" className="hidden" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmitDispute}>
              Enviar disputa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export function OrdersView() {
  const { user } = useAuth()
  const { setActiveView, setActiveOrderId } = useNavigation()
  const { data: orders } = useP2POrders()

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  // Filtrar órdenes según los filtros
  const filteredOrders = orders.filter((order) => {
    // Filtrar por pestaña
    if (activeTab === "buy" && order.type !== "buy") return false
    if (activeTab === "sell" && order.type !== "sell") return false

    // Filtrar por búsqueda
    if (
      searchQuery &&
      !order.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.counterparty.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.crypto.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filtrar por fecha
    if (dateFilter) {
      const orderDate = new Date(order.createdAt)
      const filterDate = new Date(dateFilter)
      if (orderDate.toDateString() !== filterDate.toDateString()) {
        return false
      }
    }

    // Filtrar por estado
    if (statusFilter && order.status !== statusFilter) {
      return false
    }

    // Filtrar por tipo
    if (typeFilter && order.type !== typeFilter) {
      return false
    }

    return true
  })

  const clearFilters = () => {
    setDateFilter(undefined)
    setStatusFilter(null)
    setTypeFilter(null)
    setSearchQuery("")
  }

  const hasActiveFilters = dateFilter || statusFilter || typeFilter || searchQuery

  const handleOpenOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setOrderDetailsOpen(true)
  }

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false)
  }

  const handleOpenLoginModal = () => {
    setLoginModalOpen(true)
  }

  const handleCloseLoginModal = () => {
    setLoginModalOpen(false)
  }

  const handleOpenRegisterModal = () => {
    setRegisterModalOpen(true)
  }

  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false)
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Mis Órdenes</h2>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Inicia sesión para ver tus órdenes</CardTitle>
            <CardDescription>Consulta el historial de tus órdenes de compra y venta</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={handleOpenLoginModal}>Iniciar sesión</Button>
          </CardFooter>
        </Card>

        <LoginModal open={loginModalOpen} onOpenChange={(v) => { if (!v) handleCloseLoginModal() }} onRegisterClick={handleOpenRegisterModal} />
        <RegisterModal open={registerModalOpen} onOpenChange={(v) => { if (!v) handleCloseRegisterModal() }} onLoginClick={handleOpenLoginModal} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Mis Órdenes</h2>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Historial de órdenes</CardTitle>
          <CardDescription>Consulta y gestiona tus órdenes de compra y venta</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <TabsList className="grid w-full sm:w-[400px] grid-cols-3">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="buy">Compras</TabsTrigger>
                <TabsTrigger value="sell">Ventas</TabsTrigger>
              </TabsList>

              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, comerciante o cripto..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filtros</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Filtros</h4>
                        <p className="text-sm text-muted-foreground">Filtra tus órdenes por fecha, estado o tipo</p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label className="text-sm font-medium leading-none col-span-1">Fecha</label>
                          <div className="col-span-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {dateFilter ? (
                                    format(dateFilter, "PPP", { locale: es })
                                  ) : (
                                    <span>Seleccionar fecha</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={dateFilter}
                                  onSelect={setDateFilter}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label className="text-sm font-medium leading-none col-span-1">Estado</label>
                          <div className="col-span-3">
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={statusFilter || ""}
                              onChange={(e) => setStatusFilter(e.target.value || null)}
                            >
                              <option value="">Todos</option>
                              <option value="completed">Completado</option>
                              <option value="processing">En proceso</option>
                              <option value="cancelled">Cancelado</option>
                              <option value="disputed">En disputa</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label className="text-sm font-medium leading-none col-span-1">Tipo</label>
                          <div className="col-span-3">
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={typeFilter || ""}
                              onChange={(e) => setTypeFilter(e.target.value || null)}
                            >
                              <option value="">Todos</option>
                              <option value="buy">Compra</option>
                              <option value="sell">Venta</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <Button onClick={clearFilters} variant="outline" className="w-full">
                        Limpiar filtros
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {hasActiveFilters && (
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {dateFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(dateFilter, "PPP", { locale: es })}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => setDateFilter(undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {statusFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Estado:{" "}
                    {statusFilter === "completed"
                      ? "Completado"
                      : statusFilter === "processing"
                        ? "En proceso"
                        : statusFilter === "cancelled"
                          ? "Cancelado"
                          : "En disputa"}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => setStatusFilter(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {typeFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Tipo: {typeFilter === "buy" ? "Compra" : "Venta"}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => setTypeFilter(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Búsqueda: {searchQuery}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Comerciante</TableHead>
                    <TableHead>Cripto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p className="text-muted-foreground">No se encontraron órdenes</p>
                          {hasActiveFilters && (
                            <Button variant="outline" size="sm" className="mt-2" onClick={clearFilters}>
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <Badge variant={order.type === "buy" ? "default" : "secondary"}>
                            {order.type === "buy" ? "Compra" : "Venta"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {order.counterparty.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{order.counterparty.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{order.crypto}</TableCell>
                        <TableCell className="text-right">
                          {order.amount} {order.crypto}
                        </TableCell>
                        <TableCell className="text-right">${order.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "processing"
                                  ? "outline"
                                  : order.status === "disputed"
                                    ? "destructive"
                                    : "secondary"
                            }
                          >
                            {order.status === "completed"
                              ? "Completado"
                              : order.status === "processing"
                                ? "En proceso"
                                : order.status === "cancelled"
                                  ? "Cancelado"
                                  : "En disputa"}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MessageCircle className="h-4 w-4" />
                              <span className="sr-only">Chat</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenOrderDetails(order)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </DropdownMenuItem>
                                {order.status === "processing" && (
                                  <>
                                    <DropdownMenuItem>Confirmar pago</DropdownMenuItem>
                                    <DropdownMenuItem>Cancelar orden</DropdownMenuItem>
                                  </>
                                )}
                                {order.status === "disputed" && <DropdownMenuItem>Ver disputa</DropdownMenuItem>}
                                {order.status === "completed" && <DropdownMenuItem>Descargar recibo</DropdownMenuItem>}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando <strong>{filteredOrders.length}</strong> de <strong>{orders.length}</strong> órdenes
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                  Siguiente
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <OrderDetailsModal
        isOpen={orderDetailsOpen}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
        onGoToExchange={(orderId) => { setActiveOrderId(orderId); setActiveView("exchange") }}
      />
    </div>
  )
}



