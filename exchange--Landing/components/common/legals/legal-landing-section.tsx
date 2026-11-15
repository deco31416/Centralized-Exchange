import type { LegalLandingSection as LegalLandingSectionType } from "./legal-landing-data"
import { LegalGridCard } from "./legal-grid-card"

export function LegalLandingSection({ eyebrow, index, items }: LegalLandingSectionType) {
  return (
    <section className="py-12 md:py-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">{eyebrow}</h2>
        <span className="text-base font-bold text-foreground md:text-lg">{index}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <LegalGridCard key={item.href} {...item} />
        ))}
      </div>
    </section>
  )
}
