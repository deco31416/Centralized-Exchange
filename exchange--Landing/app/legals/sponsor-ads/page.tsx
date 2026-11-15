"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function SponsorAdsPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Sponsor Ads</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Programas", href: "/" },
            { label: "Sponsor Ads", href: "/sponsor-ads", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            El programa Sponsor Ads de DECO EXCHANGE ofrece a empresas, proyectos y marcas la oportunidad de
            promocionar sus productos y servicios a nuestra amplia base de usuarios. Con opciones de publicidad
            personalizadas y segmentación precisa, nuestro programa permite a los anunciantes conectar con audiencias
            relevantes en el ecosistema financiero y de remesas.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS DE SPONSOR</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL PROGRAMA</h3>

          <p className="text-muted-foreground leading-relaxed">
            Sponsor Ads es una plataforma publicitaria que permite a los anunciantes promocionar sus productos y
            servicios a través de diversos formatos y canales dentro del ecosistema de DECO EXCHANGE. El programa está
            diseñado para ofrecer opciones de publicidad efectivas y no intrusivas que generen valor tanto para los
            anunciantes como para los usuarios.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">2. FORMATOS PUBLICITARIOS</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE ofrece diversos formatos publicitarios para adaptarse a las necesidades de cada anunciante:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Banners</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Banner superior (728x90px)</li>
                <li className="text-muted-foreground">Banner lateral (300x250px)</li>
                <li className="text-muted-foreground">Banner móvil (320x50px)</li>
                <li className="text-muted-foreground">Banner intersticial</li>
                <li className="text-muted-foreground">Banner flotante</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Contenido Patrocinado</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Artículos patrocinados</li>
                <li className="text-muted-foreground">Guías educativas</li>
                <li className="text-muted-foreground">Análisis de mercado</li>
                <li className="text-muted-foreground">Entrevistas</li>
                <li className="text-muted-foreground">Casos de estudio</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Notificaciones</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Notificaciones push</li>
                <li className="text-muted-foreground">Alertas en plataforma</li>
                <li className="text-muted-foreground">Mensajes en dashboard</li>
                <li className="text-muted-foreground">Notificaciones por correo</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Patrocinios Premium</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Patrocinio de eventos</li>
                <li className="text-muted-foreground">Webinars patrocinados</li>
                <li className="text-muted-foreground">Competencias y torneos</li>
                <li className="text-muted-foreground">Secciones exclusivas</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. OPCIONES DE SEGMENTACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para maximizar la efectividad de las campañas, ofrecemos las siguientes opciones de segmentación:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Geográfica:</strong> Segmentación por país, región, ciudad o zona.
            </li>
            <li className="text-muted-foreground">
              <strong>Demográfica:</strong> Segmentación por edad, género, idioma y otros datos demográficos.
            </li>
            <li className="text-muted-foreground">
              <strong>Comportamental:</strong> Segmentación basada en el comportamiento del usuario en la plataforma.
            </li>
            <li className="text-muted-foreground">
              <strong>Por intereses:</strong> Segmentación según los intereses demostrados por los usuarios.
            </li>
            <li className="text-muted-foreground">
              <strong>Por servicios:</strong> Segmentación según los servicios utilizados (giros, trading, cambio de
              divisas, etc.).
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">4. MODELOS DE PRECIOS</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Modelo</th>
                  <th className="py-4 px-4 text-left">Descripción</th>
                  <th className="py-4 px-4 text-left">Precio Base</th>
                  <th className="py-4 px-4 text-left">Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">CPM (Costo por Mil Impresiones)</td>
                  <td className="py-4 px-4">Pago por cada 1,000 veces que se muestra el anuncio</td>
                  <td className="py-4 px-4">Desde $5 USD</td>
                  <td className="py-4 px-4">Campañas de branding y reconocimiento</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">CPC (Costo por Clic)</td>
                  <td className="py-4 px-4">Pago por cada clic que recibe el anuncio</td>
                  <td className="py-4 px-4">Desde $0.50 USD</td>
                  <td className="py-4 px-4">Generación de tráfico y visitas</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">CPA (Costo por Acción)</td>
                  <td className="py-4 px-4">Pago por cada acción específica realizada</td>
                  <td className="py-4 px-4">Desde $10 USD</td>
                  <td className="py-4 px-4">Conversiones y resultados específicos</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Patrocinio Fijo</td>
                  <td className="py-4 px-4">Tarifa fija por período de tiempo</td>
                  <td className="py-4 px-4">Desde $500 USD/mes</td>
                  <td className="py-4 px-4">Presencia continua y exclusividad</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Modelo Híbrido</td>
                  <td className="py-4 px-4">Combinación de modelos anteriores</td>
                  <td className="py-4 px-4">Personalizado</td>
                  <td className="py-4 px-4">Campañas complejas con múltiples objetivos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">5. REQUISITOS PARA ANUNCIANTES</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para participar en el programa Sponsor Ads, los anunciantes deben cumplir con los siguientes requisitos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Empresa legalmente constituida:</strong> Contar con registro legal y documentación vigente.
            </li>
            <li className="text-muted-foreground">
              <strong>Productos/servicios relevantes:</strong> Ofrecer productos o servicios relacionados con finanzas,
              economía, tecnología o de interés para nuestra audiencia.
            </li>
            <li className="text-muted-foreground">
              <strong>Cumplimiento normativo:</strong> Cumplir con todas las regulaciones aplicables en materia de
              publicidad y protección al consumidor.
            </li>
            <li className="text-muted-foreground">
              <strong>Verificación KYB:</strong> Completar satisfactoriamente nuestro proceso de conocimiento del
              negocio (Know Your Business).
            </li>
            <li className="text-muted-foreground">
              <strong>Presupuesto mínimo:</strong> Contar con un presupuesto mínimo de $300 USD para campañas iniciales.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">6. POLÍTICAS DE CONTENIDO</h3>

          <p className="text-muted-foreground leading-relaxed">
            Todo el contenido publicitario debe cumplir con las siguientes políticas:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Veracidad:</strong> La información debe ser precisa, verificable y no engañosa.
            </li>
            <li className="text-muted-foreground">
              <strong>Transparencia:</strong> Los anuncios deben identificarse claramente como contenido publicitario.
            </li>
            <li className="text-muted-foreground">
              <strong>Calidad:</strong> El contenido debe ser de alta calidad, profesional y sin errores.
            </li>
            <li className="text-muted-foreground">
              <strong>Relevancia:</strong> Los anuncios deben ser relevantes para nuestra audiencia.
            </li>
            <li className="text-muted-foreground">
              <strong>Restricciones:</strong> No se permite publicidad de productos/servicios ilegales, contenido para
              adultos, juegos de azar no regulados, esquemas piramidales, o cualquier contenido que promueva actividades
              fraudulentas o dañinas.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">7. PROCESO DE APROBACIÓN</h3>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Solicitud:</strong> El anunciante completa el formulario de solicitud y proporciona información
                sobre su empresa y campaña.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Revisión:</strong> El equipo de DECO EXCHANGE revisa la solicitud y verifica la elegibilidad
                del anunciante.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Propuesta:</strong> Se elabora una propuesta personalizada según los objetivos y presupuesto del
                anunciante.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Contratación:</strong> Una vez aceptada la propuesta, se firma el contrato y se realiza el pago
                inicial.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Creación de contenido:</strong> El anunciante proporciona los materiales publicitarios o se
                desarrollan en colaboración con nuestro equipo.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Revisión de contenido:</strong> Se revisa y aprueba el contenido publicitario según nuestras
                políticas.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Lanzamiento:</strong> Se implementa la campaña según el calendario acordado.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Seguimiento y optimización:</strong> Se monitorea el rendimiento y se realizan ajustes para
                optimizar resultados.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">8. TÉRMINOS ADICIONALES</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              DECO EXCHANGE se reserva el derecho de rechazar cualquier anuncio que no cumpla con nuestras políticas o
              que consideremos inapropiado para nuestra audiencia.
            </li>
            <li className="text-muted-foreground">
              Los anunciantes son responsables de garantizar que su contenido cumple con todas las leyes y regulaciones
              aplicables en las jurisdicciones donde se mostrará.
            </li>
            <li className="text-muted-foreground">
              DECO EXCHANGE puede suspender o cancelar cualquier campaña que, después de su aprobación, se determine
              que viola nuestras políticas.
            </li>
            <li className="text-muted-foreground">
              Los informes de rendimiento se proporcionan según la frecuencia acordada en el contrato (diaria, semanal o
              mensual).
            </li>
            <li className="text-muted-foreground">
              Las cancelaciones de campañas deben notificarse con al menos 48 horas de anticipación. Pueden aplicarse
              cargos por cancelación según los términos del contrato.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre el programa Sponsor Ads o para solicitar una propuesta personalizada, por favor
            contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:publicidad@deco-exchange.com" className="text-primary hover:underline">
              publicidad@deco-exchange.com
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Programas"
            company="DECO EXCHANGE"
            companyInfo="Sin licencia operativa"
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard title="Media Kit - ES" description="Descargar PDF" href="/downloads/media-kit-es.pdf" />

            <DownloadCard title="Media Kit - EN" description="Descargar PDF" href="/downloads/media-kit-en.pdf" />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
