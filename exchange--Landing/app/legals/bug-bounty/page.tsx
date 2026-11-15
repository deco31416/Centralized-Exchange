"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function BugBountyPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Bug Bounty</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Programas", href: "/" },
            { label: "Bug Bounty", href: "/bug-bounty", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            El programa Bug Bounty de DECO EXCHANGE está diseñado para incentivar a investigadores de seguridad y
            entusiastas a identificar y reportar vulnerabilidades en nuestras plataformas y servicios. Valoramos la
            colaboración de la comunidad de seguridad para mantener nuestros sistemas seguros y proteger la información
            de nuestros usuarios.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS DEL PROGRAMA</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. ALCANCE DEL PROGRAMA</h3>

          <p className="text-muted-foreground leading-relaxed">
            El programa Bug Bounty cubre las siguientes plataformas y servicios de DECO EXCHANGE:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Sitio web principal:</strong> https://example.invalid y sus subdominios
            </li>
            <li className="text-muted-foreground">
              <strong>Plataforma de clientes:</strong> https://app.example.invalid
            </li>
            <li className="text-muted-foreground">
              <strong>API pública:</strong> https://api.example.invalid
            </li>
            <li className="text-muted-foreground">
              <strong>Aplicaciones móviles:</strong> deco-exchange para Android e iOS
            </li>
            <li className="text-muted-foreground">
              <strong>Plataforma de corresponsales:</strong> https://partners.example.invalid
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">2. TIPOS DE VULNERABILIDADES</h3>

          <p className="text-muted-foreground leading-relaxed">
            Estamos interesados en los siguientes tipos de vulnerabilidades:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Alta Prioridad</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Inyección SQL</li>
                <li className="text-muted-foreground">Ejecución remota de código</li>
                <li className="text-muted-foreground">Autenticación bypass</li>
                <li className="text-muted-foreground">Vulnerabilidades de servidor</li>
                <li className="text-muted-foreground">Acceso no autorizado a datos sensibles</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Media Prioridad</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Cross-Site Scripting (XSS)</li>
                <li className="text-muted-foreground">Cross-Site Request Forgery (CSRF)</li>
                <li className="text-muted-foreground">Vulnerabilidades de configuración</li>
                <li className="text-muted-foreground">Problemas de lógica de negocio</li>
                <li className="text-muted-foreground">Divulgación de información sensible</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. RECOMPENSAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Las recompensas se determinan según la gravedad de la vulnerabilidad reportada:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Nivel de Severidad</th>
                  <th className="py-4 px-4 text-left">Descripción</th>
                  <th className="py-4 px-4 text-left">Recompensa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Crítico</td>
                  <td className="py-4 px-4">
                    Vulnerabilidades que permiten acceso completo al sistema, exposición masiva de datos o pérdida
                    financiera significativa
                  </td>
                  <td className="py-4 px-4">$5,000 - $10,000 USD</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Alto</td>
                  <td className="py-4 px-4">
                    Vulnerabilidades que comprometen datos sensibles o permiten acceso no autorizado a funcionalidades
                    importantes
                  </td>
                  <td className="py-4 px-4">$1,000 - $5,000 USD</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Medio</td>
                  <td className="py-4 px-4">
                    Vulnerabilidades que afectan la seguridad pero requieren condiciones específicas o interacción del
                    usuario
                  </td>
                  <td className="py-4 px-4">$300 - $1,000 USD</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Bajo</td>
                  <td className="py-4 px-4">
                    Vulnerabilidades con impacto limitado que no comprometen datos sensibles
                  </td>
                  <td className="py-4 px-4">$100 - $300 USD</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Informativo</td>
                  <td className="py-4 px-4">
                    Problemas menores o mejores prácticas que no representan una vulnerabilidad inmediata
                  </td>
                  <td className="py-4 px-4">Reconocimiento</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">4. PROCESO DE REPORTE</h3>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Envío del reporte:</strong> Enviar un informe detallado a{" "}
                <Link href="mailto:security@example.invalid" className="text-primary hover:underline">
                  security@example.invalid
                </Link>{" "}
                o a través de nuestro portal de seguridad en{" "}
                <Link href="https://security.example.invalid" className="text-primary hover:underline">
                  https://security.example.invalid
                </Link>
                .
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Confirmación:</strong> Recibirás una confirmación de recepción dentro de las 48 horas
                siguientes.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Evaluación:</strong> Nuestro equipo de seguridad evaluará el reporte y determinará su validez y
                severidad.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Resolución:</strong> Trabajaremos en la solución de la vulnerabilidad y te mantendremos
                informado del progreso.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Recompensa:</strong> Una vez verificada y resuelta la vulnerabilidad, se procesará la recompensa
                correspondiente.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Reconocimiento:</strong> Con tu consentimiento, incluiremos tu nombre en nuestro Hall of Fame.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">5. REQUISITOS DEL REPORTE</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para que un reporte sea considerado válido, debe incluir:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Descripción detallada:</strong> Explicación clara de la vulnerabilidad y su impacto potencial.
            </li>
            <li className="text-muted-foreground">
              <strong>Pasos para reproducir:</strong> Instrucciones paso a paso para reproducir el problema.
            </li>
            <li className="text-muted-foreground">
              <strong>Evidencia:</strong> Capturas de pantalla, videos o código de prueba que demuestren la
              vulnerabilidad.
            </li>
            <li className="text-muted-foreground">
              <strong>Impacto:</strong> Evaluación del posible impacto de la vulnerabilidad.
            </li>
            <li className="text-muted-foreground">
              <strong>Sugerencias de mitigación:</strong> Si es posible, recomendaciones para solucionar el problema.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">6. REGLAS Y RESTRICCIONES</h3>

          <p className="text-muted-foreground leading-relaxed">
            Al participar en nuestro programa Bug Bounty, debes cumplir con las siguientes reglas:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              No realizar pruebas que puedan afectar la disponibilidad o integridad de nuestros servicios (DoS/DDoS).
            </li>
            <li className="text-muted-foreground">
              No acceder, modificar o eliminar datos de otros usuarios sin su consentimiento.
            </li>
            <li className="text-muted-foreground">
              No divulgar públicamente la vulnerabilidad antes de que sea resuelta por nuestro equipo.
            </li>
            <li className="text-muted-foreground">
              No utilizar herramientas automatizadas de escaneo intensivo sin autorización previa.
            </li>
            <li className="text-muted-foreground">
              No explotar la vulnerabilidad más allá de lo necesario para demostrar su existencia.
            </li>
            <li className="text-muted-foreground">
              Actuar de buena fe y respetar la privacidad y seguridad de nuestros usuarios.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">7. HALL OF FAME</h3>

          <p className="text-muted-foreground leading-relaxed">
            Los investigadores que reporten vulnerabilidades válidas serán reconocidos en nuestro Hall of Fame, visible
            en{" "}
            <Link href="https://security.example.invalid/hall-of-fame" className="text-primary hover:underline">
              https://security.example.invalid/hall-of-fame
            </Link>
            , a menos que prefieran permanecer anónimos.
          </p>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestro programa Bug Bounty o para resolver dudas específicas, por favor
            contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:bugbounty@example.invalid" className="text-primary hover:underline">
              bugbounty@example.invalid
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Programas"
            company="DECO EXCHANGE"
            companyInfo="Sin licencia operativa"
            description="Detalles sobre el programa de recompensas por vulnerabilidades"
            link={{ text: "Más información", href: "/legals/bug-bounty" }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Guía Bug Bounty - ES"
              description="Descargar PDF"
              href="/downloads/bug-bounty-es.pdf"
            />

            <DownloadCard
              title="Guía Bug Bounty - EN"
              description="Descargar PDF"
              href="/downloads/bug-bounty-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
