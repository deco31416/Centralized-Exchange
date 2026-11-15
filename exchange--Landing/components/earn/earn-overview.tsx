import { BookOpen, Coins, Gift, Megaphone, Rocket, Target, Trophy, Users } from "lucide-react"

import {
  EarnHero,
  EarnHeroStat,
  EarnMetricCard,
  EarnPanel,
  EarnProgramCard,
  EarnSummary,
  EarnSummaryRow,
  EarnTimeline,
} from "./earn-components"
import { earnMetrics, earnPrograms, earnTimeline } from "./earn-data"

const programIcons = {
  referrals: <Users className="h-5 w-5" />,
  "deco-points": <Coins className="h-5 w-5" />,
  cashback: <Gift className="h-5 w-5" />,
  "learn-and-earn": <BookOpen className="h-5 w-5" />,
  missions: <Target className="h-5 w-5" />,
  "sponsor-ads": <Megaphone className="h-5 w-5" />,
  launchpad: <Rocket className="h-5 w-5" />,
  "top-earners": <Trophy className="h-5 w-5" />,
}

export function EarnOverview() {
  return (
    <div className="space-y-6">
      <EarnHero
        eyebrow="Ganar · Nivel 5"
        title="Tu impacto vale"
        description="Invita, participa, compra y conviertete en parte visible del crecimiento de Deco Exchange. Cada programa tiene reglas claras, recompensa elegible y una ruta propia."
        aside={
          <EarnHeroStat
            label="Perfil"
            value="Embajador"
            description="El nivel donde el usuario no solo opera: ayuda a crecer el ecosistema."
          />
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {earnMetrics.map((metric) => (
          <EarnMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <EarnPanel>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Programas</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Formas de ganar con Deco</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Esta vista solo ordena el ecosistema. Cada card abre una experiencia completa, sin tabs mezcladas.
              </p>
            </div>
            <div className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">
              Una URL · Un producto
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {earnPrograms.map((program) => (
              <EarnProgramCard
                key={program.id}
                cta={program.cta}
                description={program.description}
                detail={program.detail}
                eyebrow={program.eyebrow}
                href={program.href}
                icon={programIcons[program.id]}
                metric={program.metric}
                status={program.status}
                title={program.title}
              />
            ))}
          </div>
        </EarnPanel>

        <div className="space-y-5">
          <EarnSummary eyebrow="Resumen" title="Estado del usuario" actionHref="/earn/referrals" actionText="Empezar con referidos">
            <EarnSummaryRow label="Nivel" value="Nivel 5 · Embajador" />
            <EarnSummaryRow label="Recompensas" value="Mock elegible" />
            <EarnSummaryRow label="Liquidacion" value="Corte mensual" />
            <EarnSummaryRow label="Privacidad" value="Alias configurable" />
          </EarnSummary>

          <EarnPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Regla de producto</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">Comercial, pero claro</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Ganar debe motivar al usuario, pero cada recompensa queda sujeta a reglas, validacion, actividad y disponibilidad por region.
            </p>
          </EarnPanel>
        </div>
      </div>

      <EarnTimeline events={earnTimeline} />
    </div>
  )
}
