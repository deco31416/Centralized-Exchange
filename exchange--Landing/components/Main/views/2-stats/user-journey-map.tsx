"use client"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useInView } from "framer-motion"
import CountUp from "react-countup"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"


const levels = [
    {
        title: "Crypto fácil",
        label: "Explora y aprende",
        badge: "Nivel 1 · Aprendiz",
        description: "Descubre cómo comprar, vender y usar cripto sin complicaciones.",
    },
    {
        title: "Mercados",
        label: "Opera sin complicaciones",
        badge: "Nivel 2 · Explorador",
        description: "Accede a herramientas P2P, spot y fiat de forma directa y segura.",
    },
    {
        title: "Comercio",
        label: "Controla tus operaciones",
        badge: "Nivel 3 · Estratega",
        description: "Administra tus órdenes, gráficos y análisis con precisión.",
    },
    {
        title: "Rendimiento",
        label: "Potencia tu cuenta",
        badge: "Nivel 4 · Uso Inteligente",
        description: "Activa funciones para hacer más y potenciar tu saldo.",
    },
    {
        title: "Ganar",
        label: "Tu impacto vale",
        badge: "Nivel 5 · Embajador",
        description: "Comparte, invita y forma parte de la comunidad para recibir recompensas.",
    },
]

export default function StatsSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })
    const [current, setCurrent] = useState(0)
    const level = levels[current]

    return (
        <section ref={ref} className="py-12 md:py-16 bg-background">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

                    {/* User Journey Map como primera columna */}
                    <Card className="bg-card border-border h-full">
                        <CardContent className="flex flex-col justify-between h-full p-4 md:p-6">
                            <div className="flex flex-col mb-2">
                                <h4 className="text-sm font-semibold text-foreground">{level.label}</h4>
                                <Badge className="inline-block w-fit mt-1 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full shadow-sm border border-border">
                                    {level.badge}
                                </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground leading-snug min-h-[48px]">
                                {level.description}
                            </p>
                            <Progress value={(current + 1) * 20} className="h-1 bg-border mt-4" />
                            <div className="flex justify-between items-center mt-3">
                                <Button variant="ghost" size="icon" onClick={() => setCurrent((p) => Math.max(0, p - 1))} disabled={current === 0}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-[10px] text-muted-foreground">{`Nivel ${current + 1} de ${levels.length}`}</span>
                                <Button variant="ghost" size="icon" onClick={() => setCurrent((p) => Math.min(levels.length - 1, p + 1))} disabled={current === levels.length - 1}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
