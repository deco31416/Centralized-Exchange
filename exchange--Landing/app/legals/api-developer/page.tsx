"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
export const dynamic = 'force-dynamic'; // Previene errores de prerender si hay lógica dinámica

import Breadcrumb from "@/components/common/legals/Breadcrumb";
import InfoCard from "@/components/common/legals/InfoCard";
import DownloadCard from "@/components/common/legals/DownloadCard";

export default function ApiDeveloperPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header */}
        <div className="legal-document-hero my-8 md:my-10">
          <p className="legal-document-title">DECO EXCHANGE</p>
          <h1 className="legal-document-eyebrow">API para desarrolladores</h1>
          <p className="legal-document-meta">Documentación API</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "API Developer", href: "/legals/api-developer", active: true },
          ]}
        />

        {/* Content */}
        <div className="space-y-12 mb-16">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Introducción a la API</h2>
              <span className="text-xl font-light">01-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-4">
                La API de deco-exchange proporciona a los desarrolladores acceso programático a nuestros servicios,
                permitiendo la integración de funcionalidades de transferencia de dinero, gestión de usuarios y
                operaciones financieras en aplicaciones de terceros.
              </p>
              <p className="mb-4">
                Nuestra API RESTful está diseñada siguiendo los estándares más actuales, con endpoints bien documentados
                y respuestas JSON estructuradas para facilitar su implementación.
              </p>
              <p>
                Para comenzar a utilizar nuestra API, los desarrolladores deben registrarse en el portal de
                desarrolladores y solicitar las credenciales de acceso correspondientes.
              </p>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Autenticación y seguridad</h2>
              <span className="text-xl font-light">02-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-4">
                La API de deco-exchange utiliza OAuth 2.0 para la autenticación, garantizando un acceso seguro a los
                recursos. El proceso de autenticación requiere:
              </p>
              <ul className="space-y-3 mb-4">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">•</span>
                  <div>
                    <strong className="font-medium">API Key:</strong> Identificador único asignado a cada desarrollador.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">•</span>
                  <div>
                    <strong className="font-medium">API Secret:</strong> Clave secreta que debe mantenerse segura.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 text-primary">•</span>
                  <div>
                    <strong className="font-medium">Access Token:</strong> Token temporal obtenido tras la autenticación.
                  </div>
                </li>
              </ul>
              <p className="mb-4">
                Todas las solicitudes deben enviarse por HTTPS incluyendo el Access Token en el encabezado:
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                <pre>{`Authorization: Bearer {access_token}`}</pre>
              </div>
              <p>
                Los tokens expiran y deben renovarse usando el refresh token entregado en la autenticación inicial.
              </p>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Endpoints principales</h2>
              <span className="text-xl font-light">03-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-4">La API de deco-exchange ofrece los siguientes endpoints principales:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4">Endpoint</th>
                      <th className="text-left py-2 px-4">Método</th>
                      <th className="text-left py-2 px-4">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/users</td>
                      <td className="py-2 px-4">GET, POST</td>
                      <td className="py-2 px-4">Gestión de usuarios</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/transfers</td>
                      <td className="py-2 px-4">GET, POST</td>
                      <td className="py-2 px-4">Transferencias de fondos</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/accounts</td>
                      <td className="py-2 px-4">GET, PUT</td>
                      <td className="py-2 px-4">Información de cuentas</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/rates</td>
                      <td className="py-2 px-4">GET</td>
                      <td className="py-2 px-4">Tasas de cambio</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-mono text-sm">/api/v1/transactions</td>
                      <td className="py-2 px-4">GET</td>
                      <td className="py-2 px-4">Historial de transacciones</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Puedes consultar más detalles sobre cada endpoint en la documentación oficial del portal para desarrolladores.
              </p>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Ejemplos de código</h2>
              <span className="text-xl font-light">04-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-4">A continuación se muestran ejemplos ficticios de uso de la API:</p>

              <h3 className="text-lg font-medium mb-2">JavaScript (Node.js)</h3>
              <div className="bg-muted p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
                <pre>{`// Código ficticio (no ejecuta llamadas reales)
const API_KEY = 'xxxxx--xxxxx';
const API_SECRET = 'xxxxx--xxxxx';

function getAccessToken() {
  return "mocked_access_token";
}

function getUserInfo(userId) {
  return {
    id: userId,
    name: "Usuario de prueba",
    email: "user@example.com"
  };
}`}</pre>
              </div>

              <h3 className="text-lg font-medium mb-2">Python</h3>
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{`# Código ficticio (sin peticiones reales)
def get_access_token():
    return "mocked_access_token"

def create_transfer(sender_id, recipient_id, amount, currency):
    return {
        "status": "success",
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "amount": amount,
        "currency": currency
    }`}</pre>
              </div>
            </div>
          </section>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InfoCard
            title="Portal de desarrolladores"
            description="Acceda a nuestro portal para desarrolladores para obtener más recursos y herramientas."
            link={{
              text: "Ir al portal",
              href: "https://developers.deco-exchange.com"
            }}
          />
          <InfoCard
            title="Sandbox de pruebas"
            description="Pruebe la API en nuestro entorno sandbox antes de implementarla en producción."
            link={{
              text: "Acceder al sandbox",
              href: "https://sandbox.deco-exchange.com",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DownloadCard
            title="Documentación completa"
            description="Manual detallado de la API con todos los endpoints y parámetros."
            fileSize="4.8 MB"
            fileType="PDF"
          />
          <DownloadCard
            title="SDK para desarrolladores"
            description="Kit de desarrollo de software para facilitar la integración con nuestra API."
            fileSize="12.5 MB"
            fileType="ZIP"
          />
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
