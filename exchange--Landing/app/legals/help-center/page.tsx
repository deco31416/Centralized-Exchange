"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import InfoCard from "@/components/common/legals/InfoCard"
import DownloadCard from "@/components/common/legals/DownloadCard"
import { SupportTeamSelector } from "@/components/common/legals/support-team-selector"
import Link from "next/link"

export default function HelpCenterPage() {
  const openSupport = (view: "home" | "chat" | "ticket") => {
    window.dispatchEvent(new CustomEvent("deco:support", { detail: { view } }))
  }

  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header */}
        <div className="legal-document-hero my-8 md:my-10">
          <p className="legal-document-title">DECO EXCHANGE</p>
          <h1 className="legal-document-eyebrow">Centro de ayuda</h1>
          <p className="legal-document-meta">Soporte y asistencia</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Centro de Ayuda", href: "/legals/help-center" },
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <div className="mb-14 overflow-hidden rounded-[var(--radius)] border border-border bg-card text-card-foreground shadow-[0_24px_70px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.08)] dark:bg-[#050505] dark:shadow-none">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <h2 className="mb-5 text-3xl font-black tracking-normal text-foreground md:text-5xl">¿Cómo podemos ayudarte hoy?</h2>
              <p className="mb-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Nuestro equipo de soporte está disponible 24/7 para resolver todas tus dudas y ayudarte con cualquier
                problema que puedas tener.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#canales-soporte"
                  className="rounded-full bg-[#ff6c02] px-6 py-3 text-center text-sm font-bold text-white shadow-[0_16px_36px_rgba(255,108,2,0.22)] transition-colors hover:bg-[#e85f00]"
                >
                  Contactar soporte
                </Link>
                <Link
                  href="#faq"
                  className="rounded-full border border-border bg-background px-6 py-3 text-center text-sm font-bold text-foreground transition-colors hover:bg-accent"
                >
                  Ver preguntas frecuentes
                </Link>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <SupportTeamSelector />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-14">
          <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Acceso rápido</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Link href="#faq" className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-6 text-center shadow-[0_20px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-white/[0.035] dark:shadow-none dark:hover:bg-white/[0.055]">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
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
                    className="text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>
                <h3 className="font-bold">FAQ</h3>
              </div>
            </Link>
            <Link
              href="#tutoriales"
              className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-6 text-center shadow-[0_20px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-white/[0.035] dark:shadow-none dark:hover:bg-white/[0.055]"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
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
                    className="text-primary"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3 className="font-bold">Tutoriales</h3>
              </div>
            </Link>
            <Link
              href="#problemas"
              className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-6 text-center shadow-[0_20px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-white/[0.035] dark:shadow-none dark:hover:bg-white/[0.055]"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
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
                    className="text-primary"
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="font-bold">Solución de problemas</h3>
              </div>
            </Link>
            <Link
              href="/legals/knowledge-base"
              className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-6 text-center shadow-[0_20px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-white/[0.035] dark:shadow-none dark:hover:bg-white/[0.055]"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
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
                    className="text-primary"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                </div>
                <h3 className="font-bold">Base de conocimientos</h3>
              </div>
            </Link>
            <Link
              href="/legals/red-deco"
              className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-6 text-center shadow-[0_20px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-white/[0.035] dark:shadow-none dark:hover:bg-white/[0.055]"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
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
                    className="text-primary"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V7l8-4v18" />
                    <path d="M19 21V11l-6-4" />
                    <path d="M9 9v.01" />
                    <path d="M9 12v.01" />
                    <path d="M9 15v.01" />
                  </svg>
                </div>
                <h3 className="font-bold">Red Deco</h3>
              </div>
            </Link>
            <Link
              href="/developers"
              className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card p-6 text-center shadow-[0_20px_55px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-white/[0.035] dark:shadow-none dark:hover:bg-white/[0.055]"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
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
                    className="text-primary"
                  >
                    <path d="m18 16 4-4-4-4" />
                    <path d="m6 8-4 4 4 4" />
                    <path d="m14.5 4-5 16" />
                  </svg>
                </div>
                <h3 className="font-bold">Developers</h3>
              </div>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="mb-20 space-y-16">
          <section id="canales-soporte">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Canales de soporte</h2>
              <span className="text-base font-bold text-foreground md:text-lg">01-</span>
            </div>
            <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card/90 p-6 text-card-foreground shadow-[0_20px_55px_rgba(15,23,42,0.10)] dark:bg-white/[0.035] dark:shadow-none">
              <p className="mb-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                En deco-exchange, ofrecemos múltiples canales de soporte para garantizar que nuestros usuarios reciban la
                asistencia que necesitan de manera rápida y eficiente:
              </p>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex min-h-[220px] flex-col justify-between rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:bg-background/35 dark:shadow-none xl:aspect-square">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                    </svg>
                  </div>
                  <div className="mt-8">
                    <h3 className="mb-2 text-xl font-black text-foreground">Chat en vivo</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Atención directa desde la plataforma web y móvil.
                    </p>
                    <button
                      type="button"
                      onClick={() => openSupport("chat")}
                      className="mt-5 inline-block text-left text-sm font-bold text-primary"
                    >
                      Iniciar chat
                    </button>
                  </div>
                </div>
                <div className="flex min-h-[220px] flex-col justify-between rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:bg-background/35 dark:shadow-none xl:aspect-square">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div className="mt-8">
                    <h3 className="mb-2 text-xl font-black text-foreground">Correo electrónico</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Consultas formales y seguimiento por escrito.
                    </p>
                    <a href="mailto:contacto@deco31416.com" className="mt-5 inline-block text-sm font-bold text-primary">
                      contacto@deco31416.com
                    </a>
                  </div>
                </div>
                <div className="flex min-h-[220px] flex-col justify-between rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:bg-background/35 dark:shadow-none xl:aspect-square">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="mt-8">
                    <h3 className="mb-2 text-xl font-black text-foreground">Centro de llamadas</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Atención telefónica para solicitudes operativas.
                    </p>
                    <a href="tel:+573001234567" className="mt-5 inline-block text-sm font-bold text-primary">
                      +57 300 123 4567
                    </a>
                  </div>
                </div>
                <div className="flex min-h-[220px] flex-col justify-between rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:bg-background/35 dark:shadow-none xl:aspect-square">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </div>
                  <div className="mt-8">
                    <h3 className="mb-2 text-xl font-black text-foreground">Redes sociales</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Canales oficiales para novedades y comunidad.
                    </p>
                    <div className="mt-5 flex gap-3">
                      <a href="#" className="text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                        </svg>
                      </a>
                      <a href="#" className="text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                      </a>
                      <a href="#" className="text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:bg-background/35 dark:shadow-none">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M12 18v-6" />
                        <path d="M8 15h8" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mb-1 text-xl font-black text-foreground">Sistema de tickets</h3>
                      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        Para casos complejos que requieren investigación, utilice nuestro sistema de tickets para un
                        seguimiento detallado.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openSupport("ticket")}
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#ff6c02] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e85f00]"
                  >
                    Crear ticket de soporte
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section id="faq">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Preguntas frecuentes</h2>
              <span className="text-base font-bold text-foreground md:text-lg">02-</span>
            </div>
            <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card/90 p-6 text-card-foreground shadow-[0_20px_55px_rgba(15,23,42,0.10)] dark:bg-white/[0.035] dark:shadow-none">
              <div className="space-y-6">
                <div className="border-b border-border pb-4">
                  <h3 className="mb-2 text-lg font-bold text-foreground">¿Cómo puedo crear una cuenta en deco-exchange?</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Para crear una cuenta, visite nuestro sitio web o descargue nuestra aplicación móvil. Haga clic en
                    "Registrarse" y siga las instrucciones para completar el proceso de verificación de identidad según
                    las políticas KYC/AML.
                  </p>
                </div>

                <div className="border-b border-border pb-4">
                  <h3 className="mb-2 text-lg font-bold text-foreground">¿Cuáles son las comisiones por transferencia?</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Las comisiones varían según el tipo de transferencia, monto y destino. Puede consultar nuestra tabla
                    de comisiones actualizada en la sección{" "}
                    <Link href="/legals/fees" className="text-primary hover:underline">
                      Comisiones
                    </Link>{" "}
                    de nuestro sitio web.
                  </p>
                </div>

                <div className="border-b border-border pb-4">
                  <h3 className="mb-2 text-lg font-bold text-foreground">¿Cuánto tiempo tarda en procesarse una transferencia?</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Las transferencias entre cuentas de deco-exchange son instantáneas. Las transferencias a cuentas
                    bancarias externas pueden tardar entre 1-3 días hábiles, dependiendo del banco receptor y el país de
                    destino.
                  </p>
                </div>

                <div className="border-b border-border pb-4">
                  <h3 className="mb-2 text-lg font-bold text-foreground">¿Cómo puedo recuperar mi contraseña?</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    En la pantalla de inicio de sesión, haga clic en "¿Olvidó su contraseña?" y siga las instrucciones
                    para restablecerla a través del correo electrónico o número de teléfono asociado a su cuenta.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">¿Qué documentos necesito para verificar mi identidad?</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Para la verificación de identidad, necesitará un documento de identidad válido (cédula, pasaporte o
                    licencia de conducir), comprobante de domicilio reciente y una fotografía de su rostro para la
                    verificación biométrica.
                  </p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/legals/knowledge-base" className="inline-flex items-center font-bold text-primary hover:underline">
                  Ver todas las preguntas frecuentes
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
                    className="ml-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>

          <section id="tutoriales">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Tutoriales y guías</h2>
              <span className="text-base font-bold text-foreground md:text-lg">03-</span>
            </div>
            <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card/90 p-6 text-card-foreground shadow-[0_20px_55px_rgba(15,23,42,0.10)] dark:bg-white/[0.035] dark:shadow-none">
              <p className="mb-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                Ofrecemos una amplia variedad de recursos educativos para ayudarle a aprovechar al máximo nuestros
                servicios:
              </p>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="flex min-h-[280px] flex-col rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:bg-background/35 dark:shadow-none">
                  <div className="mb-7 grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                  </div>
                  <h3 className="text-xl font-black text-foreground">Primeros pasos</h3>
                  <div className="mt-5 space-y-2 text-sm">
                    <Link href="/legals/knowledge-base/account-creation" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Creación y verificación de cuenta
                    </Link>
                    <Link href="/legals/knowledge-base/profile-setup" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Configuración de perfil y seguridad
                    </Link>
                    <Link href="/legals/knowledge-base/payment-methods" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Vinculación de métodos de pago
                    </Link>
                  </div>
                </div>
                <div className="flex min-h-[280px] flex-col rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:bg-background/35 dark:shadow-none">
                  <div className="mb-7 grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
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
                  <h3 className="text-xl font-black text-foreground">Transferencias</h3>
                  <div className="mt-5 space-y-2 text-sm">
                    <Link href="/legals/knowledge-base/money-transfers" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Envío de dinero nacional e internacional
                    </Link>
                    <Link href="/legals/red-deco" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Red Deco para efectivo y remesas
                    </Link>
                    <Link href="/legals/knowledge-base/recurring-transfers" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Programación de transferencias recurrentes
                    </Link>
                    <Link href="/legals/knowledge-base/transaction-tracking" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Seguimiento de transacciones
                    </Link>
                  </div>
                </div>
                <div className="flex min-h-[280px] flex-col rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:bg-background/35 dark:shadow-none">
                  <div className="mb-7 grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                  </div>
                  <h3 className="text-xl font-black text-foreground">Seguridad</h3>
                  <div className="mt-5 space-y-2 text-sm">
                    <Link href="/legals/knowledge-base/two-factor-auth" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Activación de autenticación de dos factores
                    </Link>
                    <Link href="/legals/knowledge-base/fraud-protection" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Protección contra fraudes
                    </Link>
                    <Link href="/legals/knowledge-base/device-management" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Gestión de dispositivos autorizados
                    </Link>
                  </div>
                </div>
                <div className="flex min-h-[280px] flex-col rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background/70 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:bg-background/35 dark:shadow-none">
                  <div className="mb-7 grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                        <path d="M10 2c1 .5 2 2 2 5" />
                      </svg>
                  </div>
                  <h3 className="text-xl font-black text-foreground">Funciones avanzadas</h3>
                  <div className="mt-5 space-y-2 text-sm">
                    <Link href="/legals/knowledge-base/deco-token-guide" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Uso de DECOToken
                    </Link>
                    <Link href="/legals/knowledge-base/referral-program" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Programa de referidos
                    </Link>
                    <Link href="/developers/data-api" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Data API para integraciones
                    </Link>
                    <Link href="/legals/api-developer" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Términos para developers
                    </Link>
                    <Link href="/legals/aliado-deco" className="block rounded-full border border-border bg-background px-4 py-2 font-semibold text-muted-foreground transition-colors hover:text-primary dark:bg-background/45">
                        Operar como Aliado Deco
                    </Link>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-[calc(var(--radius)-0.45rem)] border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.18),rgba(226,232,240,0.38)_28%,transparent_56%),linear-gradient(180deg,#ffffff_0%,hsl(var(--background))_70%)] p-8 text-center shadow-[0_22px_70px_rgba(15,23,42,0.12)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),rgba(255,255,255,0.035)_28%,transparent_52%),linear-gradient(180deg,#101010_0%,#050505_70%)] dark:shadow-none md:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ff6c02]">Aprende a tu ritmo</p>
                <h3 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-normal text-foreground md:text-4xl">
                  Explora tutoriales y domina la plataforma
                </h3>
                <p className="mx-auto mb-7 mt-5 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Encuentra guías en texto, video y recursos interactivos para avanzar con seguridad dentro del
                  ecosistema DECO EXCHANGE.
                </p>
                <Link
                  href="/legals/knowledge-base"
                  className="inline-flex items-center justify-center rounded-full bg-[#ff6c02] px-7 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(255,108,2,0.24)] transition-colors hover:bg-[#e85f00]"
                >
                  Explorar tutoriales
                </Link>
              </div>
            </div>
          </section>

          <section id="problemas">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Resolución de problemas comunes</h2>
              <span className="text-base font-bold text-foreground md:text-lg">04-</span>
            </div>
            <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-card/90 p-6 text-card-foreground shadow-[0_20px_55px_rgba(15,23,42,0.10)] dark:bg-white/[0.035] dark:shadow-none">
              <p className="mb-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                Soluciones rápidas para los problemas más frecuentes reportados por nuestros usuarios:
              </p>
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <div className="flex items-start">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
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
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold text-foreground">Problemas de inicio de sesión</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                        <li>Verifique que está utilizando el correo electrónico o número de teléfono correcto.</li>
                        <li>Asegúrese de que el bloqueo de mayúsculas no esté activado al ingresar su contraseña.</li>
                        <li>Borre la caché y las cookies de su navegador.</li>
                        <li>Si continúa el problema, utilice la opción "¿Olvidó su contraseña?" para restablecerla.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="border-b border-border pb-4">
                  <div className="flex items-start">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
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
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold text-foreground">Transferencia no recibida</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                        <li>Verifique el estado de la transferencia en su historial de transacciones.</li>
                        <li>Confirme que los datos del destinatario sean correctos.</li>
                        <li>Tenga en cuenta los tiempos de procesamiento según el tipo de transferencia.</li>
                        <li>
                          Si la transferencia aparece como "Completada" pero no ha sido recibida, contacte a soporte.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start">
                    <div className="mr-4 p-2 bg-primary/10 rounded-full">
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
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold text-foreground">Problemas con la verificación de identidad</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                        <li>Asegúrese de que los documentos estén vigentes y legibles.</li>
                        <li>La fotografía debe ser clara, con buena iluminación y mostrar su rostro completo.</li>
                        <li>Verifique que la información proporcionada coincida exactamente con sus documentos.</li>
                        <li>Si su verificación ha sido rechazada, revise el motivo específico e intente nuevamente.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/legals/knowledge-base/troubleshooting"
                  className="inline-flex items-center font-bold text-primary hover:underline"
                >
                  Ver más soluciones a problemas comunes
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
                    className="ml-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InfoCard
            title="Base de conocimientos"
            description="Explore nuestra extensa base de conocimientos con artículos detallados sobre todos nuestros servicios."
            link={{
              text: "Explorar artículos",
              href: "/legals/knowledge-base",
            }}
          />
          <InfoCard
            title="Comunidad de usuarios"
            description="Únase a nuestra comunidad para compartir experiencias y obtener consejos de otros usuarios."
            link={{
              text: "Unirse a la comunidad",
              href: "/legals/community",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DownloadCard
            title="Guía del usuario"
            description="Manual completo con todas las funcionalidades de deco-exchange explicadas paso a paso."
            fileSize="8.3 MB"
            fileType="PDF"
          />
          <DownloadCard
            title="Aplicación móvil"
            description="Descargue nuestra aplicación para Android e iOS para acceder a nuestros servicios desde cualquier lugar."
            fileSize="45.2 MB"
            fileType="APK/IPA"
          />
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
