import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function CookieSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Configuración de Cookies</CardTitle>
        <CardDescription>Gestiona tu configuración de cookies aquí</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="necessary" className="font-medium">
              Estrictamente Necesarias
            </Label>
            <p className="text-xs text-muted-foreground">
              Estas cookies son esenciales para usar el sitio web y sus funciones.
            </p>
          </div>
          <Switch id="necessary" defaultChecked aria-readonly />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="functional" className="font-medium">
              Cookies Funcionales
            </Label>
            <p className="text-xs text-muted-foreground">
              Estas cookies permiten al sitio web proporcionar funcionalidad personalizada.
            </p>
          </div>
          <Switch id="functional" />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="performance" className="font-medium">
              Cookies de Rendimiento
            </Label>
            <p className="text-xs text-muted-foreground">
              Estas cookies ayudan a mejorar el rendimiento del sitio web.
            </p>
          </div>
          <Switch id="performance" />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Guardar preferencias
        </Button>
      </CardFooter>
    </Card>
  )
}
