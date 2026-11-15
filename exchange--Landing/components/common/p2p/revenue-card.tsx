import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"

export function RevenueCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total de Transacciones</CardTitle>
        <CardDescription className="flex items-center text-xs text-success">
          <ArrowUpRight className="mr-1 h-3 w-3" />
          <span>+20.1%</span>
          <span className="ml-1">desde el mes pasado</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">$15,231.89</div>

        {/* SVG con línea verde */}
<div className="mt-4 h-[60px] text-[hsl(142,76%,36%)]"> {/* Green (success) */}
  <svg
    className="w-full h-full"
    viewBox="0 0 240 60"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color: "inherit" }}
  >
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
      </linearGradient>
    </defs>

    <path
      d="M0,50 L30,45 L60,55 L90,47 L120,52 L150,42 L180,35 L210,15 L240,5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M0,50 L30,45 L60,55 L90,47 L120,52 L150,42 L180,35 L210,15 L240,5 V60 H0 Z"
      fill="url(#gradient)"
      opacity="0.2"
    />
    <circle cx="240" cy="5" r="4" fill="currentColor" stroke="white" strokeWidth="1" />
  </svg>
</div>

      </CardContent>
    </Card>
  )
}
