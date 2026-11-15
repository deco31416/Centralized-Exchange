"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle2, ChevronDown, MessageCircle, Paperclip, Send, Ticket, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SupportView = "home" | "chat" | "ticket"

type SupportEvent = CustomEvent<{ view?: SupportView }>

const supportTopics = [
  "Cuenta y acceso",
  "P2P y disputas",
  "Red Deco",
  "Wallet y saldo",
  "Developers",
  "Otro caso",
]

export function DecoSupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<SupportView>("home")
  const [message, setMessage] = useState("")
  const [ticketCreated, setTicketCreated] = useState(false)
  const [ticketId, setTicketId] = useState("DECOSUP-PENDING")

  useEffect(() => {
    const openSupport = (event: Event) => {
      const detail = (event as SupportEvent).detail
      setView(detail?.view ?? "home")
      setIsOpen(true)
    }

    window.addEventListener("deco:support", openSupport)
    return () => window.removeEventListener("deco:support", openSupport)
  }, [])

  const openPanel = (nextView: SupportView = "home") => {
    setView(nextView)
    setIsOpen(true)
  }

  const closePanel = () => {
    setIsOpen(false)
    setTicketCreated(false)
  }

  const createTicket = () => {
    const reference = Math.floor(1000 + Math.random() * 9000)
    setTicketId(`DECOSUP-${new Date().getFullYear()}-${reference}`)
    setTicketCreated(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (isOpen ? closePanel() : openPanel("home"))}
        className={cn(
          "fixed bottom-6 right-6 z-[60] grid h-12 w-12 place-items-center rounded-full bg-foreground text-background shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition-all hover:scale-105 md:bottom-8 md:right-8 md:h-14 md:w-14",
          isOpen && "scale-95 opacity-80",
        )}
        aria-label="Abrir soporte Deco"
      >
        {isOpen ? <ChevronDown className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {isOpen ? (
        <section className="fixed bottom-24 right-4 z-[70] flex max-h-[calc(100dvh-7rem)] w-[min(calc(100vw-2rem),430px)] flex-col overflow-hidden rounded-[28px] border border-border bg-background shadow-[0_28px_90px_rgba(0,0,0,0.26)] md:bottom-28 md:right-8">
          <header className="flex min-h-20 items-center gap-3 bg-foreground px-5 py-4 text-background">
            {view !== "home" ? (
              <button
                type="button"
                onClick={() => setView("home")}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-background/10"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-background text-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-lg font-black leading-tight">
                {view === "chat" ? "Chat Deco" : view === "ticket" ? "Crear ticket" : "Soporte Deco"}
              </p>
              <p className="text-xs text-background/70">P2P, Red Deco, wallet, cuenta y operaciones</p>
            </div>

            <button
              type="button"
              onClick={closePanel}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-background/10"
              aria-label="Cerrar soporte"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {view === "home" ? (
            <div className="space-y-4 overflow-y-auto p-5">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Centro de ayuda</p>
                <h3 className="mt-2 text-2xl font-black text-foreground">Que necesitas resolver?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Abre un chat rapido o crea un ticket trazable para operaciones, P2P, Red Deco y soporte de usuario.
                </p>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left hover:bg-muted/45"
                >
                  <span>
                    <span className="block font-black text-foreground">Iniciar chat</span>
                    <span className="block text-sm text-muted-foreground">Consulta rapida con agente Deco.</span>
                  </span>
                  <MessageCircle className="h-5 w-5 text-primary" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("ticket")}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left hover:bg-muted/45"
                >
                  <span>
                    <span className="block font-black text-foreground">Crear ticket</span>
                    <span className="block text-sm text-muted-foreground">Caso formal con seguimiento.</span>
                  </span>
                  <Ticket className="h-5 w-5 text-primary" />
                </button>
              </div>
            </div>
          ) : null}

          {view === "chat" ? (
            <div className="flex h-[calc(100dvh-13rem)] min-h-[360px] max-h-[500px] flex-col bg-background">
              <div className="border-b border-border px-5 py-4 text-center text-sm leading-relaxed text-muted-foreground">
                Este chat es una maqueta Deco. Al conectar backend, se guardara con trazabilidad, usuario, producto y ticket asociado.
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <p className="text-center text-xs text-muted-foreground">Hoy</p>
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="max-w-[82%] rounded-2xl bg-muted px-4 py-3">
                    <p className="text-xs font-bold text-muted-foreground">Zea · AI agent</p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      Hola, soy Zea. Puedo ayudarte con P2P, Red Deco, wallet, ticket o estado de operacion.
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Escribe un mensaje"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {view === "ticket" ? (
            <div className="space-y-4 overflow-y-auto p-5">
              {ticketCreated ? (
                <div className="rounded-2xl border border-border bg-card p-5 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                  <h3 className="mt-3 text-xl font-black text-foreground">Ticket creado</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Referencia mock</p>
                  <p className="mt-1 font-mono text-sm font-black text-primary">{ticketId}</p>
                  <Button className="mt-5 rounded-full" onClick={() => setView("chat")}>Continuar por chat</Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Caso de soporte</p>
                    <h3 className="mt-2 text-2xl font-black text-foreground">Describe el problema</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Ideal para disputas P2P, pagos, remesas, Red Deco, acceso de cuenta o soporte operativo.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <select className="h-12 rounded-full border border-border bg-background px-4 text-sm font-bold text-foreground outline-none">
                      {supportTopics.map((topic) => (
                        <option key={topic}>{topic}</option>
                      ))}
                    </select>
                    <input
                      className="h-12 rounded-full border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="Asunto"
                    />
                    <textarea
                      className="min-h-28 rounded-2xl border border-border bg-background p-4 text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="Cuéntanos que paso, monto, ruta, orden o usuario relacionado."
                    />
                    <Button variant="outline" className="justify-start rounded-full">
                      <Paperclip className="h-4 w-4" />
                      Adjuntar evidencia
                    </Button>
                    <Button className="rounded-full" onClick={createTicket}>
                      Crear ticket de soporte
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  )
}
