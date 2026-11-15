"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function GirosPuntosPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Puntos deco-exchange</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Integraciones", href: "/" },
            { label: "Puntos deco-exchange", href: "/giros-puntos", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            Puntos deco-exchange es el programa de fidelización de DECO EXCHANGE, diseñado para recompensar a nuestros clientes
            por su preferencia y uso continuo de nuestros servicios. A continuación, detallamos los términos y
            condiciones que rigen este programa.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">PUNTOS deco-exchange</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL PROGRAMA</h3>

          <p className="text-muted-foreground leading-relaxed">
            Puntos deco-exchange permite a los clientes de DECO EXCHANGE acumular puntos por cada transacción realizada, los
            cuales pueden ser canjeados posteriormente por diversos beneficios, descuentos y recompensas.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">2. ACUMULACIÓN DE PUNTOS</h3>

          <p className="text-muted-foreground leading-relaxed">Los puntos se acumulan de la siguiente manera:</p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Actividad</th>
                  <th className="py-4 px-4 text-left">Puntos</th>
                  <th className="py-4 px-4 text-left">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Envío de giro nacional</td>
                  <td className="py-4 px-4">1 punto por cada $10,000 COP</td>
                  <td className="py-4 px-4">Mínimo 1 punto por transacción</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Envío de giro internacional</td>
                  <td className="py-4 px-4">2 puntos por cada $10 USD</td>
                  <td className="py-4 px-4">Mínimo 2 puntos por transacción</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cambio de divisas</td>
                  <td className="py-4 px-4">1 punto por cada $50 USD</td>
                  <td className="py-4 px-4">O su equivalente en otras monedas</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Pago de servicios</td>
                  <td className="py-4 px-4">1 punto por cada $20,000 COP</td>
                  <td className="py-4 px-4">Mínimo 1 punto por transacción</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Recarga de celular</td>
                  <td className="py-4 px-4">1 punto por cada $10,000 COP</td>
                  <td className="py-4 px-4">Mínimo 1 punto por transacción</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Referir a un amigo</td>
                  <td className="py-4 px-4">50 puntos</td>
                  <td className="py-4 px-4">Cuando el referido realiza su primera transacción</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. NIVELES DE MEMBRESÍA</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Plata</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">0 - 999 puntos acumulados</li>
                <li className="text-muted-foreground">Acumulación estándar de puntos</li>
                <li className="text-muted-foreground">Validez de puntos: 12 meses</li>
                <li className="text-muted-foreground">Descuentos básicos</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Oro</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">1,000 - 4,999 puntos acumulados</li>
                <li className="text-muted-foreground">+10% en acumulación de puntos</li>
                <li className="text-muted-foreground">Validez de puntos: 18 meses</li>
                <li className="text-muted-foreground">Descuentos preferenciales</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Platino</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">5,000+ puntos acumulados</li>
                <li className="text-muted-foreground">+25% en acumulación de puntos</li>
                <li className="text-muted-foreground">Validez de puntos: 24 meses</li>
                <li className="text-muted-foreground">Descuentos exclusivos</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">4. CANJE DE PUNTOS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Los puntos acumulados pueden canjearse por los siguientes beneficios:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Descuentos en comisiones:</strong> Reducción en las tarifas de envío de giros y otras
              transacciones.
            </li>
            <li className="text-muted-foreground">
              <strong>Mejora en tasas de cambio:</strong> Acceso a tasas preferenciales para operaciones de cambio de
              divisas.
            </li>
            <li className="text-muted-foreground">
              <strong>Productos promocionales:</strong> Artículos de merchandising de DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              <strong>Tarjetas de regalo:</strong> Para establecimientos comerciales aliados.
            </li>
            <li className="text-muted-foreground">
              <strong>Donaciones a causas sociales:</strong> Posibilidad de donar puntos a programas de responsabilidad
              social.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">5. TABLA DE CANJES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Recompensa</th>
                  <th className="py-4 px-4 text-left">Puntos Requeridos</th>
                  <th className="py-4 px-4 text-left">Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Descuento 50% en comisión de giro</td>
                  <td className="py-4 px-4">200 puntos</td>
                  <td className="py-4 px-4">Todos los niveles</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Giro nacional gratuito (hasta $500,000 COP)</td>
                  <td className="py-4 px-4">500 puntos</td>
                  <td className="py-4 px-4">Todos los niveles</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Mejora de 0.5% en tasa de cambio</td>
                  <td className="py-4 px-4">300 puntos</td>
                  <td className="py-4 px-4">Niveles Oro y Platino</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Tarjeta de regalo $50,000 COP</td>
                  <td className="py-4 px-4">800 puntos</td>
                  <td className="py-4 px-4">Todos los niveles</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Giro internacional gratuito (hasta $100 USD)</td>
                  <td className="py-4 px-4">1,000 puntos</td>
                  <td className="py-4 px-4">Nivel Platino</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">6. TÉRMINOS GENERALES</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Elegibilidad:</strong> El programa está disponible para todos los clientes registrados de
              DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              <strong>Inscripción:</strong> La inscripción al programa es automática al registrarse como cliente.
            </li>
            <li className="text-muted-foreground">
              <strong>Validez de puntos:</strong> Los puntos tienen una validez según el nivel de membresía, contada a
              partir de la fecha de acumulación.
            </li>
            <li className="text-muted-foreground">
              <strong>Intransferibilidad:</strong> Los puntos son personales e intransferibles, excepto en casos
              específicos autorizados por DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              <strong>Modificaciones:</strong> DECO EXCHANGE se reserva el derecho de modificar los términos del
              programa, incluyendo la estructura de acumulación y canje de puntos, con previo aviso a los participantes.
            </li>
            <li className="text-muted-foreground">
              <strong>Cancelación:</strong> El programa puede ser cancelado por DECO EXCHANGE con un preaviso de 90
              días, durante los cuales los clientes podrán canjear sus puntos acumulados.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre Puntos deco-exchange o para consultar su saldo de puntos, por favor contáctenos a través
            del correo electrónico:{" "}
            <Link href="mailto:puntos@example.invalid" className="text-primary hover:underline">
              puntos@example.invalid
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
              title="Términos Puntos deco-exchange - ES"
              description="Descargar PDF"
              href="/downloads/giros-puntos-es.pdf"
            />

            <DownloadCard
              title="Términos Puntos deco-exchange - EN"
              description="Descargar PDF"
              href="/downloads/giros-puntos-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
