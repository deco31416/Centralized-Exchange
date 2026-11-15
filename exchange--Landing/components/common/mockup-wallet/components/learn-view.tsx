"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Bell, Play, Award, Search, Star, StarOff } from "lucide-react"

type Course = {
  id: string
  title: string
  description: string
  level: "Principiante" | "Intermedio" | "Avanzado"
  duration: string
  lessons: number
  completed?: number
  image: string
  isFavorite?: boolean
}

type Article = {
  id: string
  title: string
  category: string
  readTime: string
  date: string
  image: string
  isFavorite?: boolean
}

export default function LearnView({
  onAction,
  onBack,
}: { onAction: (action: string, data?: any) => void; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"courses" | "articles" | "glossary">("courses")
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])

  // Datos de ejemplo para cursos
  const courses: Course[] = [
    {
      id: "crypto-basics",
      title: "Fundamentos de Criptomonedas",
      description: "Aprende los conceptos básicos de blockchain, criptomonedas y cómo funcionan.",
      level: "Principiante",
      duration: "2 horas",
      lessons: 8,
      completed: 3,
      image: "/crypto-learning-journey.png",
      isFavorite: true,
    },
    {
      id: "trading-101",
      title: "Trading para Principiantes",
      description: "Estrategias básicas de trading y análisis de mercados.",
      level: "Principiante",
      duration: "3 horas",
      lessons: 12,
      completed: 0,
      image: "/stock-market-learning.png",
      isFavorite: false,
    },
    {
      id: "defi-explained",
      title: "DeFi Explicado",
      description: "Todo sobre finanzas descentralizadas, protocolos y oportunidades.",
      level: "Intermedio",
      duration: "4 horas",
      lessons: 15,
      completed: 0,
      image: "/decentralized-learning.png",
      isFavorite: false,
    },
    {
      id: "nft-masterclass",
      title: "NFT Masterclass",
      description: "Cómo crear, comprar y vender NFTs en diferentes marketplaces.",
      level: "Intermedio",
      duration: "2.5 horas",
      lessons: 10,
      completed: 0,
      image: "/abstract-nft-learning.png",
      isFavorite: false,
    },
  ]

  // Datos de ejemplo para artículos
  const articles: Article[] = [
    {
      id: "bitcoin-halving",
      title: "¿Qué es el Bitcoin Halving y cómo afecta al precio?",
      category: "Bitcoin",
      readTime: "5 min",
      date: "2 días atrás",
      image: "/bitcoin-halving-mechanism.png",
      isFavorite: true,
    },
    {
      id: "eth-merge",
      title: "Ethereum 2.0: Todo lo que necesitas saber",
      category: "Ethereum",
      readTime: "8 min",
      date: "1 semana atrás",
      image: "/ethereum-transition.png",
      isFavorite: false,
    },
    {
      id: "defi-risks",
      title: "Riesgos en DeFi: Cómo proteger tus inversiones",
      category: "DeFi",
      readTime: "6 min",
      date: "2 semanas atrás",
      image: "/placeholder.svg?height=60&width=90&query=defi%20risks",
      isFavorite: false,
    },
    {
      id: "tax-crypto",
      title: "Impuestos en criptomonedas: Guía completa",
      category: "Finanzas",
      readTime: "10 min",
      date: "1 mes atrás",
      image: "/placeholder.svg?height=60&width=90&query=crypto%20taxes",
      isFavorite: false,
    },
  ]

  // Función para alternar favoritos
  const toggleFavorite = (id: string, type: "course" | "article", e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  // Función para obtener el color del nivel
  const getLevelColor = (level: "Principiante" | "Intermedio" | "Avanzado") => {
    switch (level) {
      case "Principiante":
        return "text-green-500 bg-green-900 bg-opacity-30"
      case "Intermedio":
        return "text-yellow-500 bg-yellow-900 bg-opacity-30"
      case "Avanzado":
        return "text-red-500 bg-red-900 bg-opacity-30"
      default:
        return "text-gray-400 bg-gray-800"
    }
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
            <span className="text-lg font-medium text-white ml-3">Aprender</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Award className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cursos, artículos..."
            className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-800">
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "courses" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          Cursos
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "articles" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("articles")}
        >
          Artículos
        </button>
        <button
          className={`py-3 px-4 text-sm font-medium ${
            activeTab === "glossary" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("glossary")}
        >
          Glosario
        </button>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto mock-wallet-scroll pb-20">
        {activeTab === "courses" && (
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-white mb-3">Cursos recomendados</h3>
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-800"
                  onClick={() => onAction("view-course", { courseId: course.id })}
                >
                  <div className="flex">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-[80px] h-[60px] object-cover rounded-md mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-white">{course.title}</h4>
                        <button
                          onClick={(e) => toggleFavorite(course.id, "course", e)}
                          className="text-gray-400 hover:text-yellow-400 ml-1"
                        >
                          {favorites.includes(course.id) || course.isFavorite ? (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">{course.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                      <span className="text-xs text-gray-400">{course.duration}</span>
                      <span className="text-xs text-gray-400">{course.lessons} lecciones</span>
                    </div>
                    {course.completed ? (
                      <div className="flex items-center">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full mr-2">
                          <div
                            className="h-1.5 bg-blue-500 rounded-full"
                            style={{ width: `${(course.completed / course.lessons) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {course.completed}/{course.lessons}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Play className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-xs text-blue-500">Comenzar</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mt-4"
              onClick={() => onAction("view-all-courses")}
            >
              Ver todos los cursos
            </button>
          </div>
        )}

        {activeTab === "articles" && (
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-white mb-3">Artículos recientes</h3>
            <div className="space-y-3">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-gray-900 rounded-lg p-3 cursor-pointer hover:bg-gray-800"
                  onClick={() => onAction("view-article", { articleId: article.id })}
                >
                  <div className="flex">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-[60px] h-[60px] object-cover rounded-md mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-white">{article.title}</h4>
                        <button
                          onClick={(e) => toggleFavorite(article.id, "article", e)}
                          className="text-gray-400 hover:text-yellow-400 ml-1"
                        >
                          {favorites.includes(article.id) || article.isFavorite ? (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-blue-500">{article.category}</span>
                        <span className="text-xs text-gray-500 mx-2">•</span>
                        <span className="text-xs text-gray-400">{article.readTime}</span>
                        <span className="text-xs text-gray-500 mx-2">•</span>
                        <span className="text-xs text-gray-400">{article.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mt-4"
              onClick={() => onAction("view-all-articles")}
            >
              Ver todos los artículos
            </button>
          </div>
        )}

        {activeTab === "glossary" && (
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-white mb-3">Glosario de términos</h3>
            <p className="text-xs text-gray-400 mb-4">
              Encuentra definiciones de los términos más comunes en el mundo de las criptomonedas.
            </p>

            <div className="space-y-3">
              <div className="bg-gray-900 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white">Blockchain</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Una base de datos distribuida que mantiene una lista creciente de registros ordenados llamados
                  bloques, que están vinculados y asegurados mediante criptografía.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white">Wallet</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Software que almacena claves privadas y públicas, interactúa con varias blockchains para permitir a
                  los usuarios enviar y recibir activos digitales y monitorear su saldo.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white">DeFi</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Finanzas Descentralizadas. Un ecosistema de aplicaciones financieras construidas sobre redes
                  blockchain, principalmente Ethereum, que buscan recrear y mejorar servicios financieros tradicionales.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white">NFT</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Token No Fungible. Un tipo de token criptográfico que representa un activo único, no intercambiable
                  con otro token idéntico, a diferencia de las criptomonedas como Bitcoin.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white">Staking</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Proceso de participar activamente en la validación de transacciones en una red blockchain de Prueba de
                  Participación (PoS). Los usuarios bloquean sus tokens para apoyar la red y ganar recompensas.
                </p>
              </div>
            </div>

            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mt-4"
              onClick={() => onAction("view-full-glossary")}
            >
              Ver glosario completo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
