"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/p2p/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { User, LogOut, Settings, CreditCard, History } from "lucide-react"
import { LoginModal } from "@/components/p2p/login-modal"
import { RegisterModal } from "@/components/p2p/register-modal"
import { useState } from "react"

export function UserNav() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast({
      title: "Has cerrado sesión correctamente",
      variant: "success",
    })
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLoginModalOpen(true)}>
            Iniciar sesión
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setRegisterModalOpen(true)}
          >
            Registrarse
          </Button>
        </div>

        <LoginModal
          open={loginModalOpen}
          onOpenChange={setLoginModalOpen}
          onRegisterClick={() => {
            setLoginModalOpen(false)
            setRegisterModalOpen(true)
          }}
        />

        <RegisterModal
          open={registerModalOpen}
          onOpenChange={setRegisterModalOpen}
          onLoginClick={() => {
            setRegisterModalOpen(false)
            setLoginModalOpen(true)
          }}
        />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || ""} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Mis anuncios</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <History className="mr-2 h-4 w-4" />
            <span>Historial</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
