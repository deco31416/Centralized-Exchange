import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"

const messages = [
  {
    role: "agent",
    content: "Hola, ¿en qué puedo ayudarte hoy?",
    timestamp: "Hace 5 min",
  },
  {
    role: "user",
    content: "Hola, estoy teniendo problemas con mi cuenta.",
    timestamp: "Hace 4 min",
  },
  {
    role: "agent",
    content: "¿Qué parece ser el problema?",
    timestamp: "Hace 3 min",
  },
  {
    role: "user",
    content: "No puedo iniciar sesión.",
    timestamp: "Hace 2 min",
  },
  {
    role: "agent",
    content: "Entiendo. ¿Has intentado restablecer tu contraseña?",
    timestamp: "Hace 1 min",
  },
]

export function ChatCard() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary/10 text-primary">SD</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-medium">Soporte Binance</CardTitle>
            <CardDescription className="text-xs">En línea</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">{message.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <form className="flex w-full items-center space-x-2">
          <Input placeholder="Escribe un mensaje..." className="flex-1" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
