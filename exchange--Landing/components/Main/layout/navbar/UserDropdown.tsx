"use client"

import { useState } from "react"
import Link from "next/link"
import { Copy, Check, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserDropdownProps {
  name: string
  email: string
  username?: string
  avatarUrl: string | undefined
  initials: string
  onLogout: () => void
}

export function UserDropdown({ name, email, username, avatarUrl, initials, onLogout }: UserDropdownProps) {
  const [copied, setCopied] = useState(false)

  const publicId = username || name

  function handleCopyId(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(publicId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden md:flex focus:outline-none rounded-full">
          <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex w-60 flex-col gap-2 rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-[0px_8px_43px_0px_rgba(0,0,0,0.13)]">
        <DropdownMenuLabel className="font-normal px-1 py-0 select-none">
          <p className="text-sm font-semibold text-popover-foreground truncate">{name}</p>
          {/* deco-exchange User ID — usado para transferencias entre usuarios */}
          <div className="flex items-center gap-1 mt-0.5">
            <p className="text-xs text-muted-foreground truncate flex-1 font-medium">{publicId}</p>
            <button
              onClick={handleCopyId}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
              title={copied ? "ID copiado" : "Copiar ID"}
            >
              {copied
                ? <Check className="h-3 w-3 text-green-500" />
                : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuItem
          asChild
          className="focus:bg-accent focus:text-accent-foreground rounded-lg p-0 cursor-pointer border border-border"
        >
          <Link href="/dashboard" className="flex items-center gap-2 text-popover-foreground px-3 py-2 text-sm w-full">
            <User className="h-4 w-4" />
            Mi cuenta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-500 rounded-lg px-3 py-2 text-sm cursor-pointer border border-border"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
