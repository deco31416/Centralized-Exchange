"use client"

import type * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BinanceLogo } from "@/components/p2p/binance-logo"
import { useAuth } from "@/components/p2p/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegisterClick: () => void
}

export function LoginModal({ open, onOpenChange, onRegisterClick }: LoginModalProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    const success = await login(email, password)

    if (success) {
      toast({
        title: "Has iniciado sesión correctamente",
        variant: "success",
      })
      onOpenChange(false)
    } else {
      setError("Credenciales incorrectas. Intenta con demo@example.com / password")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <BinanceLogo className="h-12 w-12 mx-auto" />
          </div>
          <DialogTitle className="text-xl">Iniciar sesión en Binance</DialogTitle>
          <DialogDescription>Accede a tu cuenta para comprar y vender criptomonedas</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Button variant="link" className="p-0 h-auto text-xs">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="text-center w-full">
            ¿No tienes una cuenta?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={onRegisterClick}>
              Regístrate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
