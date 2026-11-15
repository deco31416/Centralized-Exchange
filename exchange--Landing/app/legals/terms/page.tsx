"use client";

import Link from "next/link"
import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function TerminosPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />

      {/* Main Content */}
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Términos de Uso</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Legales", href: "/" },
            { label: "Términos de Uso", href: "/legals/terms", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            Bienvenido a DECO EXCHANGE. Al acceder y utilizar nuestros servicios, usted acepta cumplir con los
            siguientes términos y condiciones. Por favor, lea estos términos cuidadosamente antes de utilizar nuestra
            plataforma.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS Y CONDICIONES</h3>
          </div>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Aceptación de Términos:</strong> Al utilizar los servicios de DECO EXCHANGE, usted acepta estos
                términos y condiciones en su totalidad. Si no está de acuerdo con estos términos, por favor no utilice
                nuestros servicios.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Elegibilidad:</strong> Para utilizar nuestros servicios, usted debe tener al menos 18 años de
                edad y la capacidad legal para celebrar contratos vinculantes. Al utilizar nuestros servicios, usted
                confirma que cumple con estos requisitos.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Registro de Cuenta:</strong> Para acceder a ciertos servicios, es posible que deba registrarse y
                crear una cuenta. Usted es responsable de mantener la confidencialidad de su información de cuenta y
                contraseña, y de restringir el acceso a su computadora o dispositivo. Usted acepta la responsabilidad
                por todas las actividades que ocurran bajo su cuenta.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Uso Aceptable:</strong> Usted acepta utilizar nuestros servicios solo para fines legales y de
                acuerdo con estos términos. Usted no debe utilizar nuestros servicios para actividades ilegales,
                fraudulentas o no autorizadas.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Propiedad Intelectual:</strong> Todo el contenido, marcas comerciales, logotipos, diseños y
                software utilizados en nuestro sitio web y servicios son propiedad de DECO EXCHANGE o de sus
                licenciantes. No se otorga ningún derecho o licencia para utilizar dicha propiedad intelectual sin
                nuestro consentimiento previo por escrito.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Limitación de Responsabilidad:</strong> En la medida permitida por la ley, DECO EXCHANGE no
                será responsable por daños directos, indirectos, incidentales, especiales o consecuentes que resulten
                del uso o la imposibilidad de usar nuestros servicios.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos en cualquier
                momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en nuestro sitio
                web. Su uso continuado de nuestros servicios después de cualquier modificación constituye su aceptación
                de los términos modificados.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Ley Aplicable:</strong> Estos términos se regirán e interpretarán de acuerdo con las leyes de
                Colombia, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
              </p>
            </li>
          </ol>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Si tiene alguna pregunta sobre estos términos, por favor contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:contacto@deco31416.com" className="text-primary hover:underline">
              contacto@deco31416.com
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Soporte Legal"
            company="DECO EXCHANGE"
            companyInfo="Sin licencia operativa"
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard title="Términos de Uso - ES" description="Descargar PDF" href="/downloads/terminos-es.pdf" />

            <DownloadCard title="Términos de Uso - EN" description="Descargar PDF" href="/downloads/terminos-en.pdf" />
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  )
}
