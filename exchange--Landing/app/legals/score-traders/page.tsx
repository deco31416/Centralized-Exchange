"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function ScoreTradersPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Score Traders</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Programas", href: "/" },
            { label: "Score Traders", href: "/score-traders", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            Score Traders es un programa exclusivo de DECO EXCHANGE diseñado para reconocer y recompensar a los
            operadores más exitosos en nuestra plataforma de trading. Este programa evalúa el rendimiento de los
            traders, asigna puntuaciones y ofrece beneficios especiales a aquellos que demuestran habilidades
            consistentes en el mercado.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS DEL PROGRAMA</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL PROGRAMA</h3>

          <p className="text-muted-foreground leading-relaxed">
            Score Traders evalúa el desempeño de los operadores en la plataforma de trading de DECO EXCHANGE utilizando
            un algoritmo propietario que considera múltiples factores para asignar una puntuación. Esta puntuación
            determina el nivel del trader y los beneficios a los que puede acceder.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">2. CRITERIOS DE EVALUACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            La puntuación de Score Traders se calcula considerando los siguientes factores:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Factor</th>
                  <th className="py-4 px-4 text-left">Descripción</th>
                  <th className="py-4 px-4 text-left">Peso</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Rentabilidad</td>
                  <td className="py-4 px-4">Retorno sobre la inversión (ROI) mensual y anual</td>
                  <td className="py-4 px-4">30%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Gestión de riesgos</td>
                  <td className="py-4 px-4">Ratio de Sharpe, drawdown máximo, uso de stop loss</td>
                  <td className="py-4 px-4">25%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Consistencia</td>
                  <td className="py-4 px-4">Estabilidad de resultados a lo largo del tiempo</td>
                  <td className="py-4 px-4">20%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Volumen de operaciones</td>
                  <td className="py-4 px-4">Cantidad y volumen de transacciones realizadas</td>
                  <td className="py-4 px-4">15%</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Diversificación</td>
                  <td className="py-4 px-4">Variedad de instrumentos y mercados operados</td>
                  <td className="py-4 px-4">10%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. NIVELES Y BENEFICIOS</h3>

          <p className="text-muted-foreground leading-relaxed">
            En función de la puntuación obtenida, los traders se clasifican en los siguientes niveles:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Bronce</h4>
              <p className="text-sm text-muted-foreground mb-2">Puntuación: 0-500</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Comisiones estándar</li>
                <li className="text-muted-foreground">Acceso a webinars mensuales</li>
                <li className="text-muted-foreground">Soporte estándar</li>
                <li className="text-muted-foreground">Análisis básico de rendimiento</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Plata</h4>
              <p className="text-sm text-muted-foreground mb-2">Puntuación: 501-750</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">10% descuento en comisiones</li>
                <li className="text-muted-foreground">Acceso a seminarios exclusivos</li>
                <li className="text-muted-foreground">Soporte prioritario</li>
                <li className="text-muted-foreground">Análisis detallado de rendimiento</li>
                <li className="text-muted-foreground">Alertas de mercado personalizadas</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Nivel Oro</h4>
              <p className="text-sm text-muted-foreground mb-2">Puntuación: 751-900</p>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">25% descuento en comisiones</li>
                <li className="text-muted-foreground">Acceso a eventos VIP</li>
                <li className="text-muted-foreground">Soporte VIP 24/7</li>
                <li className="text-muted-foreground">Análisis avanzado de rendimiento</li>
                <li className="text-muted-foreground">Acceso a estrategias exclusivas</li>
                <li className="text-muted-foreground">Programa de mentoría</li>
              </ul>
            </div>
          </div>

          <div className="border border-white/20 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-medium mb-2">Nivel Platino</h4>
            <p className="text-sm text-muted-foreground mb-2">Puntuación: 901-1000</p>
            <ul className="list-disc pl-6 space-y-1">
              <li className="text-muted-foreground">50% descuento en comisiones</li>
              <li className="text-muted-foreground">Invitaciones a eventos exclusivos con ejecutivos</li>
              <li className="text-muted-foreground">Gestor de cuenta personal</li>
              <li className="text-muted-foreground">Análisis predictivo de rendimiento</li>
              <li className="text-muted-foreground">Acceso anticipado a nuevos productos</li>
              <li className="text-muted-foreground">Oportunidades para convertirse en trader financiado</li>
              <li className="text-muted-foreground">Participación en programa de embajadores</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">4. PERÍODO DE EVALUACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            La evaluación y actualización de puntuaciones se realiza de la siguiente manera:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Evaluación mensual:</strong> La puntuación se actualiza el primer día de cada mes, considerando el
              desempeño del mes anterior.
            </li>
            <li className="text-muted-foreground">
              <strong>Período mínimo:</strong> Se requiere un mínimo de 3 meses de actividad para obtener una puntuación
              inicial.
            </li>
            <li className="text-muted-foreground">
              <strong>Historial móvil:</strong> La puntuación considera los últimos 12 meses de actividad, con mayor
              peso en los meses más recientes.
            </li>
            <li className="text-muted-foreground">
              <strong>Notificaciones:</strong> Los traders reciben notificaciones sobre cambios en su puntuación y
              nivel.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">5. REQUISITOS DE PARTICIPACIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            Para participar en el programa Score Traders, los usuarios deben cumplir con los siguientes requisitos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Cuenta activa:</strong> Tener una cuenta Trader activa en DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              <strong>Volumen mínimo:</strong> Realizar un mínimo de 10 operaciones mensuales.
            </li>
            <li className="text-muted-foreground">
              <strong>Capital mínimo:</strong> Mantener un saldo promedio mensual de al menos $1,000 USD.
            </li>
            <li className="text-muted-foreground">
              <strong>Verificación completa:</strong> Tener el proceso de verificación KYC completado.
            </li>
            <li className="text-muted-foreground">
              <strong>Cumplimiento:</strong> No haber infringido los términos y condiciones de la plataforma.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">6. PROGRAMA DE TRADERS FINANCIADOS</h3>

          <p className="text-muted-foreground leading-relaxed">
            Los traders que alcancen y mantengan el nivel Platino durante al menos 3 meses consecutivos pueden ser
            elegibles para el Programa de Traders Financiados, que ofrece:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Capital de trading:</strong> Acceso a capital de trading proporcionado por DECO EXCHANGE.
            </li>
            <li className="text-muted-foreground">
              <strong>Reparto de beneficios:</strong> Participación en los beneficios generados (70% para el trader, 30%
              para DECO EXCHANGE).
            </li>
            <li className="text-muted-foreground">
              <strong>Escalabilidad:</strong> Posibilidad de aumentar el capital asignado según el rendimiento.
            </li>
            <li className="text-muted-foreground">
              <strong>Mentoría avanzada:</strong> Acceso a mentores profesionales y traders institucionales.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">7. TÉRMINOS ADICIONALES</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              DECO EXCHANGE se reserva el derecho de modificar los criterios de evaluación, niveles y beneficios del
              programa con previo aviso a los participantes.
            </li>
            <li className="text-muted-foreground">
              La participación en el programa es automática para todos los usuarios de la Cuenta Trader, pero pueden
              optar por no participar contactando al servicio de atención al cliente.
            </li>
            <li className="text-muted-foreground">
              Las puntuaciones y niveles son confidenciales y solo visibles para el titular de la cuenta.
            </li>
            <li className="text-muted-foreground">
              DECO EXCHANGE puede utilizar datos anónimos y agregados del programa con fines estadísticos y de mejora
              del servicio.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre el programa Score Traders o para consultar tu puntuación actual, por favor
            contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:scoretraders@deco-exchange.com" className="text-primary hover:underline">
              scoretraders@deco-exchange.com
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
              title="Guía Score Traders - ES"
              description="Descargar PDF"
              href="/downloads/score-traders-es.pdf"
            />

            <DownloadCard
              title="Guía Score Traders - EN"
              description="Descargar PDF"
              href="/downloads/score-traders-en.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
