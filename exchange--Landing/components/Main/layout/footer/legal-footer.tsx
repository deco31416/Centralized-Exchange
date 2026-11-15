"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { ExchangeAccessBadge } from "@/components/Main/layout/footer/exchange-access-badge"
import { LocalePreferenceSummary } from "@/components/common/language/locale-preference-summary"
import { LocalePreferencesModal } from "@/components/common/language/locale-preferences-modal"

export default function LegalFooter() {
    return (
        <section className="bg-background border-t border-border mt-8">
            <div className="container max-w-[1440px] py-8 md:py-12 text-muted-foreground text-xs md:text-sm space-y-6">

                {/* DESCARGO DE CONTENIDO */}
                <p className="text-left md:text-justify text-muted-foreground text-xs md:text-sm">
                    <strong>DESCARGO DE RESPONSABILIDAD DE CONTENIDO:</strong>{" "}
                    Las referencias a nombres de terceros, logotipos y marcas registradas en este sitio web tienen como único propósito identificar los bienes y servicios que los usuarios de deco-exchange pueden intercambiar mediante transacciones P2P facilitadas por la plataforma.
                    Salvo indicación expresa en contrario, los titulares de dichas marcas no están afiliados a deco-exchange, sus productos ni su sitio web, y no patrocinan ni avalan los servicios ofrecidos.
                    Todas las referencias se realizan bajo el principio de uso justo nominativo conforme a la legislación de marcas vigente, y son propiedad de sus respectivos titulares.
                </p>

                {/* AVISO LEGAL */}
                <p className="text-left md:text-justify text-muted-foreground text-xs md:text-sm">
                    <strong>AVISO LEGAL:</strong>{" "}
                    deco-exchange es una plataforma tecnológica operada como producto de las distintas entidades que conforman el grupo corporativo deco-exchange.
                    Dichas entidades se encuentran debidamente registradas y, en algunos casos, en proceso de obtención de autorizaciones regulatorias conforme a la legislación aplicable en diversas jurisdicciones.
                    Consulte los{" "}
                    <Link href="/legals" className="underline hover:text-foreground">
                        documentos legales
                    </Link>
                    {" "}para obtener información detallada sobre las licencias y registros.
                    La disponibilidad de productos, servicios y funcionalidades de la plataforma deco-exchange está sujeta a restricciones regulatorias que varían según el país o territorio.
                    En ciertas jurisdicciones, las entidades operadoras pueden no estar registradas ni supervisadas como instituciones financieras,
                    sin embargo, se implementan estándares robustos de cumplimiento normativo, incluyendo políticas de Prevención de Lavado de Activos (AML), Conozca a su Cliente (KYC) y gestión de riesgos de usuarios,
                    reportando sus actividades a las autoridades competentes en conformidad con las normativas locales aplicables. El acceso y uso de deco-exchange puede estar restringido en determinadas jurisdicciones debido a requisitos regulatorios locales.
                    El uso de esta plataforma implica la aceptación de nuestras políticas de privacidad y cookies.
                </p>

                {/* AVISO DE RIESGOS */}
                <p className="text-left md:text-justify text-muted-foreground text-xs md:text-sm">
                    <strong>AVISO DE RIESGOS:</strong>{" "}
                    Los activos digitales pueden experimentar una alta volatilidad, y los usuarios deben obtener asesoramiento independiente respecto de sus obligaciones tributarias y los riesgos asociados a la inversión en estos instrumentos.
                    Las criptomonedas no constituyen moneda de curso legal en la mayoria de las jurisdicciones, y sus transacciones son irrevocables.
                    El contenido disponible en la plataforma deco-exchange tiene fines exclusivamente educativos y no constituye, ni debe interpretarse, como una oferta, solicitud, recomendación o asesoramiento para comprar, vender, mantener activos digitales, abrir cuentas específicas o participar en estrategias de inversión determinadas.
                    Los mercados de activos digitales son altamente volátiles y pueden implicar la pérdida parcial o total de los fondos invertidos.
                    deco-exchange no actúa como corredor de bolsa registrado ni está afiliado a entidades como la Corporación Federal de Seguro de Depósitos (FDIC) o la Corporación para la Protección del Inversionista en Valores (SIPC).
                    Asimismo, el usuario podría estar obligado a pagar impuestos sobre cualquier ganancia o aumento en el valor de sus activos digitales, por lo que se recomienda buscar asesoría fiscal profesional independiente.
                    Los activos digitales mantenidos en deco-exchange no están asegurados ni garantizados contra pérdidas por ninguna entidad gubernamental ni privada.
                </p>

                {/* SECCION FINAL ICONO + BOTON */}
                <div className="grid gap-4 pt-6 text-center md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">

                    {/* 1. Izquierda - Información Legal */}
                    <div className="flex w-full flex-col items-center gap-2 md:items-start">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="inline h-4 w-4 text-primary" />
                            <span>© {new Date().getFullYear()} DECO EXCHANGE by deco31416</span>
                        </div>
                        <LocalePreferencesModal>
                            <button type="button" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <LocalePreferenceSummary />
                            </button>
                        </LocalePreferencesModal>
                        <div>
                            <button
                                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded-md text-xs transition-colors"
                                disabled
                            >
                                Servicios 100% operando
                            </button>
                        </div>
                    </div>

                    {/* 2. Centro - Presencia legal */}
                    <div className="flex w-full flex-col items-center justify-center gap-1 text-center md:w-auto md:justify-self-center">
                        <p className="text-sm font-black tracking-wide text-foreground">DECO EXCHANGE</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Colombia | Miami
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                            Sin licencia operativa
                        </p>
                    </div>

                    {/* 3. Derecha - Investor Access */}
                    <div className="flex w-full justify-center md:justify-end">
                        <ExchangeAccessBadge />
                    </div>

                </div>

            </div>
        </section>
    );
}
