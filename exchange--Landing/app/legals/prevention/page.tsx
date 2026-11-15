"use client";

import Link from "next/link"
import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function PrevencionPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />

      {/* Main Content */}
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Prevención de Fraude</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Legales", href: "/legals" },
            { label: "Prevención de Fraude", href: "/legals/prevention", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE, nos comprometemos a proteger a nuestros usuarios contra el fraude y las actividades
            maliciosas. Hemos implementado diversas medidas y políticas para prevenir el fraude y garantizar la
            seguridad de nuestras transacciones.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">POLÍTICAS DE PREVENCIÓN DE FRAUDE</h3>
          </div>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Verificación de Identidad:</strong> Implementamos procesos rigurosos de verificación de
                identidad para confirmar que nuestros usuarios son quienes dicen ser. Esto puede incluir la verificación
                de documentos de identidad, comprobantes de domicilio y otros documentos relevantes.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Monitoreo de Transacciones:</strong> Utilizamos sistemas avanzados de monitoreo para detectar
                patrones inusuales o sospechosos en las transacciones. Esto nos permite identificar y prevenir
                actividades fraudulentas en tiempo real.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Autenticación de Múltiples Factores:</strong> Implementamos la autenticación de múltiples
                factores para proporcionar una capa adicional de seguridad a las cuentas de nuestros usuarios.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Encriptación de Datos:</strong> Utilizamos tecnologías de encriptación avanzadas para proteger
                la información sensible de nuestros usuarios durante la transmisión y el almacenamiento.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Educación del Usuario:</strong> Proporcionamos información y recursos educativos para ayudar a
                nuestros usuarios a reconocer y evitar estafas y fraudes comunes.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Políticas de Reembolso:</strong> Tenemos políticas claras de reembolso para proteger a nuestros
                usuarios en caso de transacciones no autorizadas o fraudulentas.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Colaboración con Autoridades:</strong> Cooperamos con las autoridades legales y regulatorias
                para combatir el fraude y otras actividades ilícitas.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">CONSEJOS PARA PREVENIR EL FRAUDE</h3>

          <ul className="list-disc pl-6 space-y-2">
            <li className="text-muted-foreground">Nunca comparta su contraseña o información de cuenta con nadie.</li>
            <li className="text-muted-foreground">
              Utilice contraseñas fuertes y únicas para su cuenta de DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              Verifique siempre la URL antes de ingresar información sensible. Nuestra URL oficial es
              https://example.invalid.
            </li>
            <li className="text-muted-foreground">
              Tenga cuidado con los correos electrónicos o mensajes que solicitan información personal o financiera.
              DECO EXCHANGE nunca le pedirá su contraseña o información sensible por correo electrónico.
            </li>
            <li className="text-muted-foreground">
              Mantenga su software y sistemas actualizados con los últimos parches de seguridad.
            </li>
            <li className="text-muted-foreground">
              Reporte inmediatamente cualquier actividad sospechosa o no autorizada en su cuenta.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Si sospecha que ha sido víctima de fraude o ha identificado actividad sospechosa, por favor contáctenos
            inmediatamente a través del correo electrónico:{" "}
            <Link href="mailto:fraud@example.invalid" className="text-primary hover:underline">
              fraud@example.invalid
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            description="Políticas de prevención de fraude y ciberseguridad"
            link={{
              text: "Leer más",
              href: "/legals/prevention"
            }}
          />


          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Prevención de Fraude - ES"
              description="Descargar PDF"
              href="#"
            />

            <DownloadCard
              title="Prevención de Fraude - EN"
              description="Descargar PDF"
              href="#"
            />
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  )
}
