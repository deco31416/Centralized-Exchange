"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function ComunidadPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Reglas de Comunidad</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Legales", href: "/legals" },
            { label: "Reglas de Comunidad", href: "/legals/comunidad", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE, valoramos una comunidad respetuosa, segura y colaborativa. Nuestras Reglas de Comunidad
            establecen las expectativas para todos los usuarios que interactúan en nuestras plataformas, foros y canales
            de comunicación.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">REGLAS DE COMUNIDAD</h3>
          </div>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Respeto Mutuo:</strong> Trate a todos los miembros de la comunidad con respeto y cortesía. No
                toleramos el acoso, la intimidación, la discriminación o el comportamiento abusivo de ningún tipo.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Contenido Apropiado:</strong> Comparta solo contenido apropiado y relevante. Está prohibido el
                contenido ilegal, ofensivo, difamatorio, obsceno o que infrinja los derechos de propiedad intelectual.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Privacidad y Confidencialidad:</strong> Respete la privacidad de los demás. No comparta
                información personal o confidencial sin consentimiento.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>No Spam:</strong> Evite el spam, la publicidad no solicitada o la promoción excesiva. Las
                contribuciones deben ser genuinas y agregar valor a la comunidad.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Seguridad:</strong> No intente comprometer la seguridad de nuestras plataformas o de otros
                usuarios. Esto incluye intentos de hackeo, phishing o distribución de malware.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Cumplimiento Legal:</strong> Cumpla con todas las leyes y regulaciones aplicables. No utilice
                nuestras plataformas para actividades ilegales.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Reportar Problemas:</strong> Si observa contenido o comportamiento que viola estas reglas,
                repórtelo a nuestro equipo de moderación.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">CONSECUENCIAS DE VIOLACIONES</h3>

          <p className="text-muted-foreground leading-relaxed">
            Las violaciones de estas reglas pueden resultar en acciones que incluyen, pero no se limitan a:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">Eliminación del contenido ofensivo</li>
            <li className="text-muted-foreground">Advertencias al usuario</li>
            <li className="text-muted-foreground">Suspensión temporal del acceso</li>
            <li className="text-muted-foreground">Prohibición permanente de nuestras plataformas</li>
            <li className="text-muted-foreground">Acciones legales en casos graves</li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Nos reservamos el derecho de modificar estas reglas en cualquier momento. Los cambios entrarán en vigor
            inmediatamente después de su publicación.
          </p>

          <p className="text-muted-foreground mt-4 leading-relaxed">
            Para reportar violaciones o para más información sobre nuestras Reglas de Comunidad, por favor contáctenos a
            través del correo electrónico:{" "}
            <Link href="mailto:community@example.invalid" className="text-primary hover:underline">
              community@example.invalid
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            description="Reglas de comportamiento y normas comunitarias"
            link={{
              text: "Ver detalles",
              href: "/legals/comunidad"
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Reglas de Comunidad - ES"
              description="Descargar PDF"
              href="/downloads/comunidad-es.pdf"
            />

            <DownloadCard
              title="Reglas de Comunidad - EN"
              description="Descargar PDF"
              href="/downloads/comunidad-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
