"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function LeeYGanaPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Lee y Gana</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Programas", href: "/" },
            { label: "Lee y Gana", href: "/lee-y-gana", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            El programa Lee y Gana de DECO EXCHANGE es una iniciativa educativa que recompensa a los usuarios por
            aprender sobre finanzas, economía, trading, criptomonedas y otros temas relacionados. A través de la lectura
            de artículos, libros electrónicos, informes y la participación en evaluaciones, los usuarios pueden obtener
            conocimientos valiosos mientras ganan recompensas.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS DEL PROGRAMA</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL PROGRAMA</h3>

          <p className="text-muted-foreground leading-relaxed">
            Lee y Gana ofrece una biblioteca digital de contenidos educativos sobre temas financieros. Los usuarios
            pueden acceder a estos materiales, estudiarlos y demostrar su comprensión a través de evaluaciones. Al
            completar satisfactoriamente estas evaluaciones, reciben puntos, tokens y otros beneficios que pueden
            canjearse por recompensas tangibles.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">2. CONTENIDOS DISPONIBLES</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Artículos y Guías</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Conceptos básicos de finanzas</li>
                <li className="text-muted-foreground">Estrategias de trading</li>
                <li className="text-muted-foreground">Análisis técnico y fundamental</li>
                <li className="text-muted-foreground">Gestión de riesgos</li>
                <li className="text-muted-foreground">Actualidad financiera</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">E-Books</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Guías completas por temas</li>
                <li className="text-muted-foreground">Manuales de plataformas</li>
                <li className="text-muted-foreground">Historias de éxito</li>
                <li className="text-muted-foreground">Tendencias del mercado</li>
                <li className="text-muted-foreground">Psicología del trading</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Cursos Interactivos</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Módulos progresivos</li>
                <li className="text-muted-foreground">Ejercicios prácticos</li>
                <li className="text-muted-foreground">Simulaciones de mercado</li>
                <li className="text-muted-foreground">Casos de estudio</li>
                <li className="text-muted-foreground">Certificaciones</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Informes y Análisis</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Informes de mercado</li>
                <li className="text-muted-foreground">Análisis de criptomonedas</li>
                <li className="text-muted-foreground">Tendencias económicas</li>
                <li className="text-muted-foreground">Oportunidades de inversión</li>
                <li className="text-muted-foreground">Estudios de caso</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. SISTEMA DE RECOMPENSAS</h3>

          <p className="text-muted-foreground leading-relaxed">
            El programa ofrece diferentes tipos de recompensas según el contenido completado y el rendimiento en las
            evaluaciones:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Actividad</th>
                  <th className="py-4 px-4 text-left">Recompensa</th>
                  <th className="py-4 px-4 text-left">Requisito</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Leer un artículo</td>
                  <td className="py-4 px-4">5 puntos + 1 NGIRO</td>
                  <td className="py-4 px-4">Completar cuestionario básico</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Completar un e-book</td>
                  <td className="py-4 px-4">20 puntos + 5 NGIRO</td>
                  <td className="py-4 px-4">Aprobar evaluación con 70%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Finalizar un curso</td>
                  <td className="py-4 px-4">50 puntos + 15 NGIRO + Certificado</td>
                  <td className="py-4 px-4">Completar todos los módulos y examen final</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Analizar un informe</td>
                  <td className="py-4 px-4">15 puntos + 3 NGIRO</td>
                  <td className="py-4 px-4">Completar análisis crítico</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Racha semanal</td>
                  <td className="py-4 px-4">Bonus de 25 puntos + 10 NGIRO</td>
                  <td className="py-4 px-4">Leer contenido 5 días consecutivos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">4. NIVELES EDUCATIVOS</h3>

          <p className="text-muted-foreground leading-relaxed">
            El programa Lee y Gana clasifica los contenidos en diferentes niveles según su complejidad:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Nivel Básico:</strong> Contenidos introductorios accesibles para todos los usuarios. Conceptos
              fundamentales y explicaciones sencillas.
            </li>
            <li className="text-muted-foreground">
              <strong>Nivel Intermedio:</strong> Contenidos que requieren conocimientos previos básicos. Análisis más
              detallados y conceptos más complejos.
            </li>
            <li className="text-muted-foreground">
              <strong>Nivel Avanzado:</strong> Contenidos especializados para usuarios con conocimientos sólidos.
              Estrategias sofisticadas y análisis profundos.
            </li>
            <li className="text-muted-foreground">
              <strong>Nivel Experto:</strong> Contenidos de alta complejidad para profesionales y traders
              experimentados. Técnicas avanzadas y análisis especializados.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">5. RUTAS DE APRENDIZAJE</h3>

          <p className="text-muted-foreground leading-relaxed">
            El programa ofrece rutas de aprendizaje temáticas que guían al usuario a través de una secuencia lógica de
            contenidos:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Ruta Trading</h4>
              <p className="text-sm text-muted-foreground mb-2">10 módulos | Recompensa final: 100 NGIRO</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Fundamentos del trading</li>
                <li className="text-muted-foreground">Análisis técnico</li>
                <li className="text-muted-foreground">Gestión de capital</li>
                <li className="text-muted-foreground">Psicología del trading</li>
                <li className="text-muted-foreground">Estrategias avanzadas</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Ruta Cripto</h4>
              <p className="text-sm text-muted-foreground mb-2">8 módulos | Recompensa final: 80 NGIRO</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Blockchain básico</li>
                <li className="text-muted-foreground">Principales criptomonedas</li>
                <li className="text-muted-foreground">DeFi y finanzas descentralizadas</li>
                <li className="text-muted-foreground">NFTs y tokens</li>
                <li className="text-muted-foreground">Seguridad en cripto</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Ruta Inversiones</h4>
              <p className="text-sm text-muted-foreground mb-2">12 módulos | Recompensa final: 120 NGIRO</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Fundamentos de inversión</li>
                <li className="text-muted-foreground">Clases de activos</li>
                <li className="text-muted-foreground">Construcción de portafolios</li>
                <li className="text-muted-foreground">Estrategias de diversificación</li>
                <li className="text-muted-foreground">Planificación financiera</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">6. REQUISITOS DE PARTICIPACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para participar en el programa Lee y Gana, los usuarios deben cumplir con los siguientes requisitos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Cuenta registrada:</strong> Tener una cuenta activa en DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              <strong>Perfil completo:</strong> Completar la información básica del perfil de usuario.
            </li>
            <li className="text-muted-foreground">
              <strong>Aceptación de términos:</strong> Aceptar los términos específicos del programa Lee y Gana.
            </li>
            <li className="text-muted-foreground">
              <strong>Evaluaciones honestas:</strong> Comprometerse a realizar las evaluaciones de manera honesta, sin
              utilizar métodos fraudulentos.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">7. CONTRIBUCIÓN DE CONTENIDOS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Los usuarios avanzados pueden contribuir con contenidos al programa Lee y Gana:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Creación de artículos:</strong> Los usuarios pueden enviar artículos originales para su revisión y
              posible publicación.
            </li>
            <li className="text-muted-foreground">
              <strong>Traducción de contenidos:</strong> Posibilidad de traducir contenidos existentes a otros idiomas.
            </li>
            <li className="text-muted-foreground">
              <strong>Revisión por pares:</strong> Participación en la revisión y mejora de contenidos de otros
              usuarios.
            </li>
            <li className="text-muted-foreground">
              <strong>Recompensas por contribución:</strong> Los creadores de contenido reciben recompensas especiales
              basadas en la calidad y popularidad de sus contribuciones.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">8. TÉRMINOS ADICIONALES</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              DECO EXCHANGE se reserva el derecho de modificar, añadir o eliminar contenidos del programa en cualquier
              momento.
            </li>
            <li className="text-muted-foreground">
              Las recompensas obtenidas tienen una validez de 12 meses desde su obtención, a menos que se especifique lo
              contrario.
            </li>
            <li className="text-muted-foreground">
              El uso de métodos fraudulentos para completar evaluaciones resultará en la suspensión del programa y
              posible pérdida de recompensas acumuladas.
            </li>
            <li className="text-muted-foreground">
              Los contenidos del programa son propiedad intelectual de DECO EXCHANGE o sus colaboradores y no pueden
              ser reproducidos o distribuidos sin autorización.
            </li>
            <li className="text-muted-foreground">
              La información proporcionada en los contenidos educativos tiene fines informativos y no constituye
              asesoramiento financiero o de inversión.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre el programa Lee y Gana o para resolver dudas específicas, por favor contáctenos a
            través del correo electrónico:{" "}
            <Link href="mailto:educacion@deco-exchange.com" className="text-primary hover:underline">
              educacion@deco-exchange.com
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
            <DownloadCard
              title="Catálogo de Contenidos - ES"
              description="Descargar PDF"
              href="/downloads/catalogo-lee-y-gana.pdf"
            />

            <DownloadCard
              title="Guía Lee y Gana - ES"
              description="Descargar PDF"
              href="/downloads/lee-y-gana-es.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
