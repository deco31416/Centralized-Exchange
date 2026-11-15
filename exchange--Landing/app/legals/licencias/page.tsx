"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link";
import Breadcrumb from "@/components/common/legals/Breadcrumb";
import DownloadCard from "@/components/common/legals/DownloadCard";
import InfoCard from "@/components/common/legals/InfoCard";

export default function LicenciasPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Licencias</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Licencias", href: "/legals/licencias", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE opera bajo un compromiso firme con el cumplimiento normativo internacional. Actualmente no contamos con licencias emitidas fuera de Colombia, ni se han iniciado formalmente los procesos de registro empresarial en otras jurisdicciones. No obstante, tenemos definido un plan estratégico de expansión regulatoria.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">JURISDICCIONES OBJETIVO PARA FUTURO LICENCIAMIENTO</h3>
          </div>

          {/* Disclaimer Legal */}
          <div className="rounded-md border-l-4 border-amber-500 bg-amber-500/10 p-4 text-amber-900 dark:border-amber-400 dark:bg-amber-400/10 dark:text-amber-100 mb-6">
            <p className="font-semibold mb-2">Nota Legal Importante:</p>
            <p className="text-sm leading-relaxed">
              La información sobre jurisdicciones previstas representa únicamente una intención estratégica de expansión.
              La inclusión de países como <span className="font-medium">Colombia 🇨🇴, Brasil 🇧🇷, México 🇲🇽, El Salvador 🇸🇻, Estados Unidos 🇺🇸 y Bermudas 🇧🇲</span>
              está sujeta a cambios sin previo aviso, dependiendo de la viabilidad legal, condiciones regulatorias y aprobaciones gubernamentales correspondientes.
            </p>
            <p className="text-sm mt-2 leading-relaxed">
              <strong>DECO EXCHANGE</strong> se reserva el derecho de modificar, ampliar o eliminar países de su estrategia de licenciamiento conforme a la evolución del marco legal,
              sin que ello implique compromiso definitivo de operación en las jurisdicciones aquí listadas.
            </p>
          </div>

          {/* Tabla de Jurisdicciones */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">País</th>
                  <th className="py-4 px-4 text-left">Entidad Regulatoria Referente</th>
                  <th className="py-4 px-4 text-left">Tipo de Licencia Esperada</th>
                  <th className="py-4 px-4 text-left">Estado</th>
                  <th className="py-4 px-4 text-left">Fecha Estimada</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Colombia 🇨🇴</td>
                  <td className="py-4 px-4">SFC (proyectado)</td>
                  <td className="py-4 px-4">Servicios Financieros / Cambiarios</td>
                  <td className="py-4 px-4">Empresa registrada, sin licencia</td>
                  <td className="py-4 px-4">Q3 2026</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">México 🇲🇽</td>
                  <td className="py-4 px-4">CNBV</td>
                  <td className="py-4 px-4">Transmisor de Dinero</td>
                  <td className="py-4 px-4">No iniciado</td>
                  <td className="py-4 px-4">Q3 2026</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Brasil 🇧🇷</td>
                  <td className="py-4 px-4">Banco Central de Brasil</td>
                  <td className="py-4 px-4">Operador Cambiario</td>
                  <td className="py-4 px-4">No iniciado</td>
                  <td className="py-4 px-4">Q3 2026</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Estados Unidos 🇺🇸</td>
                  <td className="py-4 px-4">FinCEN</td>
                  <td className="py-4 px-4">Money Services Business (MSB)</td>
                  <td className="py-4 px-4">No iniciado</td>
                  <td className="py-4 px-4">Q3 2026</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">El Salvador 🇸🇻</td>
                  <td className="py-4 px-4">SSF (proyectado)</td>
                  <td className="py-4 px-4">Entidad de Servicios Financieros</td>
                  <td className="py-4 px-4">No iniciado</td>
                  <td className="py-4 px-4">Q3 2026</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Bermudas 🇧🇲</td>
                  <td className="py-4 px-4">BMA – Bermuda Monetary Authority</td>
                  <td className="py-4 px-4">Digital Asset Business License</td>
                  <td className="py-4 px-4">No iniciado</td>
                  <td className="py-4 px-4">Q3 2026</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">CUMPLIMIENTO REGULATORIO</h3>

          <p className="text-muted-foreground leading-relaxed">
            En DECO EXCHANGE nos comprometemos a cumplir con todas las regulaciones aplicables en cada jurisdicción donde operemos en el futuro, adoptando estándares internacionales de cumplimiento normativo y buenas prácticas sectoriales, incluyendo:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground"><strong>Prevención de lavado de activos y financiación del terrorismo (AML/CFT)</strong></li>
            <li className="text-muted-foreground"><strong>Conocimiento del cliente (KYC) y actualizaciones periódicas (KYC Refresh)</strong></li>
            <li className="text-muted-foreground"><strong>Protección de datos personales conforme al RGPD, Ley 1581 de 2012 (Colombia), y equivalentes</strong></li>
            <li className="text-muted-foreground"><strong>Regulaciones cambiarias y de transferencias internacionales de fondos</strong></li>
            <li className="text-muted-foreground"><strong>Protección al consumidor financiero y resolución de conflictos</strong></li>
            <li className="text-muted-foreground"><strong>Monitoreo de transacciones en tiempo real (Transaction Monitoring)</strong></li>
            <li className="text-muted-foreground"><strong>Reportes de operaciones sospechosas (STR) y cumplimiento de reportes regulatorios</strong></li>
            <li className="text-muted-foreground"><strong>Control de listas sancionatorias (OFAC, ONU, EU) y screening de usuarios</strong></li>
            <li className="text-muted-foreground"><strong>Gobierno corporativo y auditoría interna de cumplimiento</strong></li>
            <li className="text-muted-foreground"><strong>Capacitación continua del equipo en normativa y riesgos legales</strong></li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">EQUIPO DE CUMPLIMIENTO</h3>

          <p className="text-muted-foreground leading-relaxed">
            Nuestro programa de cumplimiento está dirigido por un <strong>Oficial de Cumplimiento (Chief Compliance Officer, CCO)</strong> con independencia operativa, quien reporta directamente al consejo directivo. Este rol está encargado de diseñar, implementar y supervisar todas las políticas internas relacionadas con la prevención del lavado de activos, el cumplimiento normativo, y la gestión de riesgos operacionales y reputacionales.
          </p>

          <p className="text-muted-foreground mt-4 leading-relaxed">
            El equipo de cumplimiento está conformado por profesionales multidisciplinarios con experiencia en regulación financiera, protección de datos, ciberseguridad, gobierno corporativo y análisis transaccional. Este equipo trabaja de forma coordinada con las áreas de tecnología, legal, auditoría interna y atención al cliente.
          </p>

          <p className="text-muted-foreground mt-4 leading-relaxed">
            Las funciones clave del área incluyen:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li className="text-muted-foreground">Supervisión de los procedimientos de KYC, AML y CFT.</li>
            <li className="text-muted-foreground">Monitoreo y análisis de transacciones en tiempo real.</li>
            <li className="text-muted-foreground">Gestión de listas sancionatorias, screening y PEPs.</li>
            <li className="text-muted-foreground">Actualización normativa y control de cambios regulatorios.</li>
            <li className="text-muted-foreground">Elaboración de reportes regulatorios y STR.</li>
            <li className="text-muted-foreground">Capacitación periódica a todos los equipos sobre cumplimiento y ética.</li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestro roadmap regulatorio o establecer contacto con el equipo de cumplimiento, puede escribirnos a:{" "}
            <Link href="mailto:licencias@deco-exchange.com" className="text-primary hover:underline">
              licencias@deco-exchange.com
            </Link>
          </p>

        </div>

        {/* Footer Cards con documentación real de empresa registrada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Información Legal en Colombia"
            company="DECO EXCHANGE"
            companyInfo="Desarrollado por DECO31416"
            link={{ text: "Ver más", href: "/legals/licencias" }}
          />

          <div className="grid grid-cols-1 gap-4">
            <p className="rounded-md border-l-4 border-amber-500 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-900 dark:border-amber-400 dark:bg-amber-400/10 dark:text-amber-100">
              El documento a continuación corresponde al <strong>registro mercantil</strong> de <strong>DECO EXCHANGE</strong>, entidad jurídica debidamente constituida en Colombia.
              A la fecha, dicha entidad <strong>no cuenta con autorizaciones otorgadas por la Superintendencia Financiera de Colombia (SFC), la DIAN ni ningún otro ente regulador</strong> para operar como institución financiera, cambiaria o de remesas.
              <br /><br />
              La plataforma <strong>DECO EXCHANGE</strong> se encuentra actualmente en etapa de desarrollo tecnológico y no ha iniciado operaciones en ninguna jurisdicción. El inicio de actividades comerciales está sujeto a la obtención de las licencias y autorizaciones regulatorias correspondientes en cada país donde se proyecta operar.
              <br /><br />
              Hasta tanto no se obtengan dichas aprobaciones, <strong>DECO EXCHANGE no ofrece servicios financieros, de cambio o custodia a usuarios ni mantiene operaciones activas</strong>. Esta declaración se realiza en cumplimiento del principio de transparencia y prevención de interpretaciones erróneas ante el público y los entes de control.
            </p>

            <DownloadCard
              title="Certificado de Cámara de Comercio"
              description="Descargar PDF"
              href="/downloads/certificado-camara-comercio.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
