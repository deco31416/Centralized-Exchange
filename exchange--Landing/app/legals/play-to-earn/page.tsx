"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function PlayToEarnPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Play to Earn</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Programas", href: "/" },
            { label: "Play to Earn", href: "/play-to-earn", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            El programa Play to Earn de DECO EXCHANGE es una iniciativa innovadora que permite a los usuarios ganar
            recompensas reales mientras juegan y aprenden sobre finanzas, trading y criptomonedas. A través de juegos
            interactivos, desafíos y competencias, los participantes pueden obtener beneficios mientras desarrollan
            habilidades financieras útiles.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS DEL PROGRAMA</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL PROGRAMA</h3>

          <p className="text-muted-foreground leading-relaxed">
            Play to Earn ofrece una variedad de actividades gamificadas que permiten a los usuarios ganar puntos,
            tokens, descuentos y otros beneficios mientras interactúan con la plataforma de DECO EXCHANGE. El programa
            está diseñado para educar y entretener, a la vez que recompensa la participación activa.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">2. JUEGOS Y ACTIVIDADES</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Trading Simulator</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Simulador de trading con dinero virtual</li>
                <li className="text-muted-foreground">Competencias semanales y mensuales</li>
                <li className="text-muted-foreground">Premios para los mejores rendimientos</li>
                <li className="text-muted-foreground">Niveles de dificultad progresivos</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Crypto Quest</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Aventura educativa sobre criptomonedas</li>
                <li className="text-muted-foreground">Misiones y desafíos temáticos</li>
                <li className="text-muted-foreground">Colección de NFTs exclusivos</li>
                <li className="text-muted-foreground">Recompensas en tokens NGIRO</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Finance Trivia</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Preguntas sobre finanzas y economía</li>
                <li className="text-muted-foreground">Modo multijugador en tiempo real</li>
                <li className="text-muted-foreground">Torneos con premios en efectivo</li>
                <li className="text-muted-foreground">Niveles de dificultad adaptables</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Daily Challenges</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Desafíos diarios con recompensas inmediatas</li>
                <li className="text-muted-foreground">Tareas relacionadas con la plataforma</li>
                <li className="text-muted-foreground">Bonificaciones por racha de participación</li>
                <li className="text-muted-foreground">Recompensas acumulativas</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. SISTEMA DE RECOMPENSAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            El programa ofrece diversos tipos de recompensas según la actividad y el rendimiento:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Tipo de Recompensa</th>
                  <th className="py-4 px-4 text-left">Descripción</th>
                  <th className="py-4 px-4 text-left">Cómo Obtenerla</th>
                  <th className="py-4 px-4 text-left">Valor Aproximado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Tokens NGIRO</td>
                  <td className="py-4 px-4">Moneda virtual del ecosistema deco-exchange</td>
                  <td className="py-4 px-4">Completar juegos y desafíos</td>
                  <td className="py-4 px-4">1 NGIRO ≈ $0.10 USD</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Descuentos en comisiones</td>
                  <td className="py-4 px-4">Reducción en tarifas de servicios</td>
                  <td className="py-4 px-4">Lograr objetivos en simuladores</td>
                  <td className="py-4 px-4">5% - 50% de descuento</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">NFTs coleccionables</td>
                  <td className="py-4 px-4">Activos digitales exclusivos</td>
                  <td className="py-4 px-4">Completar misiones especiales</td>
                  <td className="py-4 px-4">$5 - $100 USD</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Premios en efectivo</td>
                  <td className="py-4 px-4">Dinero real transferible</td>
                  <td className="py-4 px-4">Ganar torneos y competencias</td>
                  <td className="py-4 px-4">$10 - $1,000 USD</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Experiencia y niveles</td>
                  <td className="py-4 px-4">Puntos que determinan el nivel del usuario</td>
                  <td className="py-4 px-4">Participar en cualquier actividad</td>
                  <td className="py-4 px-4">Desbloquea nuevas funciones</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">4. NIVELES Y PROGRESIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            El programa Play to Earn cuenta con un sistema de niveles que determina el acceso a juegos, actividades y
            recompensas:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Nivel 1 (Novato):</strong> Acceso a juegos básicos y recompensas iniciales. Disponible para todos
              los usuarios registrados.
            </li>
            <li className="text-muted-foreground">
              <strong>Nivel 2 (Aprendiz):</strong> Desbloquea más juegos y mejores recompensas. Requiere 500 puntos de
              experiencia.
            </li>
            <li className="text-muted-foreground">
              <strong>Nivel 3 (Experto):</strong> Acceso a torneos exclusivos y recompensas premium. Requiere 2,000
              puntos de experiencia.
            </li>
            <li className="text-muted-foreground">
              <strong>Nivel 4 (Maestro):</strong> Participación en eventos especiales y máximas recompensas. Requiere
              5,000 puntos de experiencia.
            </li>
            <li className="text-muted-foreground">
              <strong>Nivel 5 (Leyenda):</strong> Beneficios exclusivos y acceso anticipado a nuevos juegos. Requiere
              10,000 puntos de experiencia.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">5. REQUISITOS DE PARTICIPACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para participar en el programa Play to Earn, los usuarios deben cumplir con los siguientes requisitos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Cuenta verificada:</strong> Tener una cuenta en DECO EXCHANGE con verificación KYC básica
              completada.
            </li>
            <li className="text-muted-foreground">
              <strong>Edad mínima:</strong> Ser mayor de 18 años (o la edad legal en su jurisdicción).
            </li>
            <li className="text-muted-foreground">
              <strong>Aceptación de términos:</strong> Aceptar los términos específicos del programa Play to Earn.
            </li>
            <li className="text-muted-foreground">
              <strong>Dispositivo compatible:</strong> Contar con un dispositivo que cumpla los requisitos técnicos
              mínimos para los juegos.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">6. CANJE DE RECOMPENSAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Las recompensas obtenidas en el programa pueden canjearse de las siguientes maneras:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Tokens NGIRO:</strong> Pueden convertirse a otras criptomonedas, utilizarse para pagar comisiones
              o canjearse por servicios en la plataforma.
            </li>
            <li className="text-muted-foreground">
              <strong>Descuentos:</strong> Se aplican automáticamente en las próximas transacciones según las
              condiciones específicas.
            </li>
            <li className="text-muted-foreground">
              <strong>NFTs:</strong> Pueden mantenerse como coleccionables, venderse en el marketplace de deco-exchange o
              intercambiarse con otros usuarios.
            </li>
            <li className="text-muted-foreground">
              <strong>Premios en efectivo:</strong> Se transfieren a la cuenta principal del usuario y pueden retirarse
              siguiendo los procedimientos estándar.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">7. TÉRMINOS ADICIONALES</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              DECO EXCHANGE se reserva el derecho de modificar, suspender o terminar el programa Play to Earn o
              cualquiera de sus componentes en cualquier momento, con previo aviso a los participantes.
            </li>
            <li className="text-muted-foreground">
              Las recompensas obtenidas tienen una validez de 12 meses desde su obtención, a menos que se especifique lo
              contrario.
            </li>
            <li className="text-muted-foreground">
              El uso de bots, scripts, trampas o cualquier método fraudulento para obtener recompensas resultará en la
              expulsión del programa y posible cierre de cuenta.
            </li>
            <li className="text-muted-foreground">
              Los usuarios son responsables de cualquier implicación fiscal derivada de las recompensas obtenidas, según
              las leyes de su jurisdicción.
            </li>
            <li className="text-muted-foreground">
              DECO EXCHANGE no garantiza la disponibilidad continua de todos los juegos y actividades, que pueden
              variar según factores técnicos, regulatorios o estratégicos.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre el programa Play to Earn o para resolver dudas específicas, por favor contáctenos
            a través del correo electrónico:{" "}
            <Link href="mailto:play2earn@example.invalid" className="text-primary hover:underline">
              play2earn@example.invalid
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            description="Información del programa Play to Earn"
            link={{
              text: "Ver más",
              href: "/legals/play-to-earn"
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Guía Play to Earn - ES"
              description="Descargar PDF"
              href="#"
            />

            <DownloadCard
              title="Guía Play to Earn - EN"
              description="Descargar PDF"
              href="#"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
