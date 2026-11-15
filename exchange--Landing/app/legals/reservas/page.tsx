"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function ReservasPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Reservas PoR</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Reservas PoR", href: "/reservas", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE, nos comprometemos con la transparencia financiera y la seguridad de los fondos de
            nuestros clientes. Nuestra Prueba de Reservas (PoR, por sus siglas en inglés) demuestra que mantenemos
            reservas suficientes para respaldar todos los fondos de nuestros clientes.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">PRUEBA DE RESERVAS</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">¿QUÉ ES LA PRUEBA DE RESERVAS?</h3>

          <p className="text-muted-foreground leading-relaxed">
            La Prueba de Reservas es un proceso de verificación que demuestra que DECO EXCHANGE mantiene reservas
            financieras suficientes para cubrir el 100% de los fondos de nuestros clientes. Este proceso es verificado
            por auditores independientes y proporciona transparencia sobre la solvencia de nuestra empresa.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">NUESTRO COMPROMISO</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Reserva del 100%:</strong> Mantenemos reservas equivalentes al 100% de los fondos de nuestros
              clientes.
            </li>
            <li className="text-muted-foreground">
              <strong>Auditorías regulares:</strong> Nuestras reservas son auditadas trimestralmente por firmas
              contables independientes.
            </li>
            <li className="text-muted-foreground">
              <strong>Transparencia total:</strong> Publicamos los resultados de las auditorías en nuestra página web.
            </li>
            <li className="text-muted-foreground">
              <strong>Segregación de fondos:</strong> Los fondos de los clientes se mantienen separados de los fondos
              operativos de la empresa.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">METODOLOGÍA DE VERIFICACIÓN</h3>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Snapshot de pasivos:</strong> Se toma una instantánea de todos los saldos de los clientes en un
                momento específico.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Verificación de activos:</strong> Se verifica que los activos en nuestras cuentas bancarias y
                otros instrumentos financieros sean iguales o superiores a los pasivos.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Auditoría independiente:</strong> Una firma contable independiente verifica la precisión de los
                datos y emite un informe.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Publicación de resultados:</strong> Los resultados de la auditoría se publican en nuestra página
                web para que todos los clientes puedan consultarlos.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">RESULTADOS DE AUDITORÍAS RECIENTES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Fecha</th>
                  <th className="py-4 px-4 text-left">Pasivos Totales</th>
                  <th className="py-4 px-4 text-left">Activos Verificados</th>
                  <th className="py-4 px-4 text-left">Ratio de Cobertura</th>
                  <th className="py-4 px-4 text-left">Firma Auditora</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">31/03/2024</td>
                  <td className="py-4 px-4">$15,432,567,890 COP</td>
                  <td className="py-4 px-4">$16,205,196,284 COP</td>
                  <td className="py-4 px-4">105%</td>
                  <td className="py-4 px-4">Deloitte Colombia</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">31/12/2023</td>
                  <td className="py-4 px-4">$14,876,543,210 COP</td>
                  <td className="py-4 px-4">$15,620,370,370 COP</td>
                  <td className="py-4 px-4">105%</td>
                  <td className="py-4 px-4">KPMG Colombia</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">30/09/2023</td>
                  <td className="py-4 px-4">$13,987,654,321 COP</td>
                  <td className="py-4 px-4">$14,687,037,037 COP</td>
                  <td className="py-4 px-4">105%</td>
                  <td className="py-4 px-4">PwC Colombia</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">30/06/2023</td>
                  <td className="py-4 px-4">$12,345,678,901 COP</td>
                  <td className="py-4 px-4">$12,963,962,846 COP</td>
                  <td className="py-4 px-4">105%</td>
                  <td className="py-4 px-4">EY Colombia</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">COMPOSICIÓN DE RESERVAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Nuestras reservas están compuestas por los siguientes activos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Efectivo en bancos:</strong> 70% de las reservas se mantienen en efectivo en bancos de primera
              categoría.
            </li>
            <li className="text-muted-foreground">
              <strong>Bonos gubernamentales:</strong> 20% en bonos gubernamentales de alta liquidez.
            </li>
            <li className="text-muted-foreground">
              <strong>Otros activos líquidos:</strong> 10% en otros activos líquidos de bajo riesgo.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestra Prueba de Reservas o para solicitar detalles adicionales, por favor
            contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:reservas@deco-exchange.com" className="text-primary hover:underline">
              reservas@deco-exchange.com
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
            description="Transparencia financiera con prueba de reservas"
            link={{ text: "Más información", href: "/legals/reservas" }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Informe de Auditoría Q1 2024"
              description="Descargar PDF"
              href="/downloads/auditoria-q1-2024.pdf"
            />

            <DownloadCard
              title="Certificación de Reservas"
              description="Descargar PDF"
              href="/downloads/certificacion-reservas.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
