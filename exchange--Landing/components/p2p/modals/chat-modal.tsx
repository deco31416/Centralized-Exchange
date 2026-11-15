"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/p2p/use-auth"
import { Check, Send } from "lucide-react"

type Seller = {
  id: string
  name: string
  verified: boolean
  online: boolean
  [key: string]: unknown
}

type ChatModalProps = {
  isOpen: boolean
  onClose: () => void
  seller: Seller | null
}

export function ChatModal({ isOpen, onClose, seller }: ChatModalProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "1",
      senderId: seller?.id || "seller",
      text: "Hola, ¿en qué puedo ayudarte?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || "user",
      text: message,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setMessage("")

    setTimeout(() => {
      const responses = [
        "Claro, puedo ayudarte con eso.",
        "¿Necesitas más información sobre el método de pago?",
        "Sí, estoy disponible para procesar tu orden ahora mismo.",
        "Por favor, asegúrate de seguir las instrucciones de pago correctamente.",
        "Gracias por tu mensaje. Estoy aquí para ayudarte.",
      ]
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          senderId: seller?.id || "seller",
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
        },
      ])
    }, 2000)
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  if (!seller) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 rounded-full border">
              <AvatarFallback className="bg-primary/10 text-xs">
                {seller.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-1">
                {seller.name}
                {seller.verified && (
                  <Badge variant="outline" className="ml-1 h-5 rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                    <Check className="mr-0.5 h-3 w-3" />
                  </Badge>
                )}
              </DialogTitle>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {seller.online ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>En línea</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span>Desconectado</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === (user?.id || "user") ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.senderId === (user?.id || "user")
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <div className="text-sm">{msg.text}</div>
                  <div className="mt-1 text-right text-xs opacity-70">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage() }}
              className="flex-1"
            />
            <Button
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="icon"
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
