import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Landmark, Wallet } from "lucide-react"

export function PaymentMethodCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Método de Pago</CardTitle>
        <CardDescription>Añade un nuevo método de pago a tu cuenta</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-3 gap-4">
          <Button variant="outline" className="flex flex-col items-center justify-between gap-1 h-auto p-4">
            <CreditCard className="mb-1 h-5 w-5" />
            <span className="text-xs">Tarjeta</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center justify-between gap-1 h-auto p-4">
            <Wallet className="mb-1 h-5 w-5" />
            <span className="text-xs">PayPal</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center justify-between gap-1 h-auto p-4">
            <Landmark className="mb-1 h-5 w-5" />
            <span className="text-xs">Banco</span>
          </Button>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Nombre en la tarjeta" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" placeholder="Ciudad" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="number">Número de tarjeta</Label>
            <Input id="number" placeholder="XXXX XXXX XXXX XXXX" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Mes</Label>
              <Select>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Enero</SelectItem>
                  <SelectItem value="2">Febrero</SelectItem>
                  <SelectItem value="3">Marzo</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Mayo</SelectItem>
                  <SelectItem value="6">Junio</SelectItem>
                  <SelectItem value="7">Julio</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Septiembre</SelectItem>
                  <SelectItem value="10">Octubre</SelectItem>
                  <SelectItem value="11">Noviembre</SelectItem>
                  <SelectItem value="12">Diciembre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Año</Label>
              <Select>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="CVC" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Continuar</Button>
      </CardFooter>
    </Card>
  )
}
