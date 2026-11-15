"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function WidgetsPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Widgets</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Integraciones", href: "/" },
            { label: "Widgets", href: "/widgets", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            Los Widgets de DECO EXCHANGE son herramientas interactivas que pueden integrarse fácilmente en sitios web y
            aplicaciones de terceros, permitiendo a los usuarios acceder a nuestros servicios sin salir de la plataforma
            anfitriona. A continuación, detallamos las políticas y condiciones que rigen el uso de estos widgets.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">POLÍTICAS DE WIDGETS</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. TIPOS DE WIDGETS DISPONIBLES</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Widgets Informativos</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Calculadora de tasas de cambio</li>
                <li className="text-muted-foreground">Indicador de tasas en tiempo real</li>
                <li className="text-muted-foreground">Localizador de puntos de servicio</li>
                <li className="text-muted-foreground">Estimador de comisiones</li>
                <li className="text-muted-foreground">Gráficos históricos de divisas</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Widgets Transaccionales</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Formulario de envío de giros</li>
                <li className="text-muted-foreground">Convertidor de divisas</li>
                <li className="text-muted-foreground">Pago de servicios</li>
                <li className="text-muted-foreground">Recarga de celulares</li>
                <li className="text-muted-foreground">Seguimiento de transacciones</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">2. REQUISITOS TÉCNICOS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para implementar los widgets de DECO EXCHANGE, se deben cumplir los siguientes requisitos técnicos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Compatibilidad:</strong> El sitio web o aplicación debe ser compatible con JavaScript moderno.
            </li>
            <li className="text-muted-foreground">
              <strong>Conexión segura:</strong> El sitio debe utilizar HTTPS para garantizar la seguridad de las
              comunicaciones.
            </li>
            <li className="text-muted-foreground">
              <strong>Espacio mínimo:</strong> Se debe proporcionar un espacio adecuado para la visualización correcta
              del widget.
            </li>
            <li className="text-muted-foreground">
              <strong>API Key:</strong> Obtener y configurar una clave de API válida proporcionada por DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              <strong>Cookies:</strong> Informar a los usuarios sobre el uso de cookies por parte del widget, si
              corresponde.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">3. PROCESO DE IMPLEMENTACIÓN</h3>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Solicitud de acceso:</strong> Completar el formulario de solicitud en el portal de
                desarrolladores de DECO EXCHANGE.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Verificación:</strong> Pasar el proceso de verificación y aprobación del sitio o aplicación
                donde se implementará el widget.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Obtención de credenciales:</strong> Recibir las claves de API y la documentación necesaria para
                la integración.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Implementación:</strong> Seguir las instrucciones de la documentación para integrar el widget en
                el sitio o aplicación.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Pruebas:</strong> Realizar pruebas en un entorno de desarrollo antes de la implementación en
                producción.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Lanzamiento:</strong> Una vez verificado el correcto funcionamiento, implementar el widget en el
                entorno de producción.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">4. PERSONALIZACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            Los widgets de DECO EXCHANGE ofrecen las siguientes opciones de personalización:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Esquema de colores:</strong> Adaptación a los colores corporativos del sitio anfitrión.
            </li>
            <li className="text-muted-foreground">
              <strong>Tamaño y dimensiones:</strong> Ajuste del tamaño del widget según el espacio disponible.
            </li>
            <li className="text-muted-foreground">
              <strong>Idioma:</strong> Selección del idioma de la interfaz (español, inglés, portugués).
            </li>
            <li className="text-muted-foreground">
              <strong>Monedas predeterminadas:</strong> Configuración de las monedas que se mostrarán por defecto.
            </li>
            <li className="text-muted-foreground">
              <strong>Funcionalidades:</strong> Activación o desactivación de características específicas del widget.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">5. TÉRMINOS DE USO</h3>

          <p className="text-muted-foreground leading-relaxed">
            Al implementar los widgets de DECO EXCHANGE, se aceptan los siguientes términos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>No modificación:</strong> El código del widget no debe ser modificado sin autorización expresa.
            </li>
            <li className="text-muted-foreground">
              <strong>Atribución:</strong> La marca DECO EXCHANGE debe permanecer visible en el widget.
            </li>
            <li className="text-muted-foreground">
              <strong>Uso legítimo:</strong> El widget solo puede utilizarse para los fines previstos y en sitios
              aprobados.
            </li>
            <li className="text-muted-foreground">
              <strong>Responsabilidad:</strong> El implementador es responsable de la correcta integración del widget en
              su plataforma.
            </li>
            <li className="text-muted-foreground">
              <strong>Actualizaciones:</strong> Permitir las actualizaciones automáticas del widget para mantener la
              seguridad y funcionalidad.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">6. MODELOS DE NEGOCIO</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Modelo</th>
                  <th className="py-4 px-4 text-left">Descripción</th>
                  <th className="py-4 px-4 text-left">Comisión</th>
                  <th className="py-4 px-4 text-left">Requisitos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Afiliado</td>
                  <td className="py-4 px-4">Comisión por transacciones generadas</td>
                  <td className="py-4 px-4">10% - 20%</td>
                  <td className="py-4 px-4">Verificación básica</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Corresponsal</td>
                  <td className="py-4 px-4">Modelo de corresponsalía completo</td>
                  <td className="py-4 px-4">30% - 50%</td>
                  <td className="py-4 px-4">Contrato de corresponsalía</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Gratuito</td>
                  <td className="py-4 px-4">Solo widgets informativos</td>
                  <td className="py-4 px-4">N/A</td>
                  <td className="py-4 px-4">Registro básico</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Empresarial</td>
                  <td className="py-4 px-4">Solución personalizada</td>
                  <td className="py-4 px-4">Negociable</td>
                  <td className="py-4 px-4">Contrato empresarial</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">7. SOPORTE TÉCNICO</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE ofrece los siguientes niveles de soporte para implementadores de widgets:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Documentación:</strong> Acceso a documentación técnica detallada y ejemplos de implementación.
            </li>
            <li className="text-muted-foreground">
              <strong>Foro de desarrolladores:</strong> Comunidad en línea para resolver dudas y compartir experiencias.
            </li>
            <li className="text-muted-foreground">
              <strong>Soporte por correo:</strong> Asistencia técnica a través de correo electrónico con tiempo de
              respuesta según el modelo de negocio.
            </li>
            <li className="text-muted-foreground">
              <strong>Soporte telefónico:</strong> Disponible para modelos de corresponsalía y empresarial.
            </li>
            <li className="text-muted-foreground">
              <strong>Implementación asistida:</strong> Servicio opcional de ayuda en la implementación (con costo
              adicional).
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestros widgets o para solicitar acceso a nuestra API de integración, por favor
            contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:widgets@example.invalid" className="text-primary hover:underline">
              widgets@example.invalid
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
            <DownloadCard title="Guía de Widgets - ES" description="Descargar PDF" href="/downloads/widgets-es.pdf" />

            <DownloadCard
              title="Documentación API - EN"
              description="Descargar PDF"
              href="/downloads/api-widgets-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
