"use client"

import * as React from "react"
import { Check, Send, Paperclip, ImageIcon, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/p2p/use-auth"

interface Seller {
  id: string
  name: string
  verified: boolean
  orders: number
  completion: number
  price: number
  available: number
  min: number
  max: number
  methods: string[]
  time: number
  rating: number
  online?: boolean
}

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
}

interface P2PChatModalProps {
  seller: Seller
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function P2PChatModal({ seller, open, onOpenChange }: P2PChatModalProps) {
  const { user } = useAuth()
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      senderId: seller.id,
      text: "Hola, ¿en qué puedo ayudarte?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ])
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || "user",
      text: message,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simular respuesta del vendedor
    setTimeout(() => {
      const responses = [
        "Claro, puedo ayudarte con eso.",
        "¿Necesitas más información sobre el método de pago?",
        "Sí, estoy disponible para procesar tu orden ahora mismo.",
        "Por favor, asegúrate de seguir las instrucciones de pago correctamente.",
        "Gracias por tu mensaje. Estoy aquí para ayudarte.",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const sellerResponse: Message = {
        id: `msg_${Date.now()}`,
        senderId: seller.id,
        text: randomResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, sellerResponse])
    }, 2000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span>En línea</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
                    <span>Desconectado</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === (user?.id || "user") ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.senderId === (user?.id || "user") ? "bg-primary text-primary-foreground" : "bg-secondary"
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
            <Button variant="ghost" size="icon" className="rounded-full">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Smile className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Escribe un mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
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
