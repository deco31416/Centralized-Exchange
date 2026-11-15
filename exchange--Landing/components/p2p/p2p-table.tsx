"use client"

import * as React from "react"
import { Check, ChevronDown, MessageCircle, Star, Clock, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { P2PBuyModal } from "@/components/p2p/p2p-buy-modal"
import { P2PChatModal } from "@/components/p2p/p2p-chat-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

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

interface P2PTableProps extends React.HTMLAttributes<HTMLDivElement> {
  sellers?: Seller[]
  activeTab?: string
}

const defaultSellers: Seller[] = [
  {
    id: "1",
    name: "ONE-PIECE-V",
    verified: true,
    orders: 1554,
    completion: 100,
    price: 0.997,
    available: 34279.39,
    min: 500,
    max: 5000,
    methods: ["ABA", "KHOR"],
    time: 15,
    rating: 4.9,
    online: true,
  },
  {
    id: "2",
    name: "Wingmmo_Vip_Adm",
    verified: true,
    orders: 20372,
    completion: 99.9,
    price: 0.997,
    available: 13315.86,
    min: 40,
    max: 9999,
    methods: ["ABA", "Wing Money", "ACLEDA Bank"],
    time: 15,
    rating: 4.8,
    online: true,
  },
  {
    id: "3",
    name: "TLC-EXCHANGE",
    verified: true,
    orders: 3959,
    completion: 99.9,
    price: 0.997,
    available: 1485.62,
    min: 400,
    max: 1481,
    methods: ["ACLEDA Bank", "ABA", "KHOR"],
    time: 15,
    rating: 4.7,
    online: false,
  },
  {
    id: "4",
    name: "My_SunSiNe四叶草",
    verified: true,
    orders: 4200,
    completion: 99.6,
    price: 0.998,
    available: 8291.23,
    min: 400,
    max: 6500,
    methods: ["ACLEDA Bank", "PPCBank Cambodia", "ABA"],
    time: 15,
    rating: 4.9,
    online: true,
  },
  {
    id: "5",
    name: "Digital-Exchange_董平长",
    verified: true,
    orders: 2436,
    completion: 100,
    price: 0.998,
    available: 26244.01,
    min: 400,
    max: 5000,
    methods: ["ABA", "ACLEDA Bank", "KHOR"],
    time: 15,
    rating: 5.0,
    online: true,
  },
  {
    id: "6",
    name: "HAKHENG",
    verified: true,
    orders: 569,
    completion: 99.4,
    price: 0.998,
    available: 34938.85,
    min: 1500,
    max: 8000,
    methods: ["ABA", "KHOR", "PPCBank Cambodia"],
    time: 15,
    rating: 4.6,
    online: false,
  },
]

export function P2PTable({ className, sellers = defaultSellers, activeTab = "comprar", ...props }: P2PTableProps) {
  const [selectedSeller, setSelectedSeller] = React.useState<Seller | null>(null)
  const [buyModalOpen, setBuyModalOpen] = React.useState(false)
  const [chatModalOpen, setChatModalOpen] = React.useState(false)
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([])
  const { toast } = useToast()

  const handleBuyClick = (seller: Seller) => {
    setSelectedSeller(seller)
    setBuyModalOpen(true)
  }

  const handleChatClick = (seller: Seller) => {
    setSelectedSeller(seller)
    setChatModalOpen(true)
  }

  const toggleFavorite = (id: string) => {
    if (favoriteIds.includes(id)) {
      setFavoriteIds(favoriteIds.filter((fid) => fid !== id))
      toast({
        title: "Eliminado de favoritos",
        variant: "success",
      })
    } else {
      setFavoriteIds([...favoriteIds, id])
      toast({
        title: "Añadido a favoritos",
        variant: "success",
      })
    }
  }

  return (
    <div className={cn("animate-fade-in", className)} {...props}>
      <div className="grid grid-cols-5 gap-4 border-b py-3 text-sm text-muted-foreground">
        <div className="col-span-1">Anunciantes</div>
        <div className="col-span-1 text-center">Precio</div>
        <div className="col-span-1 text-center">Disponible/Límite de órdenes</div>
        <div className="col-span-1 text-center">Pago</div>
        <div className="col-span-1 text-center">Operación</div>
      </div>

      {sellers.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No se encontraron resultados</h3>
          <p className="text-muted-foreground">Intenta ajustar tus filtros o buscar con otros criterios</p>
        </div>
      ) : (
        sellers.map((seller) => (
          <div
            key={seller.id}
            className="grid grid-cols-5 gap-4 border-b py-4 hover:bg-secondary/30 transition-colors hover-scale"
          >
            <div className="col-span-1">
              <div className="flex items-start gap-2">
                <div className="relative">
                  <Avatar className="h-10 w-10 rounded-full border">
                    <AvatarFallback className="bg-primary/10 text-xs">
                      {seller.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {seller.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{seller.name}</span>
                    {seller.verified && (
                      <Badge
                        variant="outline"
                        className="ml-1 h-5 rounded-full bg-primary/10 px-1.5 text-xs text-primary"
                      >
                        <Check className="mr-0.5 h-3 w-3" />
                      </Badge>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 ml-1 text-muted-foreground hover:text-yellow-400"
                            onClick={() => toggleFavorite(seller.id)}
                          >
                            <Star
                              className="h-4 w-4"
                              fill={favoriteIds.includes(seller.id) ? "rgb(250 204 21)" : "none"}
                              stroke={0 < Math.floor(seller.rating) ? "rgb(250 204 21)" : "currentColor"}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{favoriteIds.includes(seller.id) ? "Quitar de favoritos" : "Añadir a favoritos"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <div>{seller.orders} órdenes</div>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                    <div>{seller.completion.toFixed(2)}% Completado</div>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3"
                          fill={i < Math.floor(seller.rating) ? "rgb(250 204 21)" : "none"}
                          stroke={i < Math.floor(seller.rating) ? "rgb(250 204 21)" : "currentColor"}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">{seller.rating.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{seller.time} min</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold">$ {seller.price.toFixed(3)}</div>
              </div>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <div className="text-center">
                <div className="font-medium">{seller.available.toFixed(2)} USDT</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  ${seller.min.toFixed(2)} - ${seller.max.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <div className="flex flex-col gap-1">
                {seller.methods.slice(0, 2).map((method, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {method}
                    {index === 0 && seller.methods.length > 2 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5 px-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {seller.methods.slice(2).map((method, idx) => (
                            <DropdownMenuItem key={idx}>{method}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 flex items-center justify-center gap-2">
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleBuyClick(seller)}>
                {activeTab === "comprar" ? "Comprar USDT" : "Vender USDT"}
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => handleChatClick(seller)}>
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chat con {seller.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))
      )}

      {selectedSeller && (
        <>
          <P2PBuyModal
            seller={selectedSeller}
            open={buyModalOpen}
            onOpenChange={setBuyModalOpen}
            activeTab={activeTab}
          />
          <P2PChatModal seller={selectedSeller} open={chatModalOpen} onOpenChange={setChatModalOpen} />
        </>
      )}
    </div>
  )
}
