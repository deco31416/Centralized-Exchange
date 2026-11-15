"use client"

import Navbar from "@/components/Main/layout/navbar/navbar"
import Footer from "@/components/Main/layout/footer/footer"
import { LegalAdditionalInfo } from "@/components/common/legals/legal-additional-info"
import { LegalControlCenter } from "@/components/common/legals/legal-control-center"
import { LegalLandingHero } from "@/components/common/legals/legal-landing-hero"
import { LegalLandingSection } from "@/components/common/legals/legal-landing-section"
import { legalSections } from "@/components/common/legals/legal-landing-data"
import ScrollToTop from "@/components/ui/scroll-to-top"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container pb-16 pt-28 md:pt-32">
        <LegalLandingHero />

        <div className="mx-auto mt-14 max-w-[1180px] pb-8 text-center md:mt-24 md:pb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ff6c02]">
            Centro regulatorio
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-foreground md:text-5xl">
            Políticas, términos y documentación para operar con claridad
          </h2>
          <p className="mx-auto mt-6 max-w-6xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Reunimos la documentación legal, operativa y de cumplimiento del ecosistema DECO EXCHANGE para que cada usuario pueda revisar condiciones, riesgos y disponibilidad antes de interactuar con la plataforma.
          </p>
        </div>

        {legalSections.map((section) => (
          <LegalLandingSection key={section.eyebrow} {...section} />
        ))}

        <LegalControlCenter />
        <LegalAdditionalInfo />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
