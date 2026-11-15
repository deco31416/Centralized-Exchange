"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Loader2, QrCode, LogIn } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/p2p/use-auth"
import { BrandLogo } from "@/components/common/brand-logo"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegisterClick: () => void
}

export function LoginModal({ open, onOpenChange, onRegisterClick }: LoginModalProps) {
  const { login, isLoading } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isForgotLoading, setIsForgotLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    const success = await login(email, password)
    if (success) {
      toast({ title: "Sesión iniciada correctamente", variant: "success" })
      onOpenChange(false)
    } else {
      setError("Credenciales incorrectas")
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) {
      toast({ title: "Ingresa tu correo electrónico", variant: "neutral" })
      return
    }
    setIsForgotLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
        credentials: "include",
      })
      // Siempre mostrar mensaje genérico por seguridad (no revelar si el email existe)
      toast({
        title: "Correo enviado",
        description: "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
        variant: "success",
      })
      if (res.ok) {
        setIsForgotMode(false)
        setForgotEmail("")
      }
    } catch {
      toast({ title: "Error de conexión", description: "Inténtalo de nuevo.", variant: "destructive" })
    } finally {
      setIsForgotLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo variant="name" priority />
          </div>
          <DialogTitle className="text-xl">
            {isForgotMode ? "Restablecer contraseña" : "Iniciar sesión"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isForgotMode
              ? "Ingresa tu correo para recibir instrucciones de restablecimiento de contraseña."
              : "Accede a tu cuenta de deco-exchange con tu correo y contraseña."}
          </DialogDescription>
        </DialogHeader>

        {isForgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Correo electrónico</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={isForgotLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isForgotLoading}>
              {isForgotLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                "Enviar enlace"
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full p-0 h-auto text-sm text-muted-foreground"
              onClick={() => setIsForgotMode(false)}
            >
              Volver al inicio de sesión
            </Button>
          </form>
        ) : (
          <>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="email">
                  <LogIn className="w-4 h-4 mr-1" />
                  Correo
                </TabsTrigger>
                <TabsTrigger value="qr">
                  <QrCode className="w-4 h-4 mr-1" />
                  QR
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

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
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Contraseña</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 text-xs h-auto font-semibold text-muted-foreground hover:no-underline hover:text-foreground"
                        onClick={() => { setIsForgotMode(true); setForgotEmail(email) }}
                      >
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

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...
                      </>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="qr">
                <div className="flex flex-col items-center gap-4 text-center py-4">
                  <div className="grid h-40 w-40 place-items-center overflow-hidden rounded-[calc(var(--radius)-0.75rem)] border border-border bg-background p-2">
                    <Image
                      src="/images/deco31416-qr.png"
                      width={144}
                      height={144}
                      alt="QR de deco-exchange"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escanéalo con la App para iniciar sesión.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 w-full flex justify-center">
              <Button
                variant="link"
                className="p-0 h-auto text-sm font-semibold text-muted-foreground hover:no-underline hover:text-foreground"
                type="button"
                onClick={onRegisterClick}
              >
                Crear una cuenta
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
