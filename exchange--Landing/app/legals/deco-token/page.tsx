"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import InfoCard from "@/components/common/legals/InfoCard"
import DownloadCard from "@/components/common/legals/DownloadCard"

export default function DECOTokenPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header */}
        <div className="legal-document-hero my-8 md:my-10">
          <p className="legal-document-title">DECO EXCHANGE</p>
          <h1 className="legal-document-eyebrow">DECOToken</h1>
          <p className="legal-document-meta">Políticas y términos</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "DECOToken", href: "/legals/deco-token" },
          ]}
          className="mb-8"
        />

        {/* Content */}
        <div className="space-y-12 mb-16">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Acerca de DECOToken</h2>
              <span className="text-xl font-light">01-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-4">
                DECOToken es el activo digital del ecosistema DECO EXCHANGE, diseñado para conectar utilidad,
                comunidad y acceso progresivo a herramientas Web3 dentro de una experiencia segura y transparente.
              </p>
              <p className="mb-4">
                Nuestra plataforma está diseñada para brindar la máxima seguridad y transparencia en todas las
                operaciones, garantizando que los usuarios puedan transferir fondos dentro y fuera de la plataforma con
                total confianza.
              </p>
              <p>
                DECOToken se documenta bajo políticas internas de transparencia, seguridad y prevención de riesgos. Su
                disponibilidad puede variar por jurisdicción y está sujeta a revisión regulatoria.
              </p>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Beneficios para usuarios</h2>
              <span className="text-xl font-light">02-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">•</span>
                  <div>
                    <strong className="font-medium">Respaldo institucional:</strong> Todos los activos en DECOToken
                    hacen parte del ecosistema DECO EXCHANGE, una plataforma tecnológica en revisión regulatoria.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">•</span>
                  <div>
                    <strong className="font-medium">Retiros garantizados:</strong> Facilitamos la extracción de fondos
                    fuera de la plataforma con procesos simplificados y seguros.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">•</span>
                  <div>
                    <strong className="font-medium">Seguridad avanzada:</strong> Implementamos tecnología de
                    encriptación de última generación para proteger todas las transacciones.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">•</span>
                  <div>
                    <strong className="font-medium">Transparencia total:</strong> Acceso a informes regulares sobre
                    reservas y auditorías independientes.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">•</span>
                  <div>
                    <strong className="font-medium">Soporte 24/7:</strong> Asistencia continua para resolver cualquier
                    consulta o incidencia relacionada con tus activos.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Términos y condiciones</h2>
              <span className="text-xl font-light">03-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-4">
                Al utilizar DECOToken, los usuarios aceptan cumplir con nuestros términos y condiciones, que incluyen:
              </p>
              <ul className="space-y-3 mb-4">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">1.</span>
                  <div>Verificación de identidad obligatoria según las políticas KYC/AML.</div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">2.</span>
                  <div>Responsabilidad del usuario en la protección de sus credenciales de acceso.</div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">3.</span>
                  <div>Cumplimiento de las regulaciones fiscales aplicables en su jurisdicción.</div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">4.</span>
                  <div>Aceptación de las comisiones por transacción establecidas en nuestra política de tarifas.</div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">5.</span>
                  <div>Reconocimiento de los riesgos inherentes a las operaciones con activos digitales.</div>
                </li>
              </ul>
              <p>
                Para consultar los términos y condiciones completos, por favor descargue el documento disponible en la
                sección de descargas.
              </p>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Proceso de retiro de fondos</h2>
              <span className="text-xl font-light">04-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-4">
                DECOToken facilita el proceso de retiro de fondos fuera de la plataforma mediante un procedimiento
                seguro y eficiente:
              </p>
              <ol className="space-y-3 mb-4 list-decimal pl-5">
                <li>Inicie sesión en su cuenta de DECOToken y seleccione la opción "Retirar fondos".</li>
                <li>Elija el método de retiro preferido (transferencia bancaria, tarjeta, etc.).</li>
                <li>Ingrese el monto a retirar y la información del destinatario.</li>
                <li>Verifique los detalles de la transacción y confirme la operación.</li>
                <li>Recibirá una notificación de confirmación y podrá seguir el estado del retiro en tiempo real.</li>
              </ol>
              <p>
                Los tiempos de procesamiento varían según el método de retiro seleccionado, pero generalmente se
                completan en un plazo de 1-3 días hábiles.
              </p>
            </div>
          </section>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InfoCard
            title="Soporte técnico"
            description="Si necesita asistencia con DECOToken, nuestro equipo de soporte está disponible 24/7."
            link={{
              text: "Contactar soporte",
              href: "/legals/help-center",
            }}
          />
          <InfoCard
            title="Preguntas frecuentes"
            description="Consulte nuestra sección de preguntas frecuentes para resolver dudas comunes sobre DECOToken."
            link={{
              text: "Ver FAQ",
              href: "/help-center#faq",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DownloadCard
            title="Términos y condiciones"
            description="Documento completo con los términos y condiciones de DECOToken."
            fileSize="1.2 MB"
            fileType="PDF"
          />
          <DownloadCard
            title="Guía de usuario"
            description="Manual detallado sobre cómo utilizar todas las funciones de DECOToken."
            fileSize="3.5 MB"
            fileType="PDF"
          />
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
