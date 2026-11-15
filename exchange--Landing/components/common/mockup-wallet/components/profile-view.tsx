"use client"

import type React from "react"

import { useState } from "react"
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  LogOut,
  Settings,
  Shield,
  User,
  UserCheck,
  Wallet,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ProfileSection = {
  id: string
  title: string
  icon: React.ReactNode
  items: ProfileItem[]
}

type ProfileItem = {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  action?: string
  toggle?: boolean
  badge?: string
  badgeColor?: string
}

export default function ProfileView({ onAction }: { onAction: (action: string, data?: any) => void }) {
  const [showModal, setShowModal] = useState<string | null>(null)
  const [hideId, setHideId] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [biometrics, setBiometrics] = useState(false)

  // Usuario mockeado
  const user = {
    name: "User deco-exchange",
    id: "0x7F5E...8A3D",
    email: "user@example.com",
    verificationLevel: 2, // 0: none, 1: basic, 2: intermediate, 3: advanced
    joinDate: new Date(2023, 2, 15),
    avatar: null,
  }

  // Secciones del perfil
  const profileSections: ProfileSection[] = [
    {
      id: "account",
      title: "Cuenta",
      icon: <User className="w-5 h-5 text-blue-500" />,
      items: [
        {
          id: "personal-info",
          title: "Información personal",
          description: "Nombre, email, teléfono",
          action: "personal-info",
        },
        {
          id: "verification",
          title: "Verificación de identidad",
          description: user.verificationLevel === 3 ? "Verificación completa" : "Verificación intermedia",
          badge: user.verificationLevel === 3 ? "Completo" : "Nivel 2",
          badgeColor: user.verificationLevel === 3 ? "green" : "yellow",
          action: "verification",
        },
        {
          id: "payment-methods",
          title: "Métodos de pago",
          description: "Tarjetas, cuentas bancarias",
          action: "payment-methods",
        },
      ],
    },
    {
      id: "security",
      title: "Seguridad",
      icon: <Shield className="w-5 h-5 text-green-500" />,
      items: [
        {
          id: "change-password",
          title: "Cambiar contraseña",
          description: "Actualiza tu contraseña",
          action: "change-password",
        },
        {
          id: "2fa",
          title: "Autenticación de dos factores",
          description: "Protege tu cuenta",
          badge: "Activado",
          badgeColor: "green",
          action: "2fa",
        },
        {
          id: "biometrics",
          title: "Autenticación biométrica",
          description: "Huella digital, Face ID",
          toggle: true,
          action: "biometrics",
        },
        {
          id: "devices",
          title: "Dispositivos conectados",
          description: "Gestiona tus sesiones activas",
          action: "devices",
        },
      ],
    },
    {
      id: "preferences",
      title: "Preferencias",
      icon: <Settings className="w-5 h-5 text-purple-500" />,
      items: [
        {
          id: "dark-mode",
          title: "Modo oscuro",
          toggle: true,
          action: "dark-mode",
        },
        {
          id: "notifications",
          title: "Notificaciones",
          description: "Alertas de precios, transacciones",
          toggle: true,
          action: "notifications",
        },
        {
          id: "language",
          title: "Idioma",
          description: "Español",
          action: "language",
        },
        {
          id: "currency",
          title: "Moneda predeterminada",
          description: "USD",
          action: "currency",
        },
      ],
    },
    {
      id: "support",
      title: "Soporte",
      icon: <HelpCircle className="w-5 h-5 text-orange-500" />,
      items: [
        {
          id: "help-center",
          title: "Centro de ayuda",
          description: "Preguntas frecuentes, tutoriales",
          action: "help-center",
        },
        {
          id: "contact-support",
          title: "Contactar soporte",
          description: "Chat, email, teléfono",
          action: "contact-support",
        },
        {
          id: "about",
          title: "Acerca de deco-exchange",
          description: "Versión 1.0.5",
          action: "about",
        },
      ],
    },
  ]

  // Función para manejar acciones
  const handleItemAction = (action: string) => {
    switch (action) {
      case "dark-mode":
        setDarkMode(!darkMode)
        break
      case "notifications":
        setNotifications(!notifications)
        break
      case "biometrics":
        setBiometrics(!biometrics)
        break
      default:
        setShowModal(action)
        break
    }
  }

  // Función para renderizar un badge
  const renderBadge = (text: string, color: string) => {
    const colorClass =
      color === "green"
        ? "bg-green-900 text-green-400"
        : color === "yellow"
          ? "bg-yellow-900 text-yellow-400"
          : color === "red"
            ? "bg-red-900 text-red-400"
            : "bg-blue-900 text-blue-400"

    return <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>{text}</span>
  }

  // Renderizar modales
  const renderModal = () => {
    if (!showModal) return null

    let modalContent
    let modalTitle

    switch (showModal) {
      case "personal-info":
        modalTitle = "Información personal"
        modalContent = (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nombre</label>
              <input
                type="text"
                value={user.name}
                className="w-full bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                className="w-full bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">ID de usuario</label>
              <div className="flex items-center">
                <input
                  type={hideId ? "password" : "text"}
                  value={user.id}
                  className="flex-1 bg-gray-800 text-white p-2 rounded-l-lg focus:outline-none"
                  readOnly
                />
                <button onClick={() => setHideId(!hideId)} className="bg-gray-700 p-2 rounded-r-lg">
                  {hideId ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Fecha de registro</label>
              <div className="bg-gray-800 text-white p-2 rounded-lg">{user.joinDate.toLocaleDateString()}</div>
            </div>
          </div>
        )
        break

      case "verification":
        modalTitle = "Verificación de identidad"
        modalContent = (
          <div className="space-y-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-white font-medium">Nivel de verificación</span>
                </div>
                {renderBadge(
                  user.verificationLevel === 3 ? "Nivel 3" : "Nivel 2",
                  user.verificationLevel === 3 ? "green" : "yellow",
                )}
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  style={{ width: `${(user.verificationLevel / 3) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>Básico</span>
                <span>Intermedio</span>
                <span>Avanzado</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center mr-2">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-white">Email verificado</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center mr-2">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-white">Teléfono verificado</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center mr-2">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-white">Documento de identidad verificado</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">Comprobante de domicilio pendiente</span>
              </div>
            </div>

            <div className="bg-blue-900 bg-opacity-30 border border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-200">
                Completa tu verificación para aumentar tus límites de transacción y acceder a todas las funcionalidades.
              </p>
            </div>

            <button className="w-full py-2 bg-blue-600 text-white rounded-lg">Completar verificación</button>
          </div>
        )
        break

      case "payment-methods":
        modalTitle = "Métodos de pago"
        modalContent = (
          <div className="space-y-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-white">Visa terminada en 4582</div>
                    <div className="text-xs text-gray-400">Expira: 05/25</div>
                  </div>
                </div>
                <button className="text-xs text-red-500">Eliminar</button>
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-white">Cuenta bancaria</div>
                    <div className="text-xs text-gray-400">Banco Nacional ****1234</div>
                  </div>
                </div>
                <button className="text-xs text-red-500">Eliminar</button>
              </div>
            </div>

            <button className="w-full py-2 bg-blue-600 text-white rounded-lg">Añadir método de pago</button>
          </div>
        )
        break

      case "2fa":
        modalTitle = "Autenticación de dos factores"
        modalContent = (
          <div className="space-y-4">
            <div className="bg-green-900 bg-opacity-30 border border-green-800 rounded-lg p-3">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <p className="text-xs text-green-200">
                  La autenticación de dos factores está activada. Tu cuenta está protegida con una capa adicional de
                  seguridad.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Métodos configurados:</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                      <Lock className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm text-white">Aplicación de autenticación</div>
                      <div className="text-xs text-gray-400">Google Authenticator</div>
                    </div>
                  </div>
                  <button className="text-xs text-blue-500">Cambiar</button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full py-2 bg-gray-700 text-white rounded-lg">Cambiar método 2FA</button>
              <button className="w-full py-2 bg-red-900 text-red-300 rounded-lg">Desactivar 2FA</button>
            </div>
          </div>
        )
        break

      default:
        modalTitle = "Acción"
        modalContent = (
          <p className="text-sm text-gray-400">
            Esta funcionalidad está en desarrollo. Estará disponible próximamente.
          </p>
        )
    }

    return (
      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
        <div className="bg-gray-800 p-4 rounded-lg max-w-xs w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">{modalTitle}</h3>
            <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {modalContent}

          {!["personal-info", "verification", "payment-methods", "2fa"].includes(showModal) && (
            <button onClick={() => setShowModal(null)} className="w-full py-2 bg-blue-500 text-white rounded-lg mt-4">
              Cerrar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowLeft className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-lg font-medium text-white">Perfil</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto mock-wallet-scroll pb-20">
        {/* Perfil del usuario */}
        <div className="px-4 py-5 border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mr-4">
              {user.avatar ? (
                <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-16 h-16 rounded-full" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <div className="flex items-center mt-1">
                <div className="text-sm text-gray-400 mr-2">{hideId ? "••••••••••••" : user.id}</div>
                <button onClick={() => setHideId(!hideId)} className="text-gray-500 hover:text-gray-300">
                  {hideId ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.id)
                    // Aquí podríamos mostrar una notificación de copiado
                  }}
                  className="text-gray-500 hover:text-gray-300 ml-1"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              className="bg-gray-800 p-2 rounded-lg flex flex-col items-center justify-center hover:bg-gray-700"
              onClick={() => handleItemAction("verification")}
            >
              <UserCheck className="w-5 h-5 text-blue-500 mb-1" />
              <span className="text-xs text-gray-300">Verificación</span>
            </button>
            <button
              className="bg-gray-800 p-2 rounded-lg flex flex-col items-center justify-center hover:bg-gray-700"
              onClick={() => handleItemAction("security")}
            >
              <Shield className="w-5 h-5 text-green-500 mb-1" />
              <span className="text-xs text-gray-300">Seguridad</span>
            </button>
            <button
              className="bg-gray-800 p-2 rounded-lg flex flex-col items-center justify-center hover:bg-gray-700"
              onClick={() => handleItemAction("payment-methods")}
            >
              <CreditCard className="w-5 h-5 text-purple-500 mb-1" />
              <span className="text-xs text-gray-300">Pagos</span>
            </button>
          </div>
        </div>

        {/* Secciones del perfil */}
        {profileSections.map((section) => (
          <div key={section.id} className="px-4 py-3 border-b border-gray-800">
            <div className="flex items-center mb-2">
              {section.icon}
              <h3 className="text-md font-medium text-white ml-2">{section.title}</h3>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-lg",
                    item.action ? "cursor-pointer hover:bg-gray-800" : "",
                  )}
                  onClick={() => item.action && handleItemAction(item.action)}
                >
                  <div className="flex-1">
                    <div className="text-sm text-white">{item.title}</div>
                    {item.description && <div className="text-xs text-gray-400">{item.description}</div>}
                  </div>

                  <div className="flex items-center">
                    {item.badge && renderBadge(item.badge, item.badgeColor || "blue")}

                    {item.toggle !== undefined ? (
                      <div
                        className={`w-10 h-5 rounded-full flex items-center p-0.5 ${
                          (item.action === "dark-mode" && darkMode) ||
                          (item.action === "notifications" && notifications) ||
                          (item.action === "biometrics" && biometrics)
                            ? "bg-blue-600"
                            : "bg-gray-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                            (item.action === "dark-mode" && darkMode) ||
                            (item.action === "notifications" && notifications) ||
                            (item.action === "biometrics" && biometrics)
                              ? "translate-x-5"
                              : ""
                          }`}
                        ></div>
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Cerrar sesión */}
        <div className="px-4 py-5">
          <button
            className="flex items-center justify-center w-full py-3 bg-red-900 bg-opacity-30 text-red-400 rounded-lg hover:bg-opacity-50"
            onClick={() => handleItemAction("logout")}
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span>Cerrar sesión</span>
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Versión 1.0.5</p>
            <div className="flex items-center justify-center mt-2 space-x-4">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300">
                Términos
              </a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300">
                Privacidad
              </a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300">
                Ayuda
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {renderModal()}
    </div>
  )
}
