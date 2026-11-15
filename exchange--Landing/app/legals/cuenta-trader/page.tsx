"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function CuentaTraderPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Cuenta Trader</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Integraciones", href: "/" },
            { label: "Cuenta Trader", href: "/cuenta-trader", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            La Cuenta Trader de DECO EXCHANGE es una solución especializada para operadores de divisas, criptomonedas y
            otros activos financieros, diseñada para ofrecer condiciones óptimas de trading y acceso a múltiples
            mercados. A continuación, detallamos los términos y condiciones que rigen este servicio.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS Y CONDICIONES</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL SERVICIO</h3>

          <p className="text-muted-foreground leading-relaxed">
            La Cuenta Trader ofrece las siguientes funcionalidades principales:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Trading de divisas:</strong> Acceso a más de 100 pares de divisas con spreads competitivos.
            </li>
            <li className="text-muted-foreground">
              <strong>Trading de criptomonedas:</strong> Operaciones con las principales criptomonedas y tokens.
            </li>
            <li className="text-muted-foreground">
              <strong>Plataforma avanzada:</strong> Herramientas de análisis técnico, gráficos en tiempo real y
              ejecución rápida.
            </li>
            <li className="text-muted-foreground">
              <strong>API de trading:</strong> Integración con sistemas automatizados y algoritmos de trading.
            </li>
            <li className="text-muted-foreground">
              <strong>Reportes detallados:</strong> Análisis de rendimiento, historial de operaciones y estadísticas.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">2. TIPOS DE CUENTAS</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Cuenta Standard</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Depósito mínimo: $500 USD</li>
                <li className="text-muted-foreground">Spread desde 1.8 pips</li>
                <li className="text-muted-foreground">Apalancamiento hasta 1:100</li>
                <li className="text-muted-foreground">Ejecución de mercado</li>
                <li className="text-muted-foreground">Soporte estándar</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Cuenta Premium</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Depósito mínimo: $5,000 USD</li>
                <li className="text-muted-foreground">Spread desde 0.8 pips</li>
                <li className="text-muted-foreground">Apalancamiento hasta 1:200</li>
                <li className="text-muted-foreground">Ejecución ECN</li>
                <li className="text-muted-foreground">Soporte prioritario</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Cuenta VIP</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Depósito mínimo: $25,000 USD</li>
                <li className="text-muted-foreground">Spread desde 0.3 pips</li>
                <li className="text-muted-foreground">Apalancamiento personalizado</li>
                <li className="text-muted-foreground">Ejecución DMA</li>
                <li className="text-muted-foreground">Gestor de cuenta dedicado</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. REQUISITOS DE ELEGIBILIDAD</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para acceder a la Cuenta Trader, los clientes deben cumplir con los siguientes requisitos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Edad mínima:</strong> Ser mayor de 18 años.
            </li>
            <li className="text-muted-foreground">
              <strong>Documentación:</strong> Proporcionar documentos de identidad y comprobante de domicilio válidos.
            </li>
            <li className="text-muted-foreground">
              <strong>Verificación KYC:</strong> Completar satisfactoriamente el proceso de conocimiento del cliente.
            </li>
            <li className="text-muted-foreground">
              <strong>Evaluación de idoneidad:</strong> Para ciertas jurisdicciones, completar un cuestionario de
              idoneidad.
            </li>
            <li className="text-muted-foreground">
              <strong>Depósito mínimo:</strong> Realizar el depósito mínimo requerido según el tipo de cuenta.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">4. RIESGOS Y ADVERTENCIAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            El trading de divisas, criptomonedas y otros instrumentos financieros conlleva riesgos significativos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Riesgo de mercado:</strong> Los precios de los activos pueden fluctuar rápidamente, lo que puede
              resultar en pérdidas.
            </li>
            <li className="text-muted-foreground">
              <strong>Riesgo de apalancamiento:</strong> El apalancamiento puede magnificar tanto las ganancias como las
              pérdidas.
            </li>
            <li className="text-muted-foreground">
              <strong>Riesgo de liquidez:</strong> Algunos activos pueden experimentar baja liquidez en ciertos
              momentos.
            </li>
            <li className="text-muted-foreground">
              <strong>Riesgo tecnológico:</strong> Posibilidad de fallos técnicos o interrupciones en la plataforma.
            </li>
            <li className="text-muted-foreground">
              <strong>Riesgo regulatorio:</strong> Cambios en las regulaciones pueden afectar la disponibilidad de
              ciertos instrumentos.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">5. COMISIONES Y CARGOS</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Concepto</th>
                  <th className="py-4 px-4 text-left">Cuenta Standard</th>
                  <th className="py-4 px-4 text-left">Cuenta Premium</th>
                  <th className="py-4 px-4 text-left">Cuenta VIP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Comisión por operación (Forex)</td>
                  <td className="py-4 px-4">Incluido en el spread</td>
                  <td className="py-4 px-4">$5 por lote</td>
                  <td className="py-4 px-4">$3 por lote</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Comisión por operación (Cripto)</td>
                  <td className="py-4 px-4">0.2%</td>
                  <td className="py-4 px-4">0.15%</td>
                  <td className="py-4 px-4">0.1%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Swap/Rollover</td>
                  <td className="py-4 px-4">Tasas de mercado + 2%</td>
                  <td className="py-4 px-4">Tasas de mercado + 1%</td>
                  <td className="py-4 px-4">Tasas de mercado</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Inactividad (después de 3 meses)</td>
                  <td className="py-4 px-4">$10 mensuales</td>
                  <td className="py-4 px-4">$20 mensuales</td>
                  <td className="py-4 px-4">Sin cargo</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Retiro de fondos</td>
                  <td className="py-4 px-4">$15 o 1% (el mayor)</td>
                  <td className="py-4 px-4">$10 o 0.5% (el mayor)</td>
                  <td className="py-4 px-4">Sin cargo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">6. RESPONSABILIDADES DEL CLIENTE</h3>

          <p className="text-muted-foreground leading-relaxed">
            Al utilizar la Cuenta Trader, el cliente acepta las siguientes responsabilidades:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              Operar de manera responsable y no invertir fondos que no pueda permitirse perder.
            </li>
            <li className="text-muted-foreground">
              Mantener la confidencialidad de sus credenciales de acceso y proteger su cuenta.
            </li>
            <li className="text-muted-foreground">
              Revisar regularmente los estados de cuenta y notificar cualquier discrepancia.
            </li>
            <li className="text-muted-foreground">
              Cumplir con todas las leyes y regulaciones aplicables en su jurisdicción.
            </li>
            <li className="text-muted-foreground">No utilizar estrategias de trading abusivas o manipulativas.</li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre la Cuenta Trader o para abrir una cuenta, por favor contáctenos a través del
            correo electrónico:{" "}
            <Link href="mailto:trading@deco-exchange.com" className="text-primary hover:underline">
              trading@deco-exchange.com
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Integraciones"
            company="DECO EXCHANGE"
            companyInfo="Sin licencia operativa"
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Términos Cuenta Trader - ES"
              description="Descargar PDF"
              href="/downloads/cuenta-trader-es.pdf"
            />

            <DownloadCard
              title="Términos Cuenta Trader - EN"
              description="Descargar PDF"
              href="/downloads/cuenta-trader-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
