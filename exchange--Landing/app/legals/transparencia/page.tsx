"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function TransparenciaPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Transparencia</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Transparencia", href: "/transparencia", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE, creemos que la transparencia es fundamental para construir y mantener la confianza de
            nuestros clientes. Esta página detalla nuestras políticas de custodia de fondos y solvencia financiera.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">CUSTODIA Y SOLVENCIA</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">CUSTODIA DE FONDOS</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE implementa rigurosas políticas de custodia para garantizar la seguridad de los fondos de
            nuestros clientes:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Segregación de fondos:</strong> Los fondos de los clientes se mantienen en cuentas segregadas,
              separadas de las cuentas operativas de la empresa.
            </li>
            <li className="text-muted-foreground">
              <strong>Entidades custodias:</strong> Trabajamos con instituciones financieras de primer nivel para la
              custodia de fondos.
            </li>
            <li className="text-muted-foreground">
              <strong>Controles internos:</strong> Implementamos un sistema de controles internos con múltiples niveles
              de autorización para cualquier movimiento de fondos.
            </li>
            <li className="text-muted-foreground">
              <strong>Auditorías regulares:</strong> Realizamos auditorías internas mensuales y externas trimestrales de
              nuestros sistemas de custodia.
            </li>
            <li className="text-muted-foreground">
              <strong>Seguros:</strong> Contamos con pólizas de seguro que cubren posibles pérdidas de fondos por
              eventos imprevistos.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">SOLVENCIA FINANCIERA</h3>

          <p className="text-muted-foreground leading-relaxed">
            Nuestra solidez financiera es un pilar fundamental de nuestra operación:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Capital adecuado:</strong> Mantenemos un capital superior al requerido por las regulaciones
              aplicables.
            </li>
            <li className="text-muted-foreground">
              <strong>Reservas líquidas:</strong> Contamos con reservas líquidas que superan el 105% de los fondos de
              clientes.
            </li>
            <li className="text-muted-foreground">
              <strong>Gestión de riesgos:</strong> Implementamos un robusto sistema de gestión de riesgos financieros y
              operativos.
            </li>
            <li className="text-muted-foreground">
              <strong>Diversificación:</strong> Nuestras reservas están diversificadas en diferentes clases de activos y
              entidades financieras.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">INDICADORES FINANCIEROS</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Indicador</th>
                  <th className="py-4 px-4 text-left">Valor</th>
                  <th className="py-4 px-4 text-left">Requerimiento Regulatorio</th>
                  <th className="py-4 px-4 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Ratio de Solvencia</td>
                  <td className="py-4 px-4">18.5%</td>
                  <td className="py-4 px-4">9%</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400">Cumple</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Ratio de Liquidez</td>
                  <td className="py-4 px-4">2.3</td>
                  <td className="py-4 px-4">1.0</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400">Cumple</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cobertura de Reservas</td>
                  <td className="py-4 px-4">105%</td>
                  <td className="py-4 px-4">100%</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400">Cumple</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Capital Mínimo</td>
                  <td className="py-4 px-4">$10,000,000,000 COP</td>
                  <td className="py-4 px-4">$5,000,000,000 COP</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400">Cumple</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">ENTIDADES CUSTODIAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Trabajamos con las siguientes entidades financieras para la custodia de fondos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">Banco de Bogotá (Colombia)</li>
            <li className="text-muted-foreground">Bancolombia (Colombia)</li>
            <li className="text-muted-foreground">JP Morgan Chase (Estados Unidos)</li>
            <li className="text-muted-foreground">BBVA (España)</li>
            <li className="text-muted-foreground">Santander (México)</li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">INFORMES FINANCIEROS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Publicamos regularmente informes financieros para mantener a nuestros clientes y partes interesadas
            informados sobre nuestra situación financiera:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">Informes trimestrales de estados financieros</li>
            <li className="text-muted-foreground">Informes anuales auditados</li>
            <li className="text-muted-foreground">Informes de prueba de reservas</li>
            <li className="text-muted-foreground">Informes de gestión de riesgos</li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestra política de transparencia, custodia de fondos o solvencia financiera, por
            favor contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:transparencia@example.invalid" className="text-primary hover:underline">
              transparencia@example.invalid
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Información Financiera"
            company="DECO EXCHANGE"
            companyInfo="Sin licencia operativa"
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Informe Financiero Q1 2024"
              description="Descargar PDF"
              href="/downloads/informe-financiero-q1-2024.pdf"
            />

            <DownloadCard
              title="Política de Custodia"
              description="Descargar PDF"
              href="/downloads/politica-custodia.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
