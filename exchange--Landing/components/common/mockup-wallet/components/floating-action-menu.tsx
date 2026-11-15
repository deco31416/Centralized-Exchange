"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowDown, ArrowUp, RefreshCw, Wallet, X, LineChart, Layers, Users, BookOpen, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

type FloatingActionOption = {
  id: string
  label: string
  icon: React.ReactNode
  color?: string
}

export default function FloatingActionMenu({
  onAction,
  onClose,
}: {
  onAction: (action: string) => void
  onClose: () => void
}) {
  // Cambiar la estructura del componente para que aparezca desde abajo
  // Modificar el estilo del contenedor principal
  const [visible, setVisible] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Opciones principales
  const mainOptions: FloatingActionOption[] = [
    {
      id: "deposit",
      label: "Deposito",
      icon: <ArrowDown className="w-5 h-5" />,
      color: "bg-green-600",
    },
    {
      id: "send",
      label: "Enviar",
      icon: <ArrowUp className="w-5 h-5" />,
      color: "bg-red-600",
    },
    {
      id: "convert",
      label: "Convertir",
      icon: <RefreshCw className="w-5 h-5" />,
      color: "bg-blue-600",
    },
    {
      id: "withdraw",
      label: "Retirar",
      icon: <Wallet className="w-5 h-5" />,
      color: "bg-purple-600",
    },
  ]

  // Opciones secundarias (características adicionales)
  const secondaryOptions: FloatingActionOption[] = [
    {
      id: "analytics",
      label: "Análisis",
      icon: <LineChart className="w-5 h-5" />,
      color: "bg-indigo-600",
    },
    {
      id: "defi",
      label: "DeFi",
      icon: <Layers className="w-5 h-5" />,
      color: "bg-yellow-600",
    },
    {
      id: "social",
      label: "Social",
      icon: <Users className="w-5 h-5" />,
      color: "bg-cyan-600",
    },
    {
      id: "learn",
      label: "Aprender",
      icon: <BookOpen className="w-5 h-5" />,
      color: "bg-emerald-600",
    },
    {
      id: "alerts",
      label: "Alertas",
      icon: <Bell className="w-5 h-5" />,
      color: "bg-orange-600",
    },
  ]

  // Efecto para animar la aparición del menú
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 50)

    // Añadir listener para cerrar el menú al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Manejar la selección de una opción
  const handleOptionClick = (optionId: string) => {
    onAction(optionId)
    onClose()
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div
        ref={menuRef}
        className={cn(
          "bg-gray-900 rounded-t-xl p-4 w-full max-w-md transform transition-all duration-300 ease-out",
          visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        )}
        style={{ maxWidth: "100%" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Acciones rápidas</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de arrastre (opcional) */}
        <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-4"></div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Principales</h4>
          <div className="grid grid-cols-4 gap-4">
            {mainOptions.map((option) => (
              <button
                key={option.id}
                className="flex flex-col items-center justify-center"
                onClick={() => handleOptionClick(option.id)}
              >
                <div
                  className={cn(
                    "w-14 h-14 flex items-center justify-center rounded-full mb-2",
                    option.color || "bg-blue-600",
                  )}
                >
                  {option.icon}
                </div>
                <span className="text-xs text-gray-300">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Más opciones</h4>
          <div className="grid grid-cols-5 gap-3">
            {secondaryOptions.map((option) => (
              <button
                key={option.id}
                className="flex flex-col items-center justify-center"
                onClick={() => handleOptionClick(option.id)}
              >
                <div
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-full mb-1",
                    option.color || "bg-blue-600",
                  )}
                >
                  {option.icon}
                </div>
                <span className="text-xs text-gray-300">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
