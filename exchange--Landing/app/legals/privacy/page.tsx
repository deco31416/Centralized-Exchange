"use client";

import Link from "next/link"
import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";
import ScrollToTop from "@/components/ui/scroll-to-top"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function PrivacidadPage() {
  return (

    <div className="legal-document-shell">
      <Navbar />

      {/* Main Content */}
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <p className="legal-document-title">DECO EXCHANGE</p>
          <h1 className="legal-document-eyebrow">Aviso de Privacidad</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Legales", href: "/legals" },
            { label: "Aviso de Privacidad", href: "/legals/privacy", active: true },
          ]}
        />

        {/* Content */}
        <div className="text-justify prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE COLOMBIA (la "Compañía") identificada con NIT 901855054-5, en cumplimiento de las
            disposiciones constitucionales y legales que reglamentan la protección de datos personales en Colombia,
            particularmente la Ley 1581 de 2012, los Decretos 1377 de 2013 y 1074 de 2015 y las demás normas aplicables,
            se permite informar que:
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">DECO EXCHANGE</h3>
          </div>

          <ol className="space-y-6 list-decimal pl-6">
            <li>
              <p className="text-muted-foreground leading-relaxed">
                Garantiza a los Titulares de los datos personales la privacidad, confidencialidad y seguridad de los
                datos entregados, evitando la adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento
                por parte de terceros.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                Tratará los datos personales con el fin de alcanzar propósitos comerciales, estadísticos y de mercadeo,
                cumplimiento de obligaciones normativas, atención de peticiones, quejas y reclamos, para el
                adelantamiento de procesos de selección, cumplimiento de obligaciones en materia laboral y seguridad
                social, con propósitos comerciales, contractuales y financieros, para adelantar capacitaciones y
                proceder solicitudes de aplicación a empleo, para desarrollar los servicios que comprenden su objeto
                social, para adelantar procedimientos de conocimiento del cliente (KYC), y tomar las precauciones
                exigidas contra el lavado de dinero y financiamiento al terrorismo (AML), marketing y publicidad, así
                como de servicio al cliente, y para entablar contacto con los Titulares de la información.
                Adicionalmente, los datos personales podrán ser transferidos y/o transmitidos, dentro o fuera del país,
                a compañías que hagan parte del grupo empresarial al que pertenece la Compañía, lo cual se llevará a
                cabo de conformidad con los requisitos establecidos en la legislación aplicable para ese tipo de
                tratamiento y de acuerdo con la información y lineamientos dispuestos en las Políticas y Procedimientos
                para el Tratamiento de la Información de la Compañía.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                La Compañía informa que podrá recolectar datos de naturaleza sensible, y que por ello, el Titular no
                está obligado a autorizar su tratamiento. El Titular es igualmente informado acerca de las finalidades
                en el tratamiento de ese tipo de información. Se informa igualmente que ninguna actividad que adelante
                la Compañía está condicionada al suministro de información sensible.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                Los Titulares cuentan con los derechos de conocer, actualizar, rectificar, modificar, acceder o
                solicitar la eliminación de sus datos personales, a revocar la autorización otorgada, salvo que exista
                algún deber legal o contractual que obligue a la Compañía a que la información permanezca en sus bases
                de datos, o por estricto orden judicial.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                Los Titulares de datos personales podrán consultar, en cualquier momento, las Políticas y Procedimientos
                para el Tratamiento de Datos Personales de la Compañía en el siguiente link:{" "}
                <Link href="https://www.deco-exchange.com/privacy" className="text-primary hover:underline">
                  https://www.deco-exchange.com/privacy
                </Link>
                . Este contiene los lineamientos, directrices y procedimientos sobre el tratamiento de la información
                personal por parte de la Compañía y la forma de hacer efectivos los derechos, consultas y solicitudes de
                supresión de datos de parte de los Titulares. Así mismo podrá consultarse allí cualquier actualización a
                dichas Políticas o al presente Aviso de Privacidad.
              </p>
            </li>
            <li>
              <p className="text-muted-foreground leading-relaxed">
                La Compañía podrá ser contactada a través de los siguientes correos electrónicos:
              </p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li className="text-muted-foreground">habeasdata@deco-exchange.com</li>
                <li className="text-muted-foreground">contacto@deco-exchange.com</li>
                <li className="text-muted-foreground">privacy@deco-exchange.com</li>
                <li className="text-muted-foreground">admin@deco-exchange.com</li>
                <li className="text-muted-foreground">soporte@deco-exchange.com</li>
              </ul>
            </li>
          </ol>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Así mismo, podrán ejercerse derechos a través de la página web de la Compañía (
            <Link href="https://www.deco-exchange.com/" className="text-primary hover:underline">
              https://www.deco-exchange.com/
            </Link>
            ).
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            description="Aviso de Privacidad y Protección de Datos"
            link={{
              text: "Leer más",
              href: "/legals/privacy"
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Aviso de Privacidad - ES"
              description="Descargar PDF"
              href="/downloads/aviso-privacidad-es.pdf"
            />

            <DownloadCard
              title="Aviso de Privacidad - EN"
              description="Descargar PDF"
              href="/downloads/aviso-privacidad-en.pdf"
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
