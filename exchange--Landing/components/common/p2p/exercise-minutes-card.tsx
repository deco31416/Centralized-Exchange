import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ExerciseMinutesCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Volumen de Transacciones</CardTitle>
        <CardDescription className="text-success">
          El volumen está por encima de lo normal
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Prevenir purga de clases */}
        <div className="hidden text-success" />

        {/* Gráfico con línea principal y de referencia en verde */}
        <div className="h-[120px] text-[hsl(142,76%,36%)]">
          <svg
            className="w-full h-full"
            viewBox="0 0 240 120"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: "inherit" }}
          >
            {/* Línea principal verde */}
            <path
              d="M0,100 L20,90 L40,95 L60,80 L80,55 L100,30 L120,20 L140,40 L160,60 L180,50 L200,70 L220,80 L240,90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Línea de referencia verde más suave */}
            <path
              d="M0,110 L20,105 L40,100 L60,95 L80,90 L100,85 L120,80 L140,85 L160,90 L180,85 L200,90 L220,95 L240,100"
              fill="none"
              stroke="hsl(142,76%,36%)"
              strokeWidth="2"
              strokeOpacity="0.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Círculos verdes */}
            <circle cx="80" cy="55" r="4" fill="currentColor" stroke="white" strokeWidth="1" />
            <circle cx="100" cy="30" r="4" fill="currentColor" stroke="white" strokeWidth="1" />
            <circle cx="120" cy="20" r="4" fill="currentColor" stroke="white" strokeWidth="1" />
            <circle cx="140" cy="40" r="4" fill="currentColor" stroke="white" strokeWidth="1" />
            <circle cx="180" cy="50" r="4" fill="currentColor" stroke="white" strokeWidth="1" />
            <circle cx="240" cy="90" r="4" fill="currentColor" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
