"use client";

import Link from "next/link"
import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function CookiesPage() {
  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent("deco:cookies", { detail: { mode: "customize" } }))
  }

  return (
    <div className="legal-document-shell">
      <Navbar />

      {/* Main Content */}
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Políticas de Cookies</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Legales", href: "/" },
            { label: "Políticas de Cookies", href: "/cookies", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            Esta Política de Cookies explica cómo DECO EXCHANGE utiliza cookies y tecnologías similares para
            reconocerlo cuando visita nuestro sitio web. Explica qué son estas tecnologías y por qué las usamos, así
            como sus derechos para controlar nuestro uso de ellas.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">POLÍTICA DE COOKIES</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">¿QUÉ SON LAS COOKIES?</h3>

          <p className="text-muted-foreground leading-relaxed">
            Las cookies son pequeños archivos de datos que se colocan en su computadora o dispositivo móvil cuando
            visita un sitio web. Las cookies se utilizan ampliamente para que los sitios web funcionen, o funcionen de
            manera más eficiente, así como para proporcionar información a los propietarios del sitio.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">¿POR QUÉ UTILIZAMOS COOKIES?</h3>

          <p className="text-muted-foreground leading-relaxed">
            Utilizamos cookies por varias razones. Algunas cookies son necesarias por razones técnicas para que nuestro
            sitio web funcione, y las llamamos cookies "esenciales" o "estrictamente necesarias". Otras cookies nos
            permiten rastrear y dirigir los intereses de nuestros usuarios para mejorar la experiencia en nuestro sitio.
            Terceros sirven cookies a través de nuestro sitio para publicidad, análisis y otras funciones.
          </p>

          <h3 className="text-xl font-medium mt-8 mb-4">TIPOS DE COOKIES QUE UTILIZAMOS</h3>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Cookies Esenciales:</strong> Estas cookies son estrictamente necesarias para que el sitio web
                funcione y no pueden ser desactivadas en nuestros sistemas. Generalmente solo se establecen en respuesta
                a acciones realizadas por usted que equivalen a una solicitud de servicios, como establecer sus
                preferencias de privacidad, iniciar sesión o completar formularios.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Cookies de Rendimiento:</strong> Estas cookies nos permiten contar las visitas y fuentes de
                tráfico para que podamos medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas
                son las más y menos populares y ver cómo los visitantes se mueven por el sitio.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Cookies de Funcionalidad:</strong> Estas cookies permiten que el sitio proporcione funcionalidad
                y personalización mejoradas. Pueden ser establecidas por nosotros o por proveedores externos cuyos
                servicios hemos agregado a nuestras páginas.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Cookies de Publicidad:</strong> Estas cookies pueden ser establecidas a través de nuestro sitio
                por nuestros socios publicitarios. Pueden ser utilizadas por esas empresas para construir un perfil de
                sus intereses y mostrarle anuncios relevantes en otros sitios.
              </p>
            </li>
          </ol>

          <h3 className="text-xl font-medium mt-8 mb-4">CONTROL DE COOKIES</h3>

          <p className="text-muted-foreground leading-relaxed">
            Puede configurar o modificar los controles de su navegador web para aceptar o rechazar cookies. Si elige
            rechazar las cookies, aún puede usar nuestro sitio web, aunque su acceso a algunas funcionalidades y áreas
            de nuestro sitio web puede estar restringido.
          </p>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestra Política de Cookies, por favor contáctenos a través del correo
            electrónico:{" "}
            <Link href="mailto:privacy@deco-exchange.com" className="text-primary hover:underline">
              privacy@deco-exchange.com
            </Link>
          </p>

          <button
            type="button"
            onClick={openCookiePreferences}
            className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Administrar preferencias de cookies
          </button>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Soporte Legal"
            company="DECO EXCHANGE"
            companyInfo="Sin licencia operativa"
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Política de Cookies - ES"
              description="Descargar PDF"
              href="/downloads/cookies-es.pdf"
            />

            <DownloadCard
              title="Política de Cookies - EN"
              description="Descargar PDF"
              href="/downloads/cookies-en.pdf"
            />
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  )
}
