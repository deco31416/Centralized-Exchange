"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function TarjetasPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Tarjetas</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Tarjetas", href: "/legals/tarjetas", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE ofrece soluciones de tarjetas de débito y crédito para facilitar el acceso a fondos y
            servicios financieros. A continuación, detallamos nuestras políticas relacionadas con tarjetas de crédito y
            débito.
          </p>

          <div className="my-8 rounded-xl border border-white/15 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6c02]">Catálogo de producto</p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Esta página documenta reglas y condiciones. La experiencia comercial de tarjetas, disponibilidad general
              y productos soportados vive en el catálogo de métodos de pago.
            </p>
            <Link
              href="/assets/payment-methods/cards"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#ff6c02] px-5 text-sm font-bold text-white transition-colors hover:bg-[#ff6c02]/90"
            >
              Ver tarjetas en Deco
            </Link>
          </div>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">POLÍTICAS DE TARJETAS DE CRÉDITO Y DÉBITO</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">TIPOS DE TARJETAS DISPONIBLES</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Tarjeta Débito Internacional</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Acceso a fondos en múltiples monedas</li>
                <li className="text-muted-foreground">Sin comisión por retiros en cajeros de la red</li>
                <li className="text-muted-foreground">Tecnología contactless</li>
                <li className="text-muted-foreground">Protección contra fraudes</li>
                <li className="text-muted-foreground">Cuota anual: $30.000 COP</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Tarjeta Crédito NorteCard</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Aceptada internacionalmente</li>
                <li className="text-muted-foreground">Programa de puntos y recompensas</li>
                <li className="text-muted-foreground">Seguro de viaje incluido</li>
                <li className="text-muted-foreground">Tasa de interés preferencial</li>
                <li className="text-muted-foreground">Cuota anual: $80.000 COP</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">REQUISITOS PARA SOLICITAR UNA TARJETA</h3>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Documentación de identidad:</strong> Documento de identidad válido (cédula, pasaporte o
                documento de extranjería).
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Comprobante de domicilio:</strong> Recibo de servicios públicos reciente (no mayor a 3 meses).
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Comprobante de ingresos:</strong> Para tarjetas de crédito, se requiere comprobante de ingresos
                o declaración de renta.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Historial crediticio:</strong> Para tarjetas de crédito, se evaluará el historial crediticio del
                solicitante.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">COMISIONES Y CARGOS</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Concepto</th>
                  <th className="py-4 px-4 text-left">Tarjeta Débito</th>
                  <th className="py-4 px-4 text-left">Tarjeta Crédito</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Emisión</td>
                  <td className="py-4 px-4">Sin costo</td>
                  <td className="py-4 px-4">Sin costo</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cuota anual</td>
                  <td className="py-4 px-4">$30.000 COP</td>
                  <td className="py-4 px-4">$80.000 COP</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Reposición</td>
                  <td className="py-4 px-4">$20.000 COP</td>
                  <td className="py-4 px-4">$25.000 COP</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Retiro cajero propio</td>
                  <td className="py-4 px-4">Sin costo</td>
                  <td className="py-4 px-4">4% (mín. $10.000 COP)</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Retiro cajero otra red</td>
                  <td className="py-4 px-4">$5.000 COP</td>
                  <td className="py-4 px-4">5% (mín. $15.000 COP)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Consulta de saldo</td>
                  <td className="py-4 px-4">Sin costo</td>
                  <td className="py-4 px-4">Sin costo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">SEGURIDAD Y PROTECCIÓN</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Chip EMV:</strong> Todas nuestras tarjetas cuentan con tecnología de chip EMV para mayor
              seguridad.
            </li>
            <li className="text-muted-foreground">
              <strong>Autenticación 3D Secure:</strong> Protección adicional para compras en línea.
            </li>
            <li className="text-muted-foreground">
              <strong>Alertas de transacciones:</strong> Reciba notificaciones en tiempo real de todas las
              transacciones.
            </li>
            <li className="text-muted-foreground">
              <strong>Bloqueo temporal:</strong> Posibilidad de bloquear temporalmente la tarjeta desde la aplicación
              móvil.
            </li>
            <li className="text-muted-foreground">
              <strong>Seguro contra fraudes:</strong> Protección contra transacciones no autorizadas.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestras tarjetas o para solicitar una, por favor contáctenos a través del correo
            electrónico:{" "}
            <Link href="mailto:tarjetas@example.invalid" className="text-primary hover:underline">
              tarjetas@example.invalid
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
              title="Términos de Tarjetas - ES"
              description="Descargar PDF"
              href="/downloads/tarjetas-es.pdf"
            />

            <DownloadCard
              title="Términos de Tarjetas - EN"
              description="Descargar PDF"
              href="/downloads/tarjetas-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
