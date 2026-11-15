"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/p2p/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, Info, Loader2, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { usePaymentMethods } from "@/hooks/p2p/use-payment-methods"
import { PaymentMethodsService } from "@/services/P2PService"

export function SettingsView() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const { data: paymentMethods, isLoading: pmLoading, refetch: refetchPm } = usePaymentMethods()

  // Form state para nuevo método de pago
  const [pmType, setPmType] = useState("BANK")
  const [pmLabel, setPmLabel] = useState("")
  const [pmCountry, setPmCountry] = useState("")
  const [pmCurrency, setPmCurrency] = useState("")
  const [pmDetails, setPmDetails] = useState("")
  const [pmSubmitting, setPmSubmitting] = useState(false)
  const [pmDeleting, setPmDeleting] = useState<string | null>(null)

  const handleAddPaymentMethod = async () => {
    if (!pmLabel || !pmCountry || !pmCurrency) {
      toast({ title: "Campos requeridos", description: "Completa tipo, etiqueta, país y moneda.", variant: "destructive" })
      return
    }
    setPmSubmitting(true)
    try {
      await PaymentMethodsService.create({ type: pmType, label: pmLabel, country: pmCountry, currency: pmCurrency, details: pmDetails || undefined })
      toast({ title: "Método de pago agregado" })
      setPmLabel(""); setPmCountry(""); setPmCurrency(""); setPmDetails("")
      refetchPm()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al agregar"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setPmSubmitting(false)
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    setPmDeleting(id)
    try {
      await PaymentMethodsService.remove(id)
      toast({ title: "Método eliminado" })
      refetchPm()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setPmDeleting(null)
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Inicia sesión para acceder a la configuración</CardTitle>
            <CardDescription>Personaliza tu experiencia en la plataforma</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button>Iniciar sesión</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del perfil</CardTitle>
                <CardDescription>Actualiza tu información personal y de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-primary/10 text-xl">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Cambiar foto
                    </Button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{user.name}</h3>
                      {user.verified && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          <Check className="mr-1 h-3 w-3" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-medium">{user.orders}</span> órdenes
                      </div>
                      <div>
                        <span className="font-medium">{user.completion}%</span> completado
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" defaultValue={user.name} readOnly disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" defaultValue={user.email} readOnly disabled />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Para actualizar tu perfil, accede a la configuración principal de tu cuenta.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de verificación</CardTitle>
              </CardHeader>
              <CardContent>
                {user.verified ? (
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertTitle>Verificación completada</AlertTitle>
                    <AlertDescription>Tu cuenta ha sido verificada correctamente.</AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-primary/10 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>Verificación pendiente</AlertTitle>
                    <AlertDescription>
                      Completa el proceso de verificación en la configuración principal de tu cuenta para acceder a todas las funciones.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de pago</CardTitle>
                <CardDescription>Gestiona tus métodos de pago para comprar y vender criptomonedas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Métodos de pago guardados</h3>
                    <Button>Añadir método</Button>
                  </div>

                  {pmLoading ? (
                    <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando métodos de pago...
                    </div>
                  ) : !paymentMethods || paymentMethods.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No tienes métodos de pago registrados.</p>
                  ) : (
                    paymentMethods.map((pm) => (
                      <div key={pm.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <line x1="2" x2="22" y1="10" y2="10" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">{pm.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">{pm.type?.replace("_", " ")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePaymentMethod(pm.id)}
                              disabled={pmDeleting === pm.id}
                            >
                              {pmDeleting === pm.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Añadir nuevo método de pago</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="payment-type">Tipo de método</Label>
                      <Select value={pmType} onValueChange={setPmType}>
                        <SelectTrigger id="payment-type">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BANK">Transferencia bancaria</SelectItem>
                          <SelectItem value="MOBILE_MONEY">Billetera digital / Móvil</SelectItem>
                          <SelectItem value="CASH">Efectivo</SelectItem>
                          <SelectItem value="TRANSFER">Transferencia SPEI / Wire</SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment-name">Etiqueta</Label>
                      <Input id="payment-name" placeholder="Ej: Mi cuenta bancaria principal" value={pmLabel} onChange={(e) => setPmLabel(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment-country">País (ISO 2 letras)</Label>
                      <Input id="payment-country" placeholder="MX, CO, US..." maxLength={2} value={pmCountry} onChange={(e) => setPmCountry(e.target.value.toUpperCase())} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment-currency">Moneda (ISO 3 letras)</Label>
                      <Input id="payment-currency" placeholder="MXN, COP, USD..." maxLength={3} value={pmCurrency} onChange={(e) => setPmCurrency(e.target.value.toUpperCase())} />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="payment-details">Detalles (opcional)</Label>
                      <Input id="payment-details" placeholder="CLABE, IBAN, número de cuenta..." value={pmDetails} onChange={(e) => setPmDetails(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleAddPaymentMethod} disabled={pmSubmitting}>
                    {pmSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historial de transacciones</CardTitle>
                <CardDescription>Visualiza el historial de tus transacciones en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Accede a un historial detallado de todas tus transacciones, incluyendo depósitos, retiros y
                    comisiones.
                  </p>
                  <Button variant="outline">Ver historial</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de notificaciones</CardTitle>
                <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificaciones por correo electrónico</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-orders">Órdenes</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones sobre tus órdenes de compra y venta
                        </p>
                      </div>
                      <Switch id="email-orders" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-messages">Mensajes</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones cuando recibas nuevos mensajes
                        </p>
                      </div>
                      <Switch id="email-messages" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-marketing">Marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe noticias, actualizaciones y ofertas especiales
                        </p>
                      </div>
                      <Switch id="email-marketing" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificaciones push</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-orders">Órdenes</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones push sobre tus órdenes de compra y venta
                        </p>
                      </div>
                      <Switch id="push-orders" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-messages">Mensajes</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones push cuando recibas nuevos mensajes
                        </p>
                      </div>
                      <Switch id="push-messages" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-price">Alertas de precio</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones push sobre cambios significativos en los precios
                        </p>
                      </div>
                      <Switch id="push-price" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Guardar preferencias</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
