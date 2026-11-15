"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link";
import Breadcrumb from "@/components/common/legals/Breadcrumb";
import DownloadCard from "@/components/common/legals/DownloadCard";
import InfoCard from "@/components/common/legals/InfoCard";

export default function AuditoriasPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Auditorías</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Auditorías", href: "/legals/auditorias", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE, nos sometemos a rigurosos procesos de auditoría para garantizar la integridad, seguridad
            y transparencia de nuestras operaciones. Esta página detalla nuestros procesos de auditoría y los resultados
            de las evaluaciones más recientes.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">PRUEBAS Y AUDITORÍAS</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">TIPOS DE AUDITORÍAS</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Auditorías Financieras</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Estados financieros</li>
                <li className="text-muted-foreground">Prueba de reservas</li>
                <li className="text-muted-foreground">Controles internos financieros</li>
                <li className="text-muted-foreground">Cumplimiento fiscal</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Auditorías de Seguridad</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Seguridad de la información</li>
                <li className="text-muted-foreground">Pruebas de penetración</li>
                <li className="text-muted-foreground">Evaluación de vulnerabilidades</li>
                <li className="text-muted-foreground">Seguridad física</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Auditorías de Cumplimiento</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">KYC/AML</li>
                <li className="text-muted-foreground">Protección de datos</li>
                <li className="text-muted-foreground">Regulaciones financieras</li>
                <li className="text-muted-foreground">Estándares de la industria</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Auditorías Operativas</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Procesos de negocio</li>
                <li className="text-muted-foreground">Eficiencia operativa</li>
                <li className="text-muted-foreground">Gestión de riesgos</li>
                <li className="text-muted-foreground">Continuidad del negocio</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">FIRMAS AUDITORAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Trabajamos con firmas auditoras de reconocido prestigio internacional para garantizar la independencia y
            calidad de nuestras auditorías:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground"><strong>Deloitte:</strong> Auditoría financiera anual</li>
            <li className="text-muted-foreground"><strong>KPMG:</strong> Auditoría de cumplimiento regulatorio</li>
            <li className="text-muted-foreground"><strong>PwC:</strong> Prueba de reservas trimestral</li>
            <li className="text-muted-foreground"><strong>EY:</strong> Auditoría de controles internos</li>
            <li className="text-muted-foreground"><strong>NCC Group:</strong> Auditoría de seguridad y pruebas de penetración</li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">CALENDARIO DE AUDITORÍAS</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Tipo de Auditoría</th>
                  <th className="py-4 px-4 text-left">Frecuencia</th>
                  <th className="py-4 px-4 text-left">Firma Auditora</th>
                  <th className="py-4 px-4 text-left">Última Realización</th>
                  <th className="py-4 px-4 text-left">Próxima Programada</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Financiera Completa</td>
                  <td className="py-4 px-4">Anual</td>
                  <td className="py-4 px-4">Deloitte</td>
                  <td className="py-4 px-4">31/12/2023</td>
                  <td className="py-4 px-4">31/12/2024</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Prueba de Reservas</td>
                  <td className="py-4 px-4">Trimestral</td>
                  <td className="py-4 px-4">PwC</td>
                  <td className="py-4 px-4">31/03/2024</td>
                  <td className="py-4 px-4">30/06/2024</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Seguridad Informática</td>
                  <td className="py-4 px-4">Semestral</td>
                  <td className="py-4 px-4">NCC Group</td>
                  <td className="py-4 px-4">15/01/2024</td>
                  <td className="py-4 px-4">15/07/2024</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Cumplimiento KYC/AML</td>
                  <td className="py-4 px-4">Anual</td>
                  <td className="py-4 px-4">KPMG</td>
                  <td className="py-4 px-4">30/09/2023</td>
                  <td className="py-4 px-4">30/09/2024</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Controles Internos</td>
                  <td className="py-4 px-4">Anual</td>
                  <td className="py-4 px-4">EY</td>
                  <td className="py-4 px-4">31/03/2024</td>
                  <td className="py-4 px-4">31/03/2025</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">CERTIFICACIONES Y ESTÁNDARES</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE cumple con los siguientes estándares y certificaciones internacionales:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground"><strong>ISO 27001:</strong> Gestión de seguridad de la información</li>
            <li className="text-muted-foreground"><strong>PCI DSS:</strong> Seguridad en tarjetas de pago</li>
            <li className="text-muted-foreground"><strong>SOC 2 Tipo II:</strong> Controles de servicios</li>
            <li className="text-muted-foreground"><strong>GDPR:</strong> Cumplimiento europeo de datos</li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestros procesos de auditoría o para solicitar copias de los informes de auditoría, por favor contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:auditorias@deco-exchange.com" className="text-primary hover:underline">
              auditorias@deco-exchange.com
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Información Financiera"
            company="DECO EXCHANGE"
            companyInfo="Sin licencia operativa"
          />
          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Resumen de Auditoría 2023"
              description="Descargar PDF"
              href="/downloads/resumen-auditoria-2023.pdf"
            />
            <DownloadCard
              title="Certificaciones Vigentes"
              description="Descargar PDF"
              href="/downloads/certificaciones.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
