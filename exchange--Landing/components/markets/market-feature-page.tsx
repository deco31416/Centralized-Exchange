import Link from "next/link"
import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { Button } from "@/components/ui/button"

type MarketFeaturePageProps = {
  eyebrow: string
  title: string
  description: string
  primaryAction: string
  highlights: Array<{
    label: string
    value: string
    detail: string
  }>
  sections: Array<{
    title: string
    description: string
  }>
}

export function MarketFeaturePage({
  eyebrow,
  title,
  description,
  primaryAction,
  highlights,
  sections,
}: MarketFeaturePageProps) {
  return (
    <>
      <Navbar />
      <div className="pt-[88px] sm:pt-24">
        <main className="container space-y-6 py-10">
          <section className="rounded-[var(--radius)] border border-border bg-card/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.035] dark:shadow-none md:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button className="rounded-full">{primaryAction}</Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/markets/p2p">Ver P2P</Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-[var(--radius)] border border-border bg-card/90 p-4 dark:bg-white/[0.035]">
                <p className="text-xs font-bold text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            {sections.map((section) => (
              <div key={section.title} className="rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]">
                <h2 className="text-xl font-black text-foreground">{section.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.description}</p>
              </div>
            ))}
          </section>
        </main>
        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}
