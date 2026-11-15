"use client"

import { useState } from "react"
import { ArrowLeft, Bell, Search, User, MessageCircle, Heart, Share2, Send, Plus } from "lucide-react"

type Post = {
  id: string
  user: {
    name: string
    handle: string
    avatar: string
    verified?: boolean
  }
  content: string
  image?: string
  timestamp: Date
  likes: number
  comments: number
  shares: number
  liked?: boolean
}

type SuggestedUser = {
  id: string
  name: string
  handle: string
  avatar: string
  followers: number
  following: boolean
  verified?: boolean
}

export default function SocialView({
  onAction,
  onBack,
}: {
  onAction: (action: string, data?: any) => void
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState<"feed" | "discover" | "messages">("feed")
  const [showNewPostModal, setShowNewPostModal] = useState(false)

  // Datos de ejemplo para el feed social
  const posts: Post[] = [
    {
      id: "post1",
      user: {
        name: "Crypto Enthusiast",
        handle: "@crypto_fan",
        avatar: "/vibrant-street-market.png",
        verified: true,
      },
      content:
        "¡Bitcoin acaba de superar los $95,000! ¿Quién más cree que llegaremos a $100k antes de fin de mes? 🚀🌕 #Bitcoin #BTC",
      image: "/bitcoin-price-action.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      likes: 245,
      comments: 42,
      shares: 18,
      liked: true,
    },
    {
      id: "post2",
      user: {
        name: "Ethereum Developer",
        handle: "@eth_dev",
        avatar: "/software-developer-workspace.png",
        verified: true,
      },
      content:
        "Acabo de lanzar mi primer proyecto DeFi en Ethereum. Echa un vistazo y dime qué opinas. Los primeros usuarios recibirán tokens de recompensa. 💎",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      likes: 189,
      comments: 37,
      shares: 12,
    },
    {
      id: "post3",
      user: {
        name: "Crypto News",
        handle: "@crypto_updates",
        avatar: "/breaking-news-desk.png",
        verified: true,
      },
      content:
        "ÚLTIMA HORA: La SEC aprueba nuevas regulaciones para exchanges de criptomonedas. Esto podría cambiar significativamente el panorama para los inversores estadounidenses. 📰",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      likes: 312,
      comments: 87,
      shares: 64,
    },
    {
      id: "post4",
      user: {
        name: "NFT Collector",
        handle: "@nft_whale",
        avatar: "/antique-book-collector.png",
      },
      content:
        "Acabo de adquirir esta increíble pieza para mi colección. El arte digital está revolucionando la forma en que valoramos la creatividad. #NFT #DigitalArt",
      image: "/abstract-digital-genesis.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      likes: 156,
      comments: 23,
      shares: 8,
    },
  ]

  // Usuarios sugeridos para seguir
  const suggestedUsers: SuggestedUser[] = [
    {
      id: "user1",
      name: "Blockchain Expert",
      handle: "@blockchain_guru",
      avatar: "/interconnected-blocks.png",
      followers: 15420,
      following: false,
      verified: true,
    },
    {
      id: "user2",
      name: "Crypto Trader",
      handle: "@pro_trader",
      avatar: "/bustling-market-square.png",
      followers: 8932,
      following: false,
    },
    {
      id: "user3",
      name: "DeFi Protocol",
      handle: "@defi_official",
      avatar: "/decentralized-network.png",
      followers: 32150,
      following: true,
      verified: true,
    },
  ]

  // Función para formatear la fecha relativa
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Ahora mismo"
    if (diffMins < 60) return `Hace ${diffMins} min`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours} h`

    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} d`
  }

  // Función para dar like a un post (demo — acción local silenciosa)
  const toggleLike = (_postId: string) => {
    // Acción demo — sin persistencia
  }

  // Función para seguir a un usuario (demo — acción local silenciosa)
  const toggleFollow = (_userId: string) => {
    // Acción demo — sin persistencia
  }

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-white ml-3">Social</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-800">
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "feed" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("feed")}
        >
          Feed
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "discover" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("discover")}
        >
          Descubrir
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "messages" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("messages")}
        >
          Mensajes
        </button>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto mock-wallet-scroll pb-20">
        {activeTab === "feed" && (
          <div>
            {/* Crear post */}
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div
                  className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-gray-400 cursor-pointer"
                  onClick={() => setShowNewPostModal(true)}
                >
                  ¿Qué está pasando en el mundo crypto?
                </div>
              </div>
            </div>

            {/* Posts */}
            <div>
              {posts.map((post) => (
                <div key={post.id} className="px-4 py-4 border-b border-gray-800">
                  <div className="flex">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 mr-3 overflow-hidden">
                      <img
                        src={post.user.avatar || "/placeholder.svg"}
                        alt={post.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-white">{post.user.name}</span>
                        {post.user.verified && (
                          <div className="ml-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                          </div>
                        )}
                        <span className="text-gray-400 text-sm ml-2">{post.user.handle}</span>
                        <span className="text-gray-500 text-xs ml-2">•</span>
                        <span className="text-gray-500 text-xs ml-2">{formatRelativeTime(post.timestamp)}</span>
                      </div>
                      <p className="text-white mt-1 mb-2">{post.content}</p>
                      {post.image && (
                        <div className="mt-2 mb-3 rounded-lg overflow-hidden">
                          <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-auto" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <button
                          className={`flex items-center text-sm ${post.liked ? "text-red-500" : "text-gray-400"}`}
                          onClick={() => toggleLike(post.id)}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${post.liked ? "fill-red-500" : ""}`} />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center text-sm text-gray-400">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center text-sm text-gray-400">
                          <Share2 className="w-4 h-4 mr-1" />
                          <span>{post.shares}</span>
                        </button>
                        <button className="flex items-center text-sm text-gray-400">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "discover" && (
          <div>
            {/* Tendencias */}
            <div className="px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm font-medium text-white mb-3">Tendencias</h3>
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Trending en Crypto</div>
                  <div className="text-white font-medium">#Bitcoin100K</div>
                  <div className="text-xs text-gray-400">24.5K posts</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="text-xs text-gray-400">NFTs</div>
                  <div className="text-white font-medium">#BoredApeYachtClub</div>
                  <div className="text-xs text-gray-400">12.3K posts</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="text-xs text-gray-400">DeFi</div>
                  <div className="text-white font-medium">#YieldFarming</div>
                  <div className="text-xs text-gray-400">8.7K posts</div>
                </div>
              </div>
            </div>

            {/* Usuarios sugeridos */}
            <div className="px-4 py-3">
              <h3 className="text-sm font-medium text-white mb-3">A quién seguir</h3>
              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 mr-3 overflow-hidden">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-white">{user.name}</span>
                          {user.verified && (
                            <div className="ml-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-black rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">{user.handle}</div>
                      </div>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.following ? "bg-transparent border border-gray-600 text-white" : "bg-white text-black"
                      }`}
                      onClick={() => toggleFollow(user.id)}
                    >
                      {user.following ? "Siguiendo" : "Seguir"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="px-4 py-6 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No hay mensajes</h3>
            <p className="text-sm text-gray-400 text-center mb-4">
              Conéctate con otros entusiastas de las criptomonedas y comienza a chatear.
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={() => onAction("start-conversation")}
            >
              Iniciar conversación
            </button>
          </div>
        )}
      </div>

      {/* Botón flotante para crear post */}
      <div className="absolute bottom-20 right-4">
        <button
          className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
          onClick={() => setShowNewPostModal(true)}
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Modal para crear nuevo post */}
      {showNewPostModal && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
          <div className="bg-gray-900 rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <button onClick={() => setShowNewPostModal(false)} className="text-gray-400">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-white font-medium">Crear publicación</h3>
              <button
                className="px-4 py-1 bg-blue-600 text-white text-sm rounded-full"
                onClick={() => {
                  // Aquí iría la lógica para publicar
                  setShowNewPostModal(false)
                }}
              >
                Publicar
              </button>
            </div>
            <div className="p-4">
              <div className="flex mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 mr-3">
                  <User className="w-10 h-10 p-2 text-gray-400" />
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full bg-transparent border-none text-white placeholder-gray-500 resize-none focus:outline-none"
                    placeholder="¿Qué está pasando en el mundo crypto?"
                    rows={4}
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                <div className="flex space-x-4">
                  <button className="text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button className="text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button className="text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-400">0/280</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
