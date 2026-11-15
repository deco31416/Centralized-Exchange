"use client";

import Link from "next/link"
import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function KycAmlPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />

      {/* Main Content */}
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">KYC / AML</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Legales", href: "/" },
            { label: "KYC / AML", href: "/legals/kyc-aml", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE (la "Compañía") identificada con NIT 901855054-5, en cumplimiento de las
            disposiciones legales relacionadas con la prevención del lavado de activos y financiación del terrorismo,
            establece las siguientes políticas de Conocimiento del Cliente (KYC) y Anti-Lavado de Dinero (AML):
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">POLÍTICAS KYC / AML</h3>
          </div>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Identificación del Cliente:</strong> Todos los usuarios de DECO EXCHANGE deben proporcionar
                información de identificación precisa y actualizada. Esto incluye, pero no se limita a: nombre completo,
                documento de identidad, dirección, número de teléfono y correo electrónico.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Verificación de Identidad:</strong> La Compañía implementa procesos de verificación de identidad
                para confirmar que la información proporcionada por los usuarios es auténtica y precisa. Esto puede
                incluir la solicitud de documentos de identificación, comprobantes de domicilio y otros documentos
                relevantes.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Monitoreo de Transacciones:</strong> La Compañía monitorea continuamente las transacciones
                realizadas a través de su plataforma para detectar actividades sospechosas o inusuales que puedan estar
                relacionadas con el lavado de activos o la financiación del terrorismo.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Reporte de Actividades Sospechosas:</strong> En caso de detectar actividades sospechosas, la
                Compañía se reserva el derecho de reportar dichas actividades a las autoridades competentes, de
                conformidad con las leyes y regulaciones aplicables.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Actualización de Información:</strong> Los usuarios deben mantener su información personal
                actualizada. La Compañía puede solicitar periódicamente la actualización de la información del cliente
                como parte de sus procesos de debida diligencia.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Capacitación del Personal:</strong> La Compañía proporciona capacitación regular a su personal
                sobre las políticas y procedimientos de KYC/AML, así como sobre la identificación de actividades
                sospechosas.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Cumplimiento Normativo:</strong> La Compañía se compromete a cumplir con todas las leyes y
                regulaciones aplicables en materia de prevención del lavado de activos y financiación del terrorismo,
                incluyendo, pero no limitado a, la Ley 1121 de 2006, la Circular Básica Jurídica de la Superintendencia
                Financiera de Colombia y las recomendaciones del Grupo de Acción Financiera Internacional (GAFI).
              </p>
            </li>
          </ol>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestras políticas de KYC/AML, por favor contacte a nuestro Oficial de
            Cumplimiento a través del correo electrónico:{" "}
            <Link href="mailto:compliance@deco-exchange.com" className="text-primary hover:underline">
              compliance@deco-exchange.com
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
            <DownloadCard title="Políticas KYC/AML - ES" description="Descargar PDF" href="/downloads/kyc-aml-es.pdf" />

            <DownloadCard title="Políticas KYC/AML - EN" description="Descargar PDF" href="/downloads/kyc-aml-en.pdf" />
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  )
}
