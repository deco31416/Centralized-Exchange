"use client";

import Link from "next/link"
import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function DenunciasPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />

      {/* Main Content */}
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Canal para Informes</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Legales", href: "/" },
            { label: "Canal para Informes", href: "/denuncias", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE, valoramos la integridad, la transparencia y el cumplimiento de las leyes y regulaciones
            aplicables. Nuestro Canal para Informes proporciona un medio seguro y confidencial para reportar
            preocupaciones o posibles violaciones de nuestras políticas, códigos de conducta o leyes aplicables.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">CANAL PARA INFORMES</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">¿QUÉ PUEDE REPORTAR?</h3>

          <p className="text-muted-foreground leading-relaxed">
            Puede utilizar nuestro Canal para Informes para reportar preocupaciones relacionadas con:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">Fraude o actividades sospechosas</li>
            <li className="text-muted-foreground">Violaciones de nuestras políticas o códigos de conducta</li>
            <li className="text-muted-foreground">Lavado de dinero o financiamiento del terrorismo</li>
            <li className="text-muted-foreground">Violaciones de la privacidad o seguridad de los datos</li>
            <li className="text-muted-foreground">Conducta no ética o ilegal</li>
            <li className="text-muted-foreground">Conflictos de interés</li>
            <li className="text-muted-foreground">Acoso o discriminación</li>
            <li className="text-muted-foreground">Cualquier otra preocupación relacionada con el cumplimiento</li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">CÓMO PRESENTAR UN INFORME</h3>

          <p className="text-muted-foreground leading-relaxed">
            Puede presentar un informe a través de los siguientes canales:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Correo Electrónico:</strong>{" "}
              <Link href="mailto:denuncias@example.invalid" className="text-primary hover:underline">
                denuncias@example.invalid
              </Link>
            </li>
            <li className="text-muted-foreground">
              <strong>Formulario en Línea:</strong> Disponible en nuestra página web en la sección "Denuncias"
            </li>
            <li className="text-muted-foreground">
              <strong>Línea Telefónica:</strong> +57 (1) 123-4567 (disponible 24/7)
            </li>
            <li className="text-muted-foreground">
              <strong>Correo Postal:</strong> Oficial de Cumplimiento, DECO EXCHANGE, [Dirección], Bogotá,
              Colombia
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">CONFIDENCIALIDAD Y NO REPRESALIAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Todos los informes se manejan con la máxima confidencialidad. Su identidad se mantendrá confidencial en la
            medida de lo posible, consistente con la necesidad de llevar a cabo una investigación adecuada.
          </p>

          <p className="text-muted-foreground mt-4 leading-relaxed">
            DECO EXCHANGE tiene una política estricta de no represalias. No toleramos ninguna forma de represalia
            contra cualquier persona que, de buena fe, reporte una preocupación o participe en una investigación.
          </p>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestro Canal para Informes, por favor contacte a nuestro Oficial de Cumplimiento
            a través del correo electrónico:{" "}
            <Link href="mailto:compliance@example.invalid" className="text-primary hover:underline">
              compliance@example.invalid
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
              title="Política de Denuncias - ES"
              description="Descargar PDF"
              href="/downloads/denuncias-es.pdf"
            />

            <DownloadCard
              title="Política de Denuncias - EN"
              description="Descargar PDF"
              href="/downloads/denuncias-en.pdf"
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
