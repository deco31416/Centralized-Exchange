"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link";
import Breadcrumb from "@/components/common/legals/Breadcrumb";
import DownloadCard from "@/components/common/legals/DownloadCard";
import InfoCard from "@/components/common/legals/InfoCard";

export default function ComisionesPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Comisiones</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Comisiones", href: "/comisiones", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE, nos esforzamos por ofrecer servicios de transferencia de dinero con comisiones
            competitivas y transparentes. A continuación, detallamos nuestra estructura de comisiones para los
            diferentes servicios que ofrecemos.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">ESTRUCTURA DE COMISIONES</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">TRANSFERENCIAS NACIONALES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Monto</th>
                  <th className="py-4 px-4 text-left">Comisión</th>
                  <th className="py-4 px-4 text-left">Tiempo de procesamiento</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">$0 - $100.000 COP</td>
                  <td className="py-4 px-4">$3.500 COP</td>
                  <td className="py-4 px-4">Inmediato</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">$100.001 - $300.000 COP</td>
                  <td className="py-4 px-4">$5.000 COP</td>
                  <td className="py-4 px-4">Inmediato</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">$300.001 - $500.000 COP</td>
                  <td className="py-4 px-4">$7.500 COP</td>
                  <td className="py-4 px-4">Inmediato</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">$500.001 - $1.000.000 COP</td>
                  <td className="py-4 px-4">$10.000 COP</td>
                  <td className="py-4 px-4">Inmediato</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Más de $1.000.000 COP</td>
                  <td className="py-4 px-4">1% del monto</td>
                  <td className="py-4 px-4">Inmediato</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">TRANSFERENCIAS INTERNACIONALES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Destino</th>
                  <th className="py-4 px-4 text-left">Comisión</th>
                  <th className="py-4 px-4 text-left">Tiempo de procesamiento</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Brasil</td>
                  <td className="py-4 px-4">2.5% del monto</td>
                  <td className="py-4 px-4">1-2 horas</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">México</td>
                  <td className="py-4 px-4">3% del monto</td>
                  <td className="py-4 px-4">2-4 horas</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Panamá</td>
                  <td className="py-4 px-4">2.8% del monto</td>
                  <td className="py-4 px-4">1-3 horas</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Estados Unidos</td>
                  <td className="py-4 px-4">3.2% del monto</td>
                  <td className="py-4 px-4">4-6 horas</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Otros países</td>
                  <td className="py-4 px-4">3.5% del monto</td>
                  <td className="py-4 px-4">6-24 horas</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">COMISIONES ADICIONALES</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Cambio de moneda:</strong> 1.5% adicional sobre la tasa de cambio oficial
            </li>
            <li className="text-muted-foreground">
              <strong>Cancelación de transferencia:</strong> $10.000 COP o 2% del monto (el que sea mayor)
            </li>
            <li className="text-muted-foreground">
              <strong>Modificación de beneficiario:</strong> $5.000 COP
            </li>
            <li className="text-muted-foreground">
              <strong>Consulta de estado:</strong> Sin costo
            </li>
            <li className="text-muted-foreground">
              <strong>Comprobante adicional:</strong> $2.000 COP
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">DESCUENTOS Y PROMOCIONES</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE ofrece descuentos especiales para clientes frecuentes y promociones temporales:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Cliente Frecuente:</strong> Después de 5 transferencias en un mes, reciba un 10% de descuento en las comisiones
            </li>
            <li className="text-muted-foreground">
              <strong>Programa de Referidos:</strong> Reciba un 15% de descuento en su próxima transferencia por cada nuevo cliente referido
            </li>
            <li className="text-muted-foreground">
              <strong>Promociones Estacionales:</strong> Consulte nuestro sitio web regularmente para conocer promociones especiales
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestras comisiones o para consultar casos especiales, por favor contáctenos a través del correo electrónico:{" "}
            <a href="mailto:comisiones@example.invalid" className="text-primary hover:underline">
              comisiones@example.invalid
            </a>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            description="Información financiera oficial actualizada"
            link={{
              text: "Ver más",
              href: "/legals/comisiones"
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Tabla de Comisiones - ES"
              description="Descargar PDF"
              href="/downloads/comisiones-es.pdf"
            />
            <DownloadCard
              title="Tabla de Comisiones - EN"
              description="Descargar PDF"
              href="/downloads/comisiones-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
