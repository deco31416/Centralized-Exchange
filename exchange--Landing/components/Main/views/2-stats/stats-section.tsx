"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useInView } from "framer-motion"
import CountUp from "react-countup"
import { getLandingStats, type LandingStatsData } from "@/services/LandingStatsService"

export interface LandingStatItem {
  value: string
  suffix?: string
  label: string
}

// Conservado para compatibilidad con otros consumidores externos
export const LANDING_STATS: LandingStatItem[] = [
  { value: "200M", suffix: "+", label: "Transacciones" },
  { value: "18", suffix: "+", label: "Criptomonedas" },
  { value: "3", suffix: "+", label: "Monedas fiat" },
  { value: "350K", suffix: "+", label: "Usuarios" },
  // { value: "200", suffix: "+", label: "Countries" },
]

const STAT_DEFINITIONS: {
  apiKey: keyof LandingStatsData
  suffix: string
  label: string
  fallback: number
}[] = [
  { apiKey: "transactions",     suffix: "+", label: "Transacciones", fallback: 0  },
  { apiKey: "cryptocurrencies", suffix: "+", label: "Criptomonedas", fallback: 18 },
  { apiKey: "fiatMoney",        suffix: "+", label: "Monedas fiat",  fallback: 3  },
  { apiKey: "users",            suffix: "+", label: "Usuarios",      fallback: 0  },
]

export default function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [liveStats, setLiveStats] = useState<LandingStatsData | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchStats = async () => {
      try {
        const data = await getLandingStats()
        if (!cancelled) setLiveStats(data)
      } catch {
        // Error silencioso — se usan los valores fallback
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <section ref={ref} className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STAT_DEFINITIONS.map((stat, index) => {
            const rawValue = liveStats?.[stat.apiKey]
            const endValue = typeof rawValue === "number" ? rawValue : stat.fallback
            return (
              <Card
                key={index}
                className="border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-none dark:hover:shadow-none"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
                  <div className="text-3xl md:text-4xl font-bold flex items-center">
                    {isInView ? (
                      <>
                        <CountUp end={endValue} duration={2.5} separator="," />
                        {stat.suffix}
                      </>
                    ) : (
                      <span>0</span>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground mt-2">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
