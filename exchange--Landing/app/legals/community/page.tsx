"use client";

import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import InfoCard from "@/components/common/legals/InfoCard"
import Link from "next/link"

export default function CommunityPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />

      {/* Main Content */}
      <div className="legal-document-container">
        {/* Header */}
        <div className="legal-document-hero my-8 md:my-10">
          <p className="legal-document-title">DECO EXCHANGE</p>
          <h1 className="legal-document-eyebrow">Comunidad</h1>
          <p className="legal-document-meta">Conecta, aprende y comparte</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Comunidad", href: "/community" },
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <div className="bg-card text-card-foreground rounded-lg border mb-12 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Únete a nuestra comunidad global</h2>
              <p className="text-muted-foreground mb-6">
                Forma parte de una red de usuarios de deco-exchange en todo el mundo. Comparte experiencias, obtén consejos
                y mantente al día con las últimas novedades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#forums"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md text-center hover:bg-primary/90 transition-colors"
                >
                  Explorar foros
                </Link>
                <Link
                  href="#events"
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md text-center hover:bg-secondary/90 transition-colors"
                >
                  Ver eventos
                </Link>
              </div>
            </div>
            <div className="bg-muted relative h-64 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/placeholder.svg?key=9dckz"
                    alt="Comunidad deco-exchange"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">120K+</div>
            <div className="text-sm text-muted-foreground">Usuarios activos</div>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">85+</div>
            <div className="text-sm text-muted-foreground">Países</div>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">25K+</div>
            <div className="text-sm text-muted-foreground">Temas de discusión</div>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Eventos anuales</div>
          </div>
        </div>

        {/* Forums Section */}
        <section id="forums" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Foros de discusión</h2>
            <Link href="/community/forums" className="text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Transferencias y Pagos</h3>
                    <p className="text-xs text-muted-foreground">3.2k miembros</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Activo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Discusiones sobre transferencias nacionales e internacionales, métodos de pago y solución de problemas.
              </p>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+42</span>
                  </div>
                </div>
                <Link
                  href="/community/forums/transfers"
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-colors"
                >
                  Unirse
                </Link>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">DECOToken</h3>
                    <p className="text-xs text-muted-foreground">2.8k miembros</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Activo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Todo sobre DECOToken: uso, beneficios, casos de uso y novedades sobre nuestra moneda digital
                respaldada.
              </p>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+36</span>
                  </div>
                </div>
                <Link
                  href="/community/forums/deco-token"
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-colors"
                >
                  Unirse
                </Link>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" className="text-primary" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Seguridad y Privacidad</h3>
                    <p className="text-xs text-muted-foreground">1.9k miembros</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Activo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Discusiones sobre mejores prácticas de seguridad, protección de cuenta y prevención de fraudes.
              </p>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+28</span>
                  </div>
                </div>
                <Link
                  href="/community/forums/security"
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-colors"
                >
                  Unirse
                </Link>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                      <path d="M9 22h6" />
                      <path d="M16 5.2V2" />
                      <path d="M8 5.2V2" />
                      <circle cx="18" cy="18" r="3" />
                      <path d="M18 13.5V18h4.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Programas y Promociones</h3>
                    <p className="text-xs text-muted-foreground">1.5k miembros</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Activo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Información y discusiones sobre programas de referidos, Play to Earn, Lee y Gana y otras promociones.
              </p>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+22</span>
                  </div>
                </div>
                <Link
                  href="/community/forums/programs"
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-colors"
                >
                  Unirse
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Discussions */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Discusiones recientes</h2>
            <Link href="/community/discussions" className="text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="bg-card border rounded-lg divide-y">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-medium">Consejos para transferencias internacionales más económicas</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Por Carlos M.</span>
                        <span className="mx-2">•</span>
                        <span>Hace 2 horas</span>
                        <span className="mx-2">•</span>
                        <span>Transferencias y Pagos</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">42 respuestas</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Quería compartir algunos consejos que he descubierto para reducir las comisiones en transferencias
                    internacionales. He estado usando DECOToken como intermediario y...
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M7 10v12" />
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                      </svg>
                      128
                    </button>
                    <button className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M17 14V2" />
                        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                      </svg>
                      12
                    </button>
                    <button className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-medium">¿Cómo funciona exactamente el respaldo de DECOToken?</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Por Ana L.</span>
                        <span className="mx-2">•</span>
                        <span>Hace 5 horas</span>
                        <span className="mx-2">•</span>
                        <span>DECOToken</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">36 respuestas</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Estoy interesada en utilizar DECOToken pero me gustaría entender mejor cómo funciona el respaldo.
                    ¿Alguien podría explicar en términos sencillos cómo se garantiza su valor?
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M7 10v12" />
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                      </svg>
                      95
                    </button>
                    <button className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M17 14V2" />
                        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                      </svg>
                      8
                    </button>
                    <button className="flex items-center text-xs text-muted-foreground hover:text-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Próximos eventos</h2>
            <Link href="/community/events" className="text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img
                  src="/placeholder.svg?height=200&width=400&query=webinar about digital finance"
                  alt="Webinar sobre finanzas digitales"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                  Webinar
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-medium mb-2">El futuro de las finanzas digitales</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  15 de junio, 2023 - 18:00 GMT
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Únete a nuestros expertos para discutir las tendencias emergentes en finanzas digitales y el papel de
                  servicios como deco-exchange.
                </p>
                <Link
                  href="/community/events/digital-finance"
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm text-center inline-block hover:bg-primary/90 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img
                  src="/placeholder.svg?height=200&width=400&query=workshop about international transfers"
                  alt="Taller sobre transferencias internacionales"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                  Taller
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-medium mb-2">Optimizando transferencias internacionales</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  22 de junio, 2023 - 15:00 GMT
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Aprende estrategias prácticas para reducir costos y tiempos en tus transferencias internacionales con
                  deco-exchange.
                </p>
                <Link
                  href="/community/events/international-transfers"
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm text-center inline-block hover:bg-primary/90 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img
                  src="/placeholder.svg?height=200&width=400&query=meetup of financial technology users"
                  alt="Encuentro de usuarios"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                  Encuentro
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-medium mb-2">Encuentro de usuarios deco-exchange</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  30 de junio, 2023 - 17:00 GMT
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecta con otros usuarios de deco-exchange en este encuentro virtual para compartir experiencias y
                  establecer contactos.
                </p>
                <Link
                  href="/community/events/user-meetup"
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm text-center inline-block hover:bg-primary/90 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Community Leaders */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Líderes de la comunidad</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4"></div>
              <h3 className="font-medium">María González</h3>
              <p className="text-sm text-muted-foreground mb-2">Moderadora Senior</p>
              <p className="text-xs text-muted-foreground">Transferencias y Pagos</p>
            </div>
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4"></div>
              <h3 className="font-medium">Juan Pérez</h3>
              <p className="text-sm text-muted-foreground mb-2">Embajador</p>
              <p className="text-xs text-muted-foreground">DECOToken</p>
            </div>
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4"></div>
              <h3 className="font-medium">Laura Martínez</h3>
              <p className="text-sm text-muted-foreground mb-2">Moderadora</p>
              <p className="text-xs text-muted-foreground">Seguridad y Privacidad</p>
            </div>
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4"></div>
              <h3 className="font-medium">Roberto Silva</h3>
              <p className="text-sm text-muted-foreground mb-2">Embajador</p>
              <p className="text-xs text-muted-foreground">Programas y Promociones</p>
            </div>
          </div>
        </section>

        {/* Join Community */}
        <div className="bg-card border rounded-lg p-8 mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Únete a nuestra comunidad hoy</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Forma parte de una red global de usuarios de deco-exchange. Comparte experiencias, aprende de otros y
              mantente al día con las últimas novedades.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              href="/community/register"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md text-center hover:bg-primary/90 transition-colors"
            >
              Crear cuenta
            </Link>
            <Link
              href="/community/login"
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md text-center hover:bg-secondary/90 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InfoCard
            title="Base de conocimientos"
            description="Explore nuestra extensa base de conocimientos con artículos detallados sobre todos nuestros servicios."
            link={{
              text: "Explorar artículos",
              href: "/knowledge-base",
            }}
          />
          
          <InfoCard
            title="Centro de ayuda"
            description="Accede a nuestro centro de ayuda para obtener soporte y resolver cualquier problema que puedas tener."
            link={{
              text: "Obtener ayuda",
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
