"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import Link from "next/link"

export default function KnowledgeBasePage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header */}
        <div className="legal-document-hero my-8 md:my-10">
          <p className="legal-document-title">DECO EXCHANGE</p>
          <h1 className="legal-document-eyebrow">Base de conocimientos</h1>
          <p className="legal-document-meta">Recursos, guías y documentación</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Base de Conocimientos", href: "/knowledge-base" },
          ]}
          className="mb-8"
        />

        {/* Search Section */}
        <div className="bg-card text-card-foreground rounded-lg border mb-12 p-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">¿Qué estás buscando?</h2>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
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
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Buscar artículos, tutoriales o preguntas frecuentes..."
                className="w-full pl-10 pr-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-muted rounded-full text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                Transferencias
              </span>
              <span className="px-3 py-1 bg-muted rounded-full text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                Verificación
              </span>
              <span className="px-3 py-1 bg-muted rounded-full text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                DECOToken
              </span>
              <span className="px-3 py-1 bg-muted rounded-full text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                Seguridad
              </span>
              <span className="px-3 py-1 bg-muted rounded-full text-sm cursor-pointer hover:bg-muted/80 transition-colors">
                Comisiones
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Categorías populares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                  <line x1="6" x2="6" y1="2" y2="4" />
                  <line x1="10" x2="10" y1="2" y2="4" />
                  <line x1="14" x2="14" y1="2" y2="4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Primeros pasos</h3>
              <p className="text-muted-foreground mb-4">
                Todo lo que necesitas saber para comenzar a utilizar deco-exchange de manera efectiva.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/account-creation" className="text-sm hover:text-primary">
                    Creación de cuenta
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/verification" className="text-sm hover:text-primary">
                    Verificación de identidad
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/first-transfer" className="text-sm hover:text-primary">
                    Primera transferencia
                  </Link>
                </li>
              </ul>
              <Link
                href="/knowledge-base/getting-started"
                className="text-primary text-sm hover:underline inline-flex items-center"
              >
                Ver todos los artículos
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

            <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Transferencias</h3>
              <p className="text-muted-foreground mb-4">
                Guías detalladas sobre cómo realizar diferentes tipos de transferencias de manera segura.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/domestic-transfers" className="text-sm hover:text-primary">
                    Transferencias nacionales
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/international-transfers" className="text-sm hover:text-primary">
                    Transferencias internacionales
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/transfer-limits" className="text-sm hover:text-primary">
                    Límites de transferencia
                  </Link>
                </li>
              </ul>
              <Link
                href="/knowledge-base/transfers"
                className="text-primary text-sm hover:underline inline-flex items-center"
              >
                Ver todos los artículos
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

            <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Seguridad</h3>
              <p className="text-muted-foreground mb-4">
                Aprende a proteger tu cuenta y tus transacciones con nuestras medidas de seguridad.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/two-factor-auth" className="text-sm hover:text-primary">
                    Autenticación de dos factores
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/secure-password" className="text-sm hover:text-primary">
                    Contraseñas seguras
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/fraud-prevention" className="text-sm hover:text-primary">
                    Prevención de fraudes
                  </Link>
                </li>
              </ul>
              <Link
                href="/knowledge-base/security"
                className="text-primary text-sm hover:underline inline-flex items-center"
              >
                Ver todos los artículos
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

            <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">DECOToken</h3>
              <p className="text-muted-foreground mb-4">
                Todo sobre nuestra moneda digital respaldada y cómo utilizarla en tus transacciones.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/deco-token-intro" className="text-sm hover:text-primary">
                    ¿Qué es DECOToken?
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/deco-token-benefits" className="text-sm hover:text-primary">
                    Beneficios de DECOToken
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/deco-token-usage" className="text-sm hover:text-primary">
                    Cómo usar DECOToken
                  </Link>
                </li>
              </ul>
              <Link
                href="/knowledge-base/deco-token"
                className="text-primary text-sm hover:underline inline-flex items-center"
              >
                Ver todos los artículos
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

            <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                  <path d="M9 22h6" />
                  <path d="M16 5.2V2" />
                  <path d="M8 5.2V2" />
                  <circle cx="18" cy="18" r="3" />
                  <path d="M18 13.5V18h4.5" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Programas y Promociones</h3>
              <p className="text-muted-foreground mb-4">
                Información sobre nuestros programas de fidelización y promociones especiales.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/referral-program" className="text-sm hover:text-primary">
                    Programa de referidos
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/play-to-earn" className="text-sm hover:text-primary">
                    Play to Earn
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/knowledge-base/lee-y-gana" className="text-sm hover:text-primary">
                    Lee y Gana
                  </Link>
                </li>
              </ul>
              <Link
                href="/knowledge-base/programs"
                className="text-primary text-sm hover:underline inline-flex items-center"
              >
                Ver todos los artículos
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

            <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Documentación Legal</h3>
              <p className="text-muted-foreground mb-4">
                Accede a todos los documentos legales y políticas que rigen nuestros servicios.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/legals/terms" className="text-sm hover:text-primary">
                    Términos y condiciones
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/legals/privacy" className="text-sm hover:text-primary">
                    Política de privacidad
                  </Link>
                </li>
                <li className="flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href="/legals/kyc-aml" className="text-sm hover:text-primary">
                    KYC/AML
                  </Link>
                </li>
              </ul>
              <Link href="/" className="text-primary text-sm hover:underline inline-flex items-center">
                Ver todos los documentos
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
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Artículos populares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-lg p-6">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-3">
                Transferencias
              </span>
              <h3 className="text-lg font-medium mb-2">Cómo realizar transferencias internacionales</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Guía paso a paso para enviar dinero a cualquier parte del mundo de manera rápida y segura.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Actualizado: 15 abril, 2023</span>
                <Link href="/knowledge-base/international-transfers" className="text-primary text-sm hover:underline">
                  Leer más
                </Link>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-3">
                Seguridad
              </span>
              <h3 className="text-lg font-medium mb-2">Cómo activar la autenticación de dos factores</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Protege tu cuenta con una capa adicional de seguridad utilizando la autenticación de dos factores.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Actualizado: 3 mayo, 2023</span>
                <Link href="/knowledge-base/two-factor-auth" className="text-primary text-sm hover:underline">
                  Leer más
                </Link>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-3">
                DECOToken
              </span>
              <h3 className="text-lg font-medium mb-2">Ventajas de utilizar DECOToken para tus transacciones</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Descubre cómo DECOToken te ofrece mayor seguridad, rapidez y menores comisiones en tus operaciones.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Actualizado: 20 marzo, 2023</span>
                <Link href="/knowledge-base/deco-token-benefits" className="text-primary text-sm hover:underline">
                  Leer más
                </Link>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-3">
                Comisiones
              </span>
              <h3 className="text-lg font-medium mb-2">Entendiendo las comisiones de deco-exchange</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Explicación detallada de nuestras comisiones y cómo se aplican a los diferentes tipos de transacciones.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Actualizado: 10 abril, 2023</span>
                <Link href="/knowledge-base/fees-explained" className="text-primary text-sm hover:underline">
                  Leer más
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Tutoriales en video</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img
                  src="/placeholder.svg?key=iqhle"
                  alt="Tutorial de creación de cuenta"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1">Cómo crear y verificar tu cuenta</h3>
                <p className="text-sm text-muted-foreground">Duración: 4:32</p>
              </div>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img
                  src="/placeholder.svg?key=e2nq5"
                  alt="Tutorial de transferencias"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1">Cómo realizar transferencias</h3>
                <p className="text-sm text-muted-foreground">Duración: 5:18</p>
              </div>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img
                  src="/placeholder.svg?key=ofxjr"
                  alt="Tutorial de seguridad"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1">Funciones de seguridad</h3>
                <p className="text-sm text-muted-foreground">Duración: 6:45</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link
              href="/knowledge-base/video-tutorials"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md inline-block hover:bg-primary/90 transition-colors"
            >
              Ver todos los tutoriales en video
            </Link>
          </div>
        </div>

        {/* Downloads */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Descargas útiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DownloadCard
              title="Guía completa de usuario"
              description="Manual detallado con todas las funcionalidades de deco-exchange explicadas paso a paso."
              fileSize="8.3 MB"
              fileType="PDF"
            />
            <DownloadCard
              title="Guía rápida de inicio"
              description="Documento con los pasos esenciales para comenzar a utilizar deco-exchange de inmediato."
              fileSize="2.1 MB"
              fileType="PDF"
            />
            <DownloadCard
              title="Tabla de comisiones"
              description="Documento con todas las comisiones aplicables a los diferentes servicios de deco-exchange."
              fileSize="1.5 MB"
              fileType="PDF"
            />
            <DownloadCard
              title="Guía de seguridad"
              description="Recomendaciones y mejores prácticas para mantener tu cuenta segura."
              fileSize="3.2 MB"
              fileType="PDF"
            />
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-card border rounded-lg p-8 mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">¿No encuentras lo que buscas?</h2>
            <p className="text-muted-foreground">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              href="/legals/help-center"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md text-center hover:bg-primary/90 transition-colors"
            >
              Contactar soporte
            </Link>
            <Link
              href="/community"
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md text-center hover:bg-secondary/90 transition-colors"
            >
              Visitar comunidad
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
