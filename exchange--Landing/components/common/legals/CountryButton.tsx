"use client";

import Link from "next/link"

interface CountryButtonProps {
  name: string
  status: string
  active?: boolean
}

export default function CountryButton({ name, status, active = false }: CountryButtonProps) {
  return (
    <Link
      href={active ? `/country/${name.toLowerCase()}` : "#"}
      className={`block border border-white/20 rounded-full py-3 px-6 text-center transition-colors ${active ? "hover:bg-white/10" : "opacity-70 cursor-default"}`}
    >
      <h3 className="text-lg font-medium mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground">{status}</p>
    </Link>
  )
}
