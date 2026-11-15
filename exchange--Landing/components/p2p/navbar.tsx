"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Globe, Menu, Bell, X, ChevronDown, User, LogOut, History, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/p2p/mode-toggle"
import { BinanceLogo } from "@/components/p2p/binance-logo"
import { useAuth } from "@/components/p2p/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LoginModal } from "@/components/p2p/login-modal"
import { RegisterModal } from "@/components/p2p/register-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export function Navbar() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    toast({
      title: "Has cerrado sesión correctamente",
      variant: "success",
    })
  }

  const userAvatarUrl = user?.avatar
    ? user.avatar
    : user
      ? `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
      : undefined

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <BinanceLogo className="h-8 w-8" />
            <span className="hidden font-bold text-primary sm:inline-block">BINANCE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Comprar criptos
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Mercados
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="link" className="text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                  Trading <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link href="#" className="flex w-full">
                      Spot
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="flex w-full">
                      Margin
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="flex w-full">
                      P2P
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="link" className="text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                  Futuros <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link href="#" className="flex w-full">
                      USDⓈ-M
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="flex w-full">
                      COIN-M
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Earn
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Square
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="link" className="text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                  Más <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link href="#" className="flex w-full">
                      Institucional
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="flex w-full">
                      Academia
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="flex w-full">
                      Labs
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Globe className="h-5 w-5" />
          </Button>

          {user && (
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground">
                3
              </Badge>
            </Button>
          )}

          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
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
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setLoginModalOpen(true)}>
                Iniciar sesión
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={() => setRegisterModalOpen(true)}
              >
                Registrarse
              </Button>
            </div>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <div className="flex flex-col h-full">
                <div className="py-4">
                  <Link href="/" className="flex items-center gap-2 mb-6" onClick={() => setMobileMenuOpen(false)}>
                    <BinanceLogo className="h-8 w-8" />
                    <span className="font-bold text-primary">BINANCE</span>
                  </Link>

                  <div className="space-y-4">
                    <Link
                      href="#"
                      className="flex items-center text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Comprar criptos
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mercados
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Trading
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Futuros
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Earn
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Square
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center text-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Más
                    </Link>
                  </div>
                </div>

                <div className="mt-auto">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-2 rounded-lg border">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={userAvatarUrl} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setMobileMenuOpen(false)
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setMobileMenuOpen(false)
                        }}
                      >
                        <History className="mr-2 h-4 w-4" />
                        Historial
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setLoginModalOpen(true)
                          setMobileMenuOpen(false)
                        }}
                      >
                        Iniciar sesión
                      </Button>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          setRegisterModalOpen(true)
                          setMobileMenuOpen(false)
                        }}
                      >
                        Registrarse
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
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
    </header>
  )
}
