"use client"

import React from "react"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"

interface ActionPageShellProps {
  children: React.ReactNode
}

export function ActionPageShell({ children }: ActionPageShellProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-[88px] sm:pt-24">
        {children}
      </div>
      <Footer />
    </>
  )
}
