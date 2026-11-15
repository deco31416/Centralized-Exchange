"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function CuentaADTPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Cuenta ADT</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Integraciones", href: "/" },
            { label: "Cuenta ADT", href: "/cuenta-adt", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            La Cuenta ADT (Administración Digital de Tesorería) de DECO EXCHANGE es una solución integral para la
            gestión de tesorería corporativa, diseñada para optimizar la administración de flujos de efectivo, pagos y
            cobros. A continuación, detallamos los términos y condiciones que rigen este servicio.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS Y CONDICIONES</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL SERVICIO</h3>

          <p className="text-muted-foreground leading-relaxed">
            La Cuenta ADT ofrece las siguientes funcionalidades principales:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Gestión centralizada de cuentas:</strong> Administración unificada de múltiples cuentas bancarias
              nacionales e internacionales.
            </li>
            <li className="text-muted-foreground">
              <strong>Automatización de pagos:</strong> Programación y ejecución automática de pagos recurrentes y por
              lotes.
            </li>
            <li className="text-muted-foreground">
              <strong>Conciliación bancaria:</strong> Herramientas para la conciliación automática de movimientos
              bancarios.
            </li>
            <li className="text-muted-foreground">
              <strong>Gestión de liquidez:</strong> Optimización de la posición de liquidez y previsión de flujos de
              caja.
            </li>
            <li className="text-muted-foreground">
              <strong>Reportes personalizados:</strong> Generación de informes financieros adaptados a las necesidades
              del cliente.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">2. PLANES DISPONIBLES</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Plan Básico</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Hasta 5 cuentas bancarias</li>
                <li className="text-muted-foreground">100 transacciones mensuales</li>
                <li className="text-muted-foreground">Reportes estándar</li>
                <li className="text-muted-foreground">Soporte por correo electrónico</li>
                <li className="text-muted-foreground">$100 USD mensuales</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Plan Profesional</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Hasta 20 cuentas bancarias</li>
                <li className="text-muted-foreground">500 transacciones mensuales</li>
                <li className="text-muted-foreground">Reportes personalizados</li>
                <li className="text-muted-foreground">Soporte telefónico</li>
                <li className="text-muted-foreground">$300 USD mensuales</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Plan Empresarial</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Cuentas bancarias ilimitadas</li>
                <li className="text-muted-foreground">Transacciones ilimitadas</li>
                <li className="text-muted-foreground">Reportes avanzados y API</li>
                <li className="text-muted-foreground">Gerente de cuenta dedicado</li>
                <li className="text-muted-foreground">$800 USD mensuales</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. REQUISITOS DE ELEGIBILIDAD</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para acceder a la Cuenta ADT, los clientes deben cumplir con los siguientes requisitos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Persona jurídica:</strong> Estar legalmente constituida y registrada en su jurisdicción.
            </li>
            <li className="text-muted-foreground">
              <strong>Documentación:</strong> Proporcionar todos los documentos legales y financieros requeridos.
            </li>
            <li className="text-muted-foreground">
              <strong>Verificación KYC/AML:</strong> Completar satisfactoriamente el proceso de conocimiento del cliente
              y prevención de lavado de activos.
            </li>
            <li className="text-muted-foreground">
              <strong>Contrato de servicio:</strong> Firmar el contrato de prestación de servicios correspondiente.
            </li>
            <li className="text-muted-foreground">
              <strong>Capacitación:</strong> Designar al menos un administrador que complete la capacitación básica del
              sistema.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">4. SEGURIDAD Y ACCESO</h3>

          <p className="text-muted-foreground leading-relaxed">
            La Cuenta ADT implementa las siguientes medidas de seguridad:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Autenticación multifactor:</strong> Obligatoria para todos los usuarios del sistema.
            </li>
            <li className="text-muted-foreground">
              <strong>Encriptación de datos:</strong> Toda la información se transmite y almacena encriptada.
            </li>
            <li className="text-muted-foreground">
              <strong>Perfiles de usuario:</strong> Diferentes niveles de acceso y autorización configurables.
            </li>
            <li className="text-muted-foreground">
              <strong>Aprobaciones múltiples:</strong> Posibilidad de configurar flujos de aprobación para
              transacciones.
            </li>
            <li className="text-muted-foreground">
              <strong>Registro de actividad:</strong> Trazabilidad completa de todas las acciones realizadas en el
              sistema.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">5. TARIFAS ADICIONALES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Servicio</th>
                  <th className="py-4 px-4 text-left">Tarifa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Transacciones internacionales</td>
                  <td className="py-4 px-4">$15 USD por transacción</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Transacciones excedentes</td>
                  <td className="py-4 px-4">$0.50 USD por transacción</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Usuarios adicionales</td>
                  <td className="py-4 px-4">$20 USD mensuales por usuario</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Implementación personalizada</td>
                  <td className="py-4 px-4">Desde $500 USD (único pago)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Capacitación adicional</td>
                  <td className="py-4 px-4">$100 USD por sesión</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">6. RESPONSABILIDADES DEL CLIENTE</h3>

          <p className="text-muted-foreground leading-relaxed">
            Al utilizar la Cuenta ADT, el cliente acepta las siguientes responsabilidades:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              Mantener la confidencialidad de las credenciales de acceso y no compartirlas con terceros no autorizados.
            </li>
            <li className="text-muted-foreground">
              Verificar la exactitud de la información ingresada en el sistema antes de confirmar transacciones.
            </li>
            <li className="text-muted-foreground">
              Notificar inmediatamente a DECO EXCHANGE de cualquier acceso no autorizado o actividad sospechosa.
            </li>
            <li className="text-muted-foreground">
              Mantener actualizada la información de contacto y autorización de los usuarios del sistema.
            </li>
            <li className="text-muted-foreground">
              Cumplir con todas las leyes y regulaciones aplicables relacionadas con transacciones financieras.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">7. SOPORTE TÉCNICO</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE ofrece los siguientes canales de soporte para usuarios de la Cuenta ADT:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Soporte por correo electrónico:</strong> Disponible 24/7 para todos los planes.
            </li>
            <li className="text-muted-foreground">
              <strong>Soporte telefónico:</strong> Disponible en horario laboral para planes Profesional y Empresarial.
            </li>
            <li className="text-muted-foreground">
              <strong>Gerente de cuenta:</strong> Disponible para el plan Empresarial.
            </li>
            <li className="text-muted-foreground">
              <strong>Base de conocimientos:</strong> Acceso a documentación, tutoriales y preguntas frecuentes.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre la Cuenta ADT o para solicitar una demostración, por favor contáctenos a través
            del correo electrónico:{" "}
            <Link href="mailto:adt@example.invalid" className="text-primary hover:underline">
              adt@example.invalid
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
              title="Términos Cuenta ADT - ES"
              description="Descargar PDF"
              href="/downloads/cuenta-adt-es.pdf"
            />

            <DownloadCard
              title="Términos Cuenta ADT - EN"
              description="Descargar PDF"
              href="/downloads/cuenta-adt-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
