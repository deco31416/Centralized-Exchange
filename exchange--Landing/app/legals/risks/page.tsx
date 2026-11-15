"use client";

import Link from "next/link"
import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function RiesgosPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />

      {/* Main Content */}
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Declaración de Riesgos</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Legales", href: "/" },
            { label: "Declaración de Riesgos", href: "/riesgos", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE proporciona esta Declaración de Riesgos para informar a nuestros usuarios sobre los riesgos
            potenciales asociados con el uso de nuestros servicios. Es importante que comprenda estos riesgos antes de
            utilizar nuestra plataforma.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">DECLARACIÓN DE RIESGOS</h3>
          </div>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Riesgo de Mercado:</strong> Los servicios financieros están sujetos a fluctuaciones del mercado
                y otros riesgos inherentes a los mercados financieros. Los tipos de cambio pueden variar
                significativamente en cortos períodos de tiempo.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Riesgo Regulatorio:</strong> Los cambios en las leyes, regulaciones y políticas gubernamentales
                pueden afectar la operación de nuestros servicios y podrían resultar en restricciones o prohibiciones
                que afecten nuestra capacidad para proporcionar servicios en ciertas jurisdicciones.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Riesgo Operacional:</strong> Existe el riesgo de pérdidas debido a procesos internos inadecuados
                o fallidos, errores humanos, fallos de sistemas o eventos externos. Aunque implementamos medidas de
                seguridad robustas, no podemos garantizar la ausencia total de interrupciones o fallos técnicos.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Riesgo de Contraparte:</strong> Existe el riesgo de que una contraparte no cumpla con sus
                obligaciones contractuales, lo que podría resultar en pérdidas financieras.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Riesgo de Liquidez:</strong> En ciertas circunstancias, puede haber una reducción en la
                liquidez, lo que podría resultar en retrasos en la ejecución de transacciones o en la imposibilidad de
                liquidar posiciones a precios favorables.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Riesgo de Ciberseguridad:</strong> A pesar de nuestras medidas de seguridad, existe el riesgo de
                ataques cibernéticos, violaciones de datos u otras amenazas de seguridad que podrían comprometer la
                información del usuario o interrumpir nuestros servicios.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Riesgo de Fuerza Mayor:</strong> Eventos imprevistos o de fuerza mayor, como desastres
                naturales, actos de terrorismo, disturbios civiles o pandemias, pueden afectar nuestra capacidad para
                proporcionar servicios.
              </p>
            </li>
          </ol>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Esta Declaración de Riesgos no pretende ser exhaustiva y puede haber otros riesgos no mencionados aquí. Le
            recomendamos que evalúe cuidadosamente estos riesgos y consulte con asesores financieros y legales
            independientes antes de utilizar nuestros servicios.
          </p>

          <p className="text-muted-foreground mt-4 leading-relaxed">
            Para más información sobre los riesgos asociados con nuestros servicios, por favor contáctenos a través del
            correo electrónico:{" "}
            <Link href="mailto:risk@example.invalid" className="text-primary hover:underline">
              risk@example.invalid
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
            <DownloadCard
              title="Declaración de Riesgos - ES"
              description="Descargar PDF"
              href="/downloads/riesgos-es.pdf"
            />

            <DownloadCard
              title="Declaración de Riesgos - EN"
              description="Descargar PDF"
              href="/downloads/riesgos-en.pdf"
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
