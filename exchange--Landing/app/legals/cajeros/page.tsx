"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function CajerosPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Cajeros</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Cajeros", href: "/cajeros", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE cuenta con una amplia red de cajeros automáticos para facilitar el acceso a efectivo y
            servicios financieros. A continuación, detallamos nuestras políticas relacionadas con el uso de cajeros
            automáticos.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">POLÍTICAS DE CAJEROS AUTOMÁTICOS</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">RED DE CAJEROS</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE cuenta con una red de cajeros automáticos ubicados estratégicamente en las principales
            ciudades de Colombia, con planes de expansión a otros países de la región. Nuestros cajeros están
            disponibles las 24 horas del día, los 7 días de la semana.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">SERVICIOS DISPONIBLES</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Servicios Básicos</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Retiro de efectivo</li>
                <li className="text-muted-foreground">Consulta de saldo</li>
                <li className="text-muted-foreground">Cambio de PIN</li>
                <li className="text-muted-foreground">Transferencias entre cuentas propias</li>
                <li className="text-muted-foreground">Impresión de comprobantes</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Servicios Avanzados</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Depósito de efectivo</li>
                <li className="text-muted-foreground">Pago de servicios</li>
                <li className="text-muted-foreground">Recarga de celulares</li>
                <li className="text-muted-foreground">Transferencias a terceros</li>
                <li className="text-muted-foreground">Retiro sin tarjeta (código QR)</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">LÍMITES DE RETIRO</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Tipo de Cuenta</th>
                  <th className="py-4 px-4 text-left">Límite Diario</th>
                  <th className="py-4 px-4 text-left">Límite por Transacción</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cuenta Básica</td>
                  <td className="py-4 px-4">$1.000.000 COP</td>
                  <td className="py-4 px-4">$500.000 COP</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cuenta Premium</td>
                  <td className="py-4 px-4">$3.000.000 COP</td>
                  <td className="py-4 px-4">$1.000.000 COP</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cuenta Empresarial</td>
                  <td className="py-4 px-4">$5.000.000 COP</td>
                  <td className="py-4 px-4">$2.000.000 COP</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Tarjeta de Crédito</td>
                  <td className="py-4 px-4">50% del cupo disponible</td>
                  <td className="py-4 px-4">$1.000.000 COP</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground mt-4 leading-relaxed">
            Nota: Los límites pueden ser ajustados temporalmente a través de nuestra aplicación móvil o contactando a
            nuestro servicio al cliente.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">COMISIONES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Servicio</th>
                  <th className="py-4 px-4 text-left">Cajeros Propios</th>
                  <th className="py-4 px-4 text-left">Cajeros de Otras Redes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Retiro de efectivo</td>
                  <td className="py-4 px-4">Sin costo</td>
                  <td className="py-4 px-4">$5.000 COP</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Consulta de saldo</td>
                  <td className="py-4 px-4">Sin costo</td>
                  <td className="py-4 px-4">$2.000 COP</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Transferencias</td>
                  <td className="py-4 px-4">Sin costo</td>
                  <td className="py-4 px-4">$3.000 COP</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Pago de servicios</td>
                  <td className="py-4 px-4">$1.000 COP</td>
                  <td className="py-4 px-4">No disponible</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">SEGURIDAD EN CAJEROS</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Cámaras de seguridad:</strong> Todos nuestros cajeros cuentan con cámaras de vigilancia las 24
              horas.
            </li>
            <li className="text-muted-foreground">
              <strong>Tecnología anti-skimming:</strong> Protección contra dispositivos de clonación de tarjetas.
            </li>
            <li className="text-muted-foreground">
              <strong>Teclado encriptado:</strong> Para proteger la entrada del PIN.
            </li>
            <li className="text-muted-foreground">
              <strong>Autenticación biométrica:</strong> Algunos cajeros cuentan con reconocimiento de huella digital.
            </li>
            <li className="text-muted-foreground">
              <strong>Monitoreo en tiempo real:</strong> Sistema de detección de actividades sospechosas.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">RECOMENDACIONES DE SEGURIDAD</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">Cubra el teclado al ingresar su PIN.</li>
            <li className="text-muted-foreground">Verifique que no haya dispositivos extraños en el cajero.</li>
            <li className="text-muted-foreground">No acepte ayuda de extraños al utilizar el cajero.</li>
            <li className="text-muted-foreground">Guarde su dinero antes de salir del área del cajero.</li>
            <li className="text-muted-foreground">Reporte inmediatamente la pérdida o robo de su tarjeta.</li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para reportar incidentes, problemas con cajeros o para más información, por favor contáctenos a través del
            correo electrónico:{" "}
            <Link href="mailto:cajeros@deco-exchange.com" className="text-primary hover:underline">
              cajeros@deco-exchange.com
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            description="Políticas sobre el uso de cajeros deco-exchange"
            link={{
              text: "Ver más detalles",
              href: "/legals/cajeros"
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Ubicación de Cajeros - ES"
              description="Descargar PDF"
              href="/downloads/cajeros-es.pdf"
            />

            <DownloadCard
              title="Ubicación de Cajeros - EN"
              description="Descargar PDF"
              href="/downloads/cajeros-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
