"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function ReferidosPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Referidos</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Programas", href: "/" },
            { label: "Referidos", href: "/legals/referidos", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            El Programa de Referidos de DECO EXCHANGE permite a nuestros usuarios ganar comisiones por invitar a nuevos
            clientes a utilizar nuestros servicios. Este programa está diseñado para recompensar a quienes confían en
            nosotros y nos recomiendan a sus amigos, familiares y contactos.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">POLÍTICAS DE REFERIDOS</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. FUNCIONAMIENTO DEL PROGRAMA</h3>

          <p className="text-muted-foreground leading-relaxed">
            El Programa de Referidos funciona de la siguiente manera:
          </p>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Obtención del enlace o código:</strong> Cada usuario recibe un enlace o código de referido único
                que puede compartir con sus contactos.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Invitación:</strong> El usuario comparte su enlace o código con potenciales nuevos clientes.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Registro:</strong> El nuevo cliente se registra utilizando el enlace o código de referido.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Validación:</strong> El sistema verifica que el nuevo cliente cumpla con los requisitos del
                programa.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Comisión:</strong> Una vez que el referido realiza su primera transacción calificada, el
                referente recibe la comisión correspondiente.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">2. ESTRUCTURA DE COMISIONES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Servicio</th>
                  <th className="py-4 px-4 text-left">Comisión por Primera Transacción</th>
                  <th className="py-4 px-4 text-left">Comisión Recurrente</th>
                  <th className="py-4 px-4 text-left">Período</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Giros Nacionales</td>
                  <td className="py-4 px-4">$10,000 COP</td>
                  <td className="py-4 px-4">5% de la comisión</td>
                  <td className="py-4 px-4">6 meses</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Giros Internacionales</td>
                  <td className="py-4 px-4">$5 USD</td>
                  <td className="py-4 px-4">10% de la comisión</td>
                  <td className="py-4 px-4">6 meses</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cambio de Divisas</td>
                  <td className="py-4 px-4">$3 USD</td>
                  <td className="py-4 px-4">5% del margen</td>
                  <td className="py-4 px-4">6 meses</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cuenta Trader</td>
                  <td className="py-4 px-4">$20 USD</td>
                  <td className="py-4 px-4">15% de las comisiones</td>
                  <td className="py-4 px-4">12 meses</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Servicios Corporativos</td>
                  <td className="py-4 px-4">$50 USD</td>
                  <td className="py-4 px-4">10% de las comisiones</td>
                  <td className="py-4 px-4">12 meses</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. NIVELES DEL PROGRAMA</h3>

          <p className="text-muted-foreground leading-relaxed">
            El Programa de Referidos cuenta con diferentes niveles según el número de referidos activos:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Básico</h4>
              <p className="text-sm text-muted-foreground mb-2">1-5 referidos activos</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Comisiones estándar</li>
                <li className="text-muted-foreground">Pago mensual</li>
                <li className="text-muted-foreground">Materiales promocionales básicos</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Avanzado</h4>
              <p className="text-sm text-muted-foreground mb-2">6-20 referidos activos</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">+10% en todas las comisiones</li>
                <li className="text-muted-foreground">Pago quincenal</li>
                <li className="text-muted-foreground">Materiales promocionales personalizados</li>
                <li className="text-muted-foreground">Soporte prioritario</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Experto</h4>
              <p className="text-sm text-muted-foreground mb-2">21+ referidos activos</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">+25% en todas las comisiones</li>
                <li className="text-muted-foreground">Pago semanal disponible</li>
                <li className="text-muted-foreground">Dashboard de análisis avanzado</li>
                <li className="text-muted-foreground">Gestor de cuenta personal</li>
                <li className="text-muted-foreground">Eventos exclusivos</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">4. REQUISITOS Y ELEGIBILIDAD</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para participar en el Programa de Referidos, los usuarios deben cumplir con los siguientes requisitos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Cuenta verificada:</strong> Tener una cuenta en DECO EXCHANGE con verificación KYC completa.
            </li>
            <li className="text-muted-foreground">
              <strong>Usuario activo:</strong> Haber realizado al menos 3 transacciones en los últimos 3 meses.
            </li>
            <li className="text-muted-foreground">
              <strong>Buen historial:</strong> No tener infracciones de los términos y condiciones de la plataforma.
            </li>
            <li className="text-muted-foreground">
              <strong>Aceptación de términos:</strong> Aceptar los términos específicos del Programa de Referidos.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">5. DEFINICIÓN DE REFERIDO VÁLIDO</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para que un referido se considere válido y genere comisiones, debe cumplir con los siguientes criterios:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Nuevo usuario:</strong> No haber tenido una cuenta previa en DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              <strong>Registro completo:</strong> Completar el proceso de registro utilizando el enlace o código de
              referido.
            </li>
            <li className="text-muted-foreground">
              <strong>Verificación KYC:</strong> Completar satisfactoriamente el proceso de verificación de identidad.
            </li>
            <li className="text-muted-foreground">
              <strong>Transacción calificada:</strong> Realizar al menos una transacción que cumpla con los requisitos
              mínimos (varía según el servicio).
            </li>
            <li className="text-muted-foreground">
              <strong>No vinculación:</strong> No tener vinculación familiar o empresarial directa con el referente
              (sujeto a verificación).
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">6. PAGOS Y RETIROS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Las comisiones generadas por el Programa de Referidos se gestionan de la siguiente manera:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Acumulación:</strong> Las comisiones se acumulan en la cuenta de referidos del usuario.
            </li>
            <li className="text-muted-foreground">
              <strong>Monto mínimo:</strong> El monto mínimo para solicitar un retiro es de $20 USD o su equivalente.
            </li>
            <li className="text-muted-foreground">
              <strong>Métodos de pago:</strong> Las comisiones pueden transferirse a la cuenta principal del usuario,
              retirarse a una cuenta bancaria o convertirse a criptomonedas.
            </li>
            <li className="text-muted-foreground">
              <strong>Frecuencia:</strong> La frecuencia de pago depende del nivel en el programa (mensual, quincenal o
              semanal).
            </li>
            <li className="text-muted-foreground">
              <strong>Impuestos:</strong> El usuario es responsable de declarar y pagar los impuestos correspondientes
              según su jurisdicción.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">7. RESTRICCIONES Y POLÍTICAS</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Auto-referidos:</strong> No está permitido referirse a uno mismo utilizando diferentes cuentas.
            </li>
            <li className="text-muted-foreground">
              <strong>Publicidad engañosa:</strong> Está prohibido utilizar información falsa o engañosa para atraer
              referidos.
            </li>
            <li className="text-muted-foreground">
              <strong>Spam:</strong> No se permite el envío masivo de mensajes no solicitados (spam) para promocionar el
              enlace de referido.
            </li>
            <li className="text-muted-foreground">
              <strong>Contenido inapropiado:</strong> No se debe asociar la marca DECO EXCHANGE con contenido ilegal,
              ofensivo o inapropiado.
            </li>
            <li className="text-muted-foreground">
              <strong>Manipulación:</strong> Cualquier intento de manipular el sistema de referidos resultará en la
              expulsión del programa y posible cierre de cuenta.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestro Programa de Referidos o para resolver dudas específicas, por favor
            contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:referidos@deco-exchange.com" className="text-primary hover:underline">
              referidos@deco-exchange.com
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            description="Programa de Referidos de DECO EXCHANGE"
            link={{
              text: "Ver más detalles",
              href: "/legals/referidos"
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Guía de Referidos - ES"
              description="Descargar PDF"
              href="/downloads/referidos-es.pdf"
            />

            <DownloadCard
              title="Material Promocional"
              description="Descargar ZIP"
              href="/downloads/material-referidos.zip"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
