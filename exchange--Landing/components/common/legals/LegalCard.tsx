"use client";

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

interface LegalCardProps {
  title: string
  description: string
  href: string
}

export default function LegalCard({ title, description, href }: LegalCardProps) {
  return (
    <Link
      href={href}
      className="group block border border-white/20 rounded-3xl p-6 transition-colors hover:bg-white/5 hover:border-white/40"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl md:text-2xl font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="border border-white/30 rounded-full p-2 transition-transform group-hover:translate-x-1 group-hover:translate-y--1">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  )
}
