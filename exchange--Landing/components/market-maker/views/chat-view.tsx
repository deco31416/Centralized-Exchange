"use client"

import * as React from "react"
import { Send } from "lucide-react"
import { MarketMakerCard } from "../market-maker-card"
import { chatThreads } from "../market-maker-data"
import { cn } from "@/lib/utils"

export function ChatView() {
  const [activeThreadId, setActiveThreadId] = React.useState(chatThreads[0]?.id)
  const activeThread = chatThreads.find((thread) => thread.id === activeThreadId) ?? chatThreads[0]

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <MarketMakerCard>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mesa OTC</p>
        <h2 className="mt-1 text-xl font-black text-foreground">Negociaciones</h2>
        <p className="mt-1 text-sm text-muted-foreground">Conversaciones abiertas por cupo.</p>
        <div className="mt-4 space-y-2">
          {chatThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={cn(
                "w-full rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted/40",
                thread.id === activeThread?.id && "bg-foreground text-background hover:bg-foreground"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("text-sm font-black text-foreground", thread.id === activeThread?.id && "text-background")}>{thread.title}</p>
                  <p className={cn("text-xs text-muted-foreground", thread.id === activeThread?.id && "text-background/70")}>{thread.summary}</p>
                </div>
                <span className={cn("rounded-full border border-border px-2 py-1 text-[11px] font-bold text-primary", thread.id === activeThread?.id && "border-background/20 text-background")}>
                  {thread.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </MarketMakerCard>

      <MarketMakerCard>
        <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Negociación activa</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">{activeThread?.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{activeThread?.summary}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ["Activo", activeThread?.asset],
              ["Cupo", activeThread?.amount],
              ["Condición", activeThread?.terms],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background px-3 py-2">
                <p className="text-muted-foreground">{label}</p>
                <p className="font-black text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {activeThread?.messages.map((message) => (
            <div
              key={`${message.from}-${message.text}`}
              className={cn(
                "max-w-[86%] rounded-2xl border border-border bg-background p-4",
                message.from === "Maker" && "ml-auto bg-foreground text-background"
              )}
            >
              <p className={cn("text-xs font-bold text-primary", message.from === "Maker" && "text-background/70")}>
                {message.from === "Maker" ? "Mesa proveedora" : "Mesa Deco"}
              </p>
              <p className={cn("mt-1 text-sm text-foreground", message.from === "Maker" && "text-background")}>{message.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-full border border-border bg-background p-2">
          <div className="min-w-0 flex-1 px-3 text-sm text-muted-foreground">Escribe una respuesta comercial...</div>
          <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </MarketMakerCard>
    </div>
  )
}
