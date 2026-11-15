"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function WhiteLabelPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">White Label</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Integraciones", href: "/" },
            { label: "White Label", href: "/white-label", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            El programa White Label de DECO EXCHANGE permite a empresas y emprendedores ofrecer servicios de giros,
            cambio de divisas y pagos bajo su propia marca, aprovechando nuestra infraestructura tecnológica y red de
            corresponsales. A continuación, detallamos los términos y condiciones que rigen este servicio.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">CORRESPONSALES</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL SERVICIO</h3>

          <p className="text-muted-foreground leading-relaxed">
            El programa White Label ofrece las siguientes funcionalidades principales:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Plataforma personalizable:</strong> Sistema de giros y pagos adaptado a la imagen corporativa del
              corresponsal.
            </li>
            <li className="text-muted-foreground">
              <strong>Infraestructura tecnológica:</strong> Acceso a nuestra plataforma robusta y segura para
              procesamiento de transacciones.
            </li>
            <li className="text-muted-foreground">
              <strong>Red de liquidez:</strong> Conexión con nuestra red global para facilitar pagos y cobros
              internacionales.
            </li>
            <li className="text-muted-foreground">
              <strong>Soporte operativo:</strong> Asistencia técnica y operativa para garantizar el funcionamiento
              continuo.
            </li>
            <li className="text-muted-foreground">
              <strong>Cumplimiento regulatorio:</strong> Apoyo en procesos de KYC/AML y otros requisitos normativos.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">2. MODELOS DE CORRESPONSALÍA</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Corresponsal Básico</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Acceso a plataforma web</li>
                <li className="text-muted-foreground">Personalización básica</li>
                <li className="text-muted-foreground">Soporte por correo electrónico</li>
                <li className="text-muted-foreground">Comisión compartida: 30%</li>
                <li className="text-muted-foreground">Inversión inicial: $1,000 USD</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Corresponsal Premium</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Plataforma web + móvil</li>
                <li className="text-muted-foreground">Personalización avanzada</li>
                <li className="text-muted-foreground">Soporte telefónico</li>
                <li className="text-muted-foreground">Comisión compartida: 40%</li>
                <li className="text-muted-foreground">Inversión inicial: $5,000 USD</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Corresponsal Empresarial</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Plataforma completa + API</li>
                <li className="text-muted-foreground">Personalización total</li>
                <li className="text-muted-foreground">Gerente de cuenta dedicado</li>
                <li className="text-muted-foreground">Comisión compartida: 50%</li>
                <li className="text-muted-foreground">Inversión inicial: $10,000 USD</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. REQUISITOS PARA CORRESPONSALES</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para convertirse en corresponsal de DECO EXCHANGE, se deben cumplir los siguientes requisitos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Persona jurídica:</strong> Estar legalmente constituido y registrado en su jurisdicción.
            </li>
            <li className="text-muted-foreground">
              <strong>Documentación legal:</strong> Proporcionar documentos de constitución, identificación de
              representantes y certificados de existencia.
            </li>
            <li className="text-muted-foreground">
              <strong>Verificación KYC/AML:</strong> Completar satisfactoriamente el proceso de conocimiento del cliente
              y prevención de lavado de activos.
            </li>
            <li className="text-muted-foreground">
              <strong>Solvencia financiera:</strong> Demostrar capacidad financiera acorde al modelo de corresponsalía
              seleccionado.
            </li>
            <li className="text-muted-foreground">
              <strong>Infraestructura mínima:</strong> Contar con equipos, conexión a internet y espacio físico adecuado
              (si aplica).
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">4. SERVICIOS DISPONIBLES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Servicio</th>
                  <th className="py-4 px-4 text-left">Básico</th>
                  <th className="py-4 px-4 text-left">Premium</th>
                  <th className="py-4 px-4 text-left">Empresarial</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Giros nacionales</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Giros internacionales</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cambio de divisas</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Pago de servicios</td>
                  <td className="py-4 px-4">Limitado</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Recargas de celular</td>
                  <td className="py-4 px-4">Limitado</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Criptomonedas</td>
                  <td className="py-4 px-4">✗</td>
                  <td className="py-4 px-4">Limitado</td>
                  <td className="py-4 px-4">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">API para integración</td>
                  <td className="py-4 px-4">✗</td>
                  <td className="py-4 px-4">✗</td>
                  <td className="py-4 px-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">5. RESPONSABILIDADES DEL CORRESPONSAL</h3>

          <p className="text-muted-foreground leading-relaxed">
            Al convertirse en corresponsal de DECO EXCHANGE, se asumen las siguientes responsabilidades:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Cumplimiento normativo:</strong> Adherirse a todas las leyes y regulaciones aplicables en su
              jurisdicción.
            </li>
            <li className="text-muted-foreground">
              <strong>Verificación de clientes:</strong> Implementar procedimientos adecuados de KYC para los usuarios
              finales.
            </li>
            <li className="text-muted-foreground">
              <strong>Seguridad de la información:</strong> Proteger los datos de los clientes y las credenciales de
              acceso al sistema.
            </li>
            <li className="text-muted-foreground">
              <strong>Manejo de fondos:</strong> Administrar responsablemente los fondos recibidos de los clientes.
            </li>
            <li className="text-muted-foreground">
              <strong>Imagen corporativa:</strong> Mantener estándares profesionales en la representación de la marca.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">6. SOPORTE Y CAPACITACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">DECO EXCHANGE proporciona a sus corresponsales:</p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Capacitación inicial:</strong> Entrenamiento completo sobre el uso de la plataforma y
              procedimientos operativos.
            </li>
            <li className="text-muted-foreground">
              <strong>Soporte técnico:</strong> Asistencia para resolver problemas técnicos según el nivel de
              corresponsalía.
            </li>
            <li className="text-muted-foreground">
              <strong>Actualizaciones:</strong> Mejoras continuas de la plataforma y nuevas funcionalidades.
            </li>
            <li className="text-muted-foreground">
              <strong>Material de marketing:</strong> Recursos promocionales adaptables a la marca del corresponsal.
            </li>
            <li className="text-muted-foreground">
              <strong>Asesoría regulatoria:</strong> Orientación sobre requisitos normativos y mejores prácticas.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestro programa White Label o para solicitar convertirse en corresponsal, por
            favor contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:corresponsales@example.invalid" className="text-primary hover:underline">
              corresponsales@example.invalid
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
              title="Manual de Corresponsales - ES"
              description="Descargar PDF"
              href="/downloads/corresponsales-es.pdf"
            />

            <DownloadCard
              title="Manual de Corresponsales - EN"
              description="Descargar PDF"
              href="/downloads/corresponsales-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
