"use client"

import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/p2p/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User, CheckCircle, AlertTriangle,
  Smartphone, Globe, Clock, Mail, Camera, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import DashCard from "@/components/dashboard/dash-card"
import InfoRow from "@/components/dashboard/info-row"
import type { ProfileData } from "@/components/dashboard/types"

const AVATAR_PRESETS = [
  "crypto-wolf", "diamond-hands", "moon-trader", "satoshi-fan",
  "hodl-master", "defi-native", "nft-collector", "web3-builder",
]

export default function TabPerfil() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarSeed, setAvatarSeed] = useState<string>("")
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [customSeedInput, setCustomSeedInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("bkcex_avatar_seed")
    if (stored) setAvatarSeed(stored)
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setProfile(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const baseSeed = avatarSeed || user?.name || "user"
  const avatarUrl = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(baseSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`
  const userInitials = user?.name?.substring(0, 2).toUpperCase() ?? "??"

  function applyAvatarSeed(seed: string) {
    setAvatarSeed(seed)
    localStorage.setItem("bkcex_avatar_seed", seed)
    setShowAvatarPicker(false)
    setCustomSeedInput("")
  }

  const statusColor = profile?.status === "active" ? "text-green-400" : "text-yellow-400"
  const StatusIcon = profile?.status === "active" ? CheckCircle : AlertTriangle

  return (
    <div className="flex flex-col gap-5">
      {/* Header de perfil */}
      <DashCard className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20 ring-2 ring-primary/40">
            <AvatarImage src={avatarUrl} alt={user?.name ?? "Usuario"} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setShowAvatarPicker((v) => !v)}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
            title="Cambiar avatar"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground truncate">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile?.username ?? user?.name ?? "—"}
              </h2>
              {profile?.username && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
              <div className={cn("flex items-center gap-1.5 mt-1.5 text-sm", statusColor)}>
                <StatusIcon className="h-4 w-4" />
                <span className="capitalize">{profile?.status ?? "—"}</span>
              </div>
            </>
          )}
        </div>
        {user?.verified && (
          <Badge variant="secondary" className="shrink-0 text-green-400 border-green-400/30 bg-green-400/10">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        )}
      </DashCard>

      {/* Selector de avatar */}
      {showAvatarPicker && (
        <DashCard className="border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Elige tu avatar</p>
            <button onClick={() => setShowAvatarPicker(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-4">
            {AVATAR_PRESETS.map((seed) => (
              <button
                key={seed}
                onClick={() => applyAvatarSeed(seed)}
                className={cn(
                  "rounded-xl overflow-hidden ring-2 transition-all hover:scale-105",
                  baseSeed === seed ? "ring-primary" : "ring-transparent hover:ring-primary/40"
                )}
                title={seed}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`}
                  alt={seed}
                  className="h-12 w-12 sm:h-10 sm:w-10"
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="O escribe tu propio seed…"
              value={customSeedInput}
              onChange={(e) => setCustomSeedInput(e.target.value)}
              className="flex-1 rounded-lg bg-background border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => customSeedInput.trim() && applyAvatarSeed(customSeedInput.trim())}
              disabled={!customSeedInput.trim()}
            >
              Aplicar
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
        </DashCard>
      )}

      {/* Datos personales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashCard>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Información</h3>
          <div className="space-y-3">
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile?.email ?? user?.email ?? "—"} loading={loading} />
            <InfoRow icon={<Smartphone className="h-4 w-4" />} label="Teléfono" value={profile?.phone ?? "No registrado"} loading={loading} />
            <InfoRow icon={<Globe className="h-4 w-4" />} label="País" value={profile?.country ?? "—"} loading={loading} />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Miembro desde"
              value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              loading={loading}
            />
          </div>
        </DashCard>
        <DashCard>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">ID de cuenta</h3>
          <div className="space-y-3">
            <InfoRow icon={<User className="h-4 w-4" />} label="User ID" value={profile?.userId ? `${profile.userId.substring(0, 8)}…` : "—"} loading={loading} />
            <InfoRow
              icon={<CheckCircle className="h-4 w-4 text-green-400" />}
              label="Email verificado"
              value={profile?.status === "active" ? "Sí" : "Pendiente"}
              loading={loading}
            />
          </div>
        </DashCard>
      </div>
    </div>
  )
}
