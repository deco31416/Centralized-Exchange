import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const people = [
  {
    name: "Olivia Martin",
    email: "m@example.com",
    avatar: "",
    access: "Puede editar",
  },
  {
    name: "Isabella Nguyen",
    email: "b@example.com",
    avatar: "",
    access: "Puede ver",
  },
  {
    name: "Sofia Davis",
    email: "p@example.com",
    avatar: "",
    access: "Puede ver",
  },
]

export function ShareDocumentCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Compartir Anuncio</CardTitle>
        <CardDescription>Cualquier persona con el enlace puede ver este anuncio</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center gap-2">
          <Input value="https://binance.com/p2p/link/to/ad" readOnly className="flex-1" />
          <Button variant="outline" size="sm" className="gap-1">
            <Copy className="h-3.5 w-3.5" />
            <span>Copiar</span>
          </Button>
        </div>
        <div>
          <div className="mb-3 text-sm font-medium">Personas con acceso</div>
          <div className="grid gap-4">
            {people.map((person) => (
              <div key={person.email} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={person.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {person.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{person.name}</p>
                    <p className="text-sm text-muted-foreground">{person.email}</p>
                  </div>
                </div>
                <Select defaultValue={person.access === "Puede editar" ? "edit" : "view"}>
                  <SelectTrigger className="ml-auto w-[110px] text-xs">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edit">Puede editar</SelectItem>
                    <SelectItem value="view">Puede ver</SelectItem>
                    <SelectItem value="none">Sin acceso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
