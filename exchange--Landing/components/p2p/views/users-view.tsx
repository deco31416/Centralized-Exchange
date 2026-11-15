"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, MoreHorizontal, Search, Star } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useP2PUsers } from "@/hooks/p2p/use-p2p-users"

export function UsersView() {
  // Mock retirado: la lista de usuarios viene del hook `useP2PUsers`,
  // que consume `services/P2PService.ts`. Mientras el micro P2P marketplace
  // no exista en el ecosistema DECOX, devuelve [] y la tabla muestra estado vacío.
  // TODO: integrar con micro-p2p-marketplace cuando esté disponible.
  const { data: users } = useP2PUsers()

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  // Filtrar usuarios según los filtros
  const filteredUsers = users.filter((user) => {
    // Filtrar por búsqueda
    if (
      searchQuery &&
      !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(user.email?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filtrar por rol
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false
    }

    // Filtrar por estado
    if (statusFilter !== "all" && user.status !== statusFilter) {
      return false
    }

    return true
  })

  const toggleFavorite = (id: string) => {
    if (favoriteIds.includes(id)) {
      setFavoriteIds(favoriteIds.filter((fid) => fid !== id))
    } else {
      setFavoriteIds([...favoriteIds, id])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Traders P2P</h2>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Reputación de traders</CardTitle>
          <CardDescription>Consulta actividad, reputación y desempeño de traders P2P.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar trader o ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="merchant">Comerciantes</SelectItem>
                  <SelectItem value="user">Traders</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados P2P</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trader</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead className="text-right">Órdenes</TableHead>
                  <TableHead className="text-right">Completadas</TableHead>
                  <TableHead className="text-right">Valoración</TableHead>
                  <TableHead>Estado P2P</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-muted-foreground">No se encontraron traders P2P</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Avatar className="h-10 w-10 rounded-full border">
                            <AvatarFallback className="bg-primary/10 text-xs">
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{user.name}</span>
                              {user.verified && <Check className="h-3.5 w-3.5 text-primary" />}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 ml-1 text-muted-foreground hover:text-yellow-400"
                                onClick={() => toggleFavorite(user.id)}
                              >
                                <Star
                                  className="h-4 w-4"
                                  fill={favoriteIds.includes(user.id) ? "rgb(250 204 21)" : "none"}
                                />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "merchant" ? "default" : "secondary"}>
                          {user.role === "merchant" ? "Comerciante" : "Trader"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{user.orders.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{user.completion.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-3.5 w-3.5"
                                fill={i < Math.floor(user.rating) ? "rgb(250 204 21)" : "none"}
                                stroke={i < Math.floor(user.rating) ? "rgb(250 204 21)" : "currentColor"}
                              />
                            ))}
                          </div>
                          <span className="ml-1 text-sm">{user.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "default"
                              : (user.status as string) === "inactive"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {user.status === "active" ? "Activo" : (user.status as string) === "inactive" ? "Inactivo" : "Suspendido"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                            <DropdownMenuItem>Enviar mensaje</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> traders
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={filteredUsers.length === 0}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={filteredUsers.length === 0}>
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
