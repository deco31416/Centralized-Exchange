"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function DecoCustodyPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">DECO Custody</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Integraciones", href: "/" },
            { label: "DECO Custody", href: "/legals/deco-custody", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            DECO Custody es el servicio de custodia de activos digitales y tradicionales de DECO EXCHANGE, diseñado para
            ofrecer la máxima seguridad y confiabilidad para individuos e instituciones. A continuación, detallamos los
            términos y condiciones que rigen este servicio.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">TÉRMINOS Y CONDICIONES</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">1. DESCRIPCIÓN DEL SERVICIO</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO Custody ofrece servicios de custodia para los siguientes tipos de activos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Criptomonedas:</strong> Bitcoin, Ethereum, y otras criptomonedas principales.
            </li>
            <li className="text-muted-foreground">
              <strong>Tokens digitales:</strong> Tokens ERC-20, BEP-20 y otros estándares compatibles.
            </li>
            <li className="text-muted-foreground">
              <strong>Activos tokenizados:</strong> Representaciones digitales de activos tradicionales.
            </li>
            <li className="text-muted-foreground">
              <strong>Monedas fiduciarias:</strong> USD, EUR, COP y otras monedas principales.
            </li>
            <li className="text-muted-foreground">
              <strong>Metales preciosos digitales:</strong> Oro, plata y otros metales tokenizados.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">2. MODELOS DE CUSTODIA</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Custodia Institucional</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Solución para empresas y organizaciones</li>
                <li className="text-muted-foreground">Almacenamiento en frío (cold storage)</li>
                <li className="text-muted-foreground">Políticas de gobernanza personalizadas</li>
                <li className="text-muted-foreground">Seguros de alto valor</li>
                <li className="text-muted-foreground">Auditorías regulares</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Custodia Personal</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Solución para individuos</li>
                <li className="text-muted-foreground">Combinación de almacenamiento frío y caliente</li>
                <li className="text-muted-foreground">Acceso simplificado</li>
                <li className="text-muted-foreground">Seguro básico incluido</li>
                <li className="text-muted-foreground">Opciones de recuperación de acceso</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">3. SEGURIDAD Y PROTECCIÓN</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO Custody implementa las siguientes medidas de seguridad para proteger los activos bajo custodia:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Almacenamiento en frío:</strong> Más del 95% de los activos se mantienen en billeteras frías
              desconectadas de internet.
            </li>
            <li className="text-muted-foreground">
              <strong>Distribución geográfica:</strong> Las claves privadas se distribuyen en múltiples ubicaciones
              físicas seguras.
            </li>
            <li className="text-muted-foreground">
              <strong>Esquema MPC (Multi-Party Computation):</strong> Tecnología de firma distribuida que elimina puntos
              únicos de fallo.
            </li>
            <li className="text-muted-foreground">
              <strong>Autenticación multifactor:</strong> Múltiples capas de autenticación para acceder a los activos.
            </li>
            <li className="text-muted-foreground">
              <strong>Seguros:</strong> Cobertura de seguro proporcionada por aseguradoras de primer nivel.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">4. TARIFAS Y COMISIONES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Servicio</th>
                  <th className="py-4 px-4 text-left">Tarifa Institucional</th>
                  <th className="py-4 px-4 text-left">Tarifa Personal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Custodia de criptomonedas</td>
                  <td className="py-4 px-4">0.5% anual</td>
                  <td className="py-4 px-4">1% anual</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Custodia de monedas fiduciarias</td>
                  <td className="py-4 px-4">0.3% anual</td>
                  <td className="py-4 px-4">0.5% anual</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Custodia de metales preciosos digitales</td>
                  <td className="py-4 px-4">0.4% anual</td>
                  <td className="py-4 px-4">0.8% anual</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Transacciones entrantes</td>
                  <td className="py-4 px-4">Sin costo</td>
                  <td className="py-4 px-4">Sin costo</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Transacciones salientes</td>
                  <td className="py-4 px-4">0.1% (mín. $10 USD)</td>
                  <td className="py-4 px-4">0.2% (mín. $5 USD)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">5. RESPONSABILIDADES DEL CLIENTE</h3>

          <p className="text-muted-foreground leading-relaxed">
            Al utilizar DECO Custody, el cliente acepta las siguientes responsabilidades:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              Proporcionar información precisa y actualizada durante el proceso de registro y KYC.
            </li>
            <li className="text-muted-foreground">
              Mantener la confidencialidad de sus credenciales de acceso y dispositivos de autenticación.
            </li>
            <li className="text-muted-foreground">
              Notificar inmediatamente a DECO EXCHANGE de cualquier acceso no autorizado o actividad sospechosa.
            </li>
            <li className="text-muted-foreground">
              Cumplir con todas las leyes y regulaciones aplicables relacionadas con los activos bajo custodia.
            </li>
            <li className="text-muted-foreground">
              Verificar cuidadosamente las direcciones de destino antes de solicitar retiros o transferencias.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">6. LIMITACIÓN DE RESPONSABILIDAD</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE se compromete a implementar las mejores prácticas de seguridad para proteger los activos bajo
            custodia, pero no será responsable de:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              Pérdidas resultantes de fluctuaciones en el valor de mercado de los activos custodiados.
            </li>
            <li className="text-muted-foreground">
              Pérdidas derivadas de eventos de fuerza mayor, incluyendo desastres naturales, guerras o actos
              terroristas.
            </li>
            <li className="text-muted-foreground">
              Pérdidas causadas por el incumplimiento del cliente de estos términos y condiciones.
            </li>
            <li className="text-muted-foreground">
              Interrupciones temporales del servicio debido a mantenimiento programado o emergencias técnicas.
            </li>
          </ul>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre DECO Custody o para solicitar una demostración, por favor contáctenos a través del
            correo electrónico:{" "}
            <Link href="mailto:contacto@deco31416.com" className="text-primary hover:underline">
              contacto@deco31416.com
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            description="Integración del servicio DECO Custody"
            link={{
              text: "Ver detalles",
              href: "/legals/deco-custody"
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Términos DECO Custody - ES"
              description="Descargar PDF"
              href="#"
            />

            <DownloadCard
              title="Términos DECO Custody - EN"
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
