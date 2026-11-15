"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function SegurosPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Seguros</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Seguros", href: "/seguros", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE, la seguridad de los fondos de nuestros clientes es una prioridad absoluta. Para
            proporcionar una capa adicional de protección, contamos con diversas pólizas de seguro que cubren diferentes
            aspectos de nuestras operaciones.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">SEGURO DE deco-exchange</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">COBERTURAS DE SEGURO</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Seguro de Responsabilidad Civil</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Cobertura hasta $10,000,000 USD</li>
                <li className="text-muted-foreground">Protección contra reclamaciones de terceros</li>
                <li className="text-muted-foreground">Responsabilidad profesional</li>
                <li className="text-muted-foreground">Aseguradora: AXA Colpatria</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Seguro de Ciberriesgos</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Cobertura hasta $5,000,000 USD</li>
                <li className="text-muted-foreground">Protección contra ataques cibernéticos</li>
                <li className="text-muted-foreground">Violaciones de datos</li>
                <li className="text-muted-foreground">Aseguradora: Chubb</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Seguro de Fidelidad</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Cobertura hasta $3,000,000 USD</li>
                <li className="text-muted-foreground">Protección contra fraude interno</li>
                <li className="text-muted-foreground">Malversación de fondos</li>
                <li className="text-muted-foreground">Aseguradora: Allianz</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Seguro de Transporte de Valores</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Cobertura hasta $2,000,000 USD por envío</li>
                <li className="text-muted-foreground">Protección durante el transporte físico</li>
                <li className="text-muted-foreground">Cobertura contra robo y pérdida</li>
                <li className="text-muted-foreground">Aseguradora: Mapfre</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">PROTECCIÓN AL CLIENTE</h3>

          <p className="text-muted-foreground leading-relaxed">
            Además de nuestras pólizas corporativas, ofrecemos protección adicional para nuestros clientes:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Garantía de Transacción Segura:</strong> Reembolso completo en caso de fraude o error en la
              transacción.
            </li>
            <li className="text-muted-foreground">
              <strong>Seguro de Remesas:</strong> Cobertura opcional para envíos de dinero que protege contra pérdidas,
              robos o fraudes durante la transferencia.
            </li>
            <li className="text-muted-foreground">
              <strong>Protección de Datos:</strong> Seguro que cubre posibles violaciones de datos personales de
              nuestros clientes.
            </li>
            <li className="text-muted-foreground">
              <strong>Asistencia Legal:</strong> Asesoramiento legal gratuito en caso de disputas relacionadas con
              nuestros servicios.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">PROCESO DE RECLAMACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            En caso de incidentes que requieran activar nuestras pólizas de seguro, hemos establecido un proceso claro y
            eficiente para gestionar las reclamaciones:
          </p>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Notificación del incidente:</strong> El cliente debe notificar el incidente a través de nuestros
                canales oficiales dentro de las 48 horas de ocurrido.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Documentación:</strong> Presentación de la documentación requerida para respaldar la
                reclamación.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Evaluación:</strong> Nuestro equipo de riesgos evaluará la reclamación en un plazo máximo de 5
                días hábiles.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Resolución:</strong> Comunicación de la resolución y, en caso de aprobación, procesamiento del
                pago correspondiente.
              </p>
            </li>
          </ol>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestras pólizas de seguro o para iniciar una reclamación, por favor contáctenos
            a través del correo electrónico:{" "}
            <Link href="mailto:seguros@deco-exchange.com" className="text-primary hover:underline">
              seguros@deco-exchange.com
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
              title="Certificado de Seguros"
              description="Descargar PDF"
              href="/downloads/certificado-seguros.pdf"
            />

            <DownloadCard
              title="Guía de Reclamaciones"
              description="Descargar PDF"
              href="/downloads/guia-reclamaciones.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
