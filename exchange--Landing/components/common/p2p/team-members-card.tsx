import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronDown, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const teamMembers = [
  {
    name: "Sofía Davis",
    email: "m@example.com",
    avatar: "",
    role: "Propietario",
  },
  {
    name: "Jackson Lee",
    email: "p@example.com",
    avatar: "",
    role: "Miembro",
  },
  {
    name: "Isabella Nguyen",
    email: "i@example.com",
    avatar: "",
    role: "Miembro",
  },
]

export function TeamMembersCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Comerciantes Destacados</CardTitle>
            <CardDescription>Comerciantes con mejor reputación</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Añadir</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {teamMembers.map((member) => (
          <div key={member.email} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {member.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto gap-1">
                  {member.role}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Propietario</DropdownMenuItem>
                <DropdownMenuItem>Miembro</DropdownMenuItem>
                <DropdownMenuItem>Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
