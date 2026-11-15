"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import InfoCard from "@/components/common/legals/InfoCard"

export default function ContactoPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header */}
        <div className="legal-document-hero my-8 md:my-10">
          <p className="legal-document-title">DECO EXCHANGE</p>
          <h1 className="legal-document-eyebrow">Contacto</h1>
          <p className="legal-document-meta">Comunicación directa</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Contacto", href: "/contacto" },
          ]}
          className="mb-8"
        />

        {/* Content */}
        <div className="space-y-12 mb-16">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Información de contacto</h2>
              <span className="text-xl font-light">01-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Sede principal</h3>
                  <p className="mb-1">Calle 93 # 11-30, Oficina 401</p>
                  <p className="mb-1">Bogotá, Colombia</p>
                  <p className="mb-4">Código Postal: 110221</p>

                  <h3 className="text-lg font-medium mb-3">Horario de atención</h3>
                  <p className="mb-1">Lunes a viernes: 8:00 AM - 6:00 PM</p>
                  <p>Sábados: 9:00 AM - 1:00 PM</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Teléfonos</h3>
                  <p className="mb-1">Colombia: +57 601 123 4567</p>
                  <p className="mb-1">Internacional: +1 305 987 6543</p>
                  <p className="mb-4">WhatsApp: +57 300 123 4567</p>

                  <h3 className="text-lg font-medium mb-3">Correo electrónico</h3>
                  <p className="mb-1">General: info@deco-exchange.com</p>
                  <p className="mb-1">Soporte: contacto@deco31416.com</p>
                  <p>Legal: contacto@deco31416.com</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Formulario de contacto</h2>
              <span className="text-xl font-light">02-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-6">
                Complete el siguiente formulario y nos pondremos en contacto con usted a la brevedad posible.
              </p>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ingrese su nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="nombre@example.invalid"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="asunto" className="block text-sm font-medium mb-1">
                      Asunto *
                    </label>
                    <select
                      id="asunto"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Seleccione un asunto</option>
                      <option value="soporte">Soporte técnico</option>
                      <option value="consulta">Consulta general</option>
                      <option value="reclamo">Reclamo</option>
                      <option value="sugerencia">Sugerencia</option>
                      <option value="comercial">Información comercial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium mb-1">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    rows={5}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Escriba su mensaje aquí..."
                    required
                  ></textarea>
                </div>

                <div className="flex items-start">
                  <input type="checkbox" id="terminos" className="mt-1 mr-2" required />
                  <label htmlFor="terminos" className="text-sm">
                    Acepto la{" "}
                    <a href="/legals/privacy" className="text-primary hover:underline">
                      Política de Privacidad
                    </a>{" "}
                    y el tratamiento de mis datos personales.
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Enviar mensaje
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Oficinas internacionales</h2>
              <span className="text-xl font-light">03-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Panamá (Próximamente)</h3>
                  <p className="text-sm text-muted-foreground mb-1">Calle 50, Edificio Global Plaza</p>
                  <p className="text-sm text-muted-foreground mb-1">Ciudad de Panamá, Panamá</p>
                  <p className="text-sm text-muted-foreground">Tel: +507 XXX XXXX</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">México (Próximamente)</h3>
                  <p className="text-sm text-muted-foreground mb-1">Av. Paseo de la Reforma 222</p>
                  <p className="text-sm text-muted-foreground mb-1">Ciudad de México, México</p>
                  <p className="text-sm text-muted-foreground">Tel: +52 55 XXXX XXXX</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Miami (Próximamente)</h3>
                  <p className="text-sm text-muted-foreground mb-1">1001 Brickell Bay Drive</p>
                  <p className="text-sm text-muted-foreground mb-1">Miami, FL 33131, USA</p>
                  <p className="text-sm text-muted-foreground">Tel: +1 305 XXX XXXX</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Redes sociales</h2>
              <span className="text-xl font-light">04-</span>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg border">
              <p className="mb-6">
                Síganos en nuestras redes sociales para mantenerse actualizado sobre nuestros servicios, promociones y
                noticias:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="https://facebook.com/deco-exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span>Facebook</span>
                </a>

                <a
                  href="https://twitter.com/deco-exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                  <span>Twitter</span>
                </a>

                <a
                  href="https://instagram.com/deco-exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>Instagram</span>
                </a>

                <a
                  href="https://linkedin.com/company/deco-exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard
            title="Preguntas frecuentes"
            description="Consulte nuestra sección de preguntas frecuentes para resolver dudas comunes."
            link={{
              text: "Ver FAQ",
              href: "/help-center#faq",
            }}
          />
          <InfoCard
            title="Soporte técnico"
            description="Obtenga asistencia técnica especializada para resolver problemas con nuestros servicios."
            link={{
              text: "Contactar soporte",
              href: "/legals/help-center",
            }}
          />
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
