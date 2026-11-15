"use client"

import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import TabPerfil from "@/components/dashboard/tab-perfil"
import TabWallet from "@/components/dashboard/tab-wallet"
import TabOperaciones from "@/components/dashboard/tab-operaciones"
import TabSeguridad from "@/components/dashboard/tab-seguridad"
import TabFirma from "@/components/dashboard/tab-firma"
import TabKyc from "@/components/dashboard/tab-kyc"
import TabReportes from "@/components/dashboard/tab-reportes"
import TabReferidos from "@/components/dashboard/tab-referidos"
import { User, Wallet, Activity, Shield, KeyRound, ShieldCheck, FileText, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "perfil",      label: "Mi Perfil",   icon: User },
  { id: "wallet",      label: "Wallet",      icon: Wallet },
  { id: "operaciones", label: "Operaciones", icon: Activity },
  { id: "seguridad",   label: "Seguridad",   icon: Shield },
  { id: "firma",       label: "Firma / PIN", icon: KeyRound },
  { id: "kyc",         label: "Verificación",icon: ShieldCheck },
  { id: "reportes",    label: "Reportes",    icon: FileText },
  { id: "referidos",   label: "Referidos",   icon: Users },
] as const

type TabId = typeof TABS[number]["id"]

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") as TabId | null
  const [activeTab, setActiveTab] = useState<TabId>(
    initialTab && TABS.some((t) => t.id === initialTab) ? initialTab : "perfil",
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-[88px] sm:pt-24 pb-16">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Mi cuenta</h1>
            <p className="text-base text-muted-foreground mt-2">
              Gestiona tu perfil, wallet, operaciones, seguridad, verificación y reportes
            </p>
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border mb-8 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center min-w-0",
                  activeTab === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {activeTab === "perfil"      && <TabPerfil />}
          {activeTab === "wallet"      && <TabWallet />}
          {activeTab === "operaciones" && <TabOperaciones />}
          {activeTab === "seguridad"   && <TabSeguridad />}
          {activeTab === "firma"       && <TabFirma />}
          {activeTab === "kyc"         && <TabKyc />}
          {activeTab === "reportes"    && <TabReportes />}
          {activeTab === "referidos"   && <TabReferidos />}
        </div>
      </div>
      <Footer />
    </>
  )
}
