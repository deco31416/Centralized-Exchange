"use client";

import Navbar from "@/components/Main/layout/navbar/navbar"

import Footer from "@/components/Main/layout/footer/footer"
import ScrollToTop from "@/components/ui/scroll-to-top"
import Link from "next/link"
import Breadcrumb from "@/components/common/legals/Breadcrumb"
import DownloadCard from "@/components/common/legals/DownloadCard"
import InfoCard from "@/components/common/legals/InfoCard"

export default function CriptoactivosPage() {
  return (
    <div className="legal-document-shell">
      <Navbar />
      <div className="legal-document-container">
        {/* Header Section */}
        <div className="legal-document-hero my-8 md:my-10">
          <h2 className="legal-document-eyebrow">Criptoactivos</h2>
          <h1 className="legal-document-title">DECO EXCHANGE</h1>
          <p className="legal-document-meta">Última actualización: 08 de mayo de 2024</p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Financieras", href: "/" },
            { label: "Criptoactivos", href: "/criptoactivos", active: true },
          ]}
        />

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-16">
          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE ha incorporado criptoactivos a su plataforma para ofrecer a nuestros clientes opciones
            adicionales para enviar y recibir fondos. Esta página detalla nuestra política sobre criptoactivos y las
            opciones disponibles.
          </p>

          <div className="my-8 text-center">
            <h3 className="text-xl font-medium">ACTIVOS DIGITALES</h3>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">CRIPTOMONEDAS ACEPTADAS</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Bitcoin y derivados</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Bitcoin (BTC)</li>
                <li className="text-muted-foreground">Bitcoin Cash (BCH)</li>
                <li className="text-muted-foreground">Litecoin (LTC)</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Ethereum y tokens</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Ethereum (ETH)</li>
                <li className="text-muted-foreground">USDT (ERC-20)</li>
                <li className="text-muted-foreground">USDC (ERC-20)</li>
              </ul>
            </div>
            <div className="border border-white/20 rounded-xl p-6">
              <h4 className="text-lg font-medium mb-2">Otras criptomonedas</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-muted-foreground">Ripple (XRP)</li>
                <li className="text-muted-foreground">Binance Coin (BNB)</li>
                <li className="text-muted-foreground">Solana (SOL)</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mt-8 mb-4">SERVICIOS DISPONIBLES</h3>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Envío y recepción:</strong> Transferencias internacionales utilizando criptomonedas como medio de
              intercambio.
            </li>
            <li className="text-muted-foreground">
              <strong>Compra y venta:</strong> Adquisición y liquidación de criptomonedas con monedas fiduciarias.
            </li>
            <li className="text-muted-foreground">
              <strong>Custodia:</strong> Almacenamiento seguro de criptoactivos en billeteras frías y calientes.
            </li>
            <li className="text-muted-foreground">
              <strong>Conversión:</strong> Cambio entre diferentes criptomonedas a tasas competitivas.
            </li>
            <li className="text-muted-foreground">
              <strong>Pagos:</strong> Utilización de criptomonedas para pagos de servicios y productos.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">SEGURIDAD Y CUSTODIA</h3>

          <p className="text-muted-foreground leading-relaxed">
            DECO EXCHANGE implementa rigurosos protocolos de seguridad para la custodia de criptoactivos:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>Almacenamiento en frío:</strong> 95% de los activos se mantienen en billeteras frías (cold
              wallets) desconectadas de internet.
            </li>
            <li className="text-muted-foreground">
              <strong>Autenticación multifactor:</strong> Múltiples niveles de autenticación para acceder a las
              billeteras.
            </li>
            <li className="text-muted-foreground">
              <strong>Firmas múltiples:</strong> Requisito de múltiples firmas para autorizar transacciones de alto
              valor.
            </li>
            <li className="text-muted-foreground">
              <strong>Encriptación:</strong> Todas las claves privadas se almacenan encriptadas.
            </li>
            <li className="text-muted-foreground">
              <strong>Auditorías de seguridad:</strong> Evaluaciones regulares por empresas especializadas en seguridad
              blockchain.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">CUMPLIMIENTO REGULATORIO</h3>

          <p className="text-muted-foreground leading-relaxed">
            Nuestras operaciones con criptoactivos cumplen con todas las regulaciones aplicables:
          </p>

          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li className="text-muted-foreground">
              <strong>KYC/AML:</strong> Procedimientos rigurosos de conocimiento del cliente y prevención de lavado de
              activos.
            </li>
            <li className="text-muted-foreground">
              <strong>Monitoreo de transacciones:</strong> Vigilancia continua para detectar actividades sospechosas.
            </li>
            <li className="text-muted-foreground">
              <strong>Reportes regulatorios:</strong> Presentación de informes requeridos por las autoridades
              competentes.
            </li>
            <li className="text-muted-foreground">
              <strong>Trazabilidad:</strong> Registro completo de todas las transacciones para garantizar la
              transparencia.
            </li>
          </ul>

          <h3 className="text-xl font-medium mt-8 mb-4">COMISIONES Y LÍMITES</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-4 text-left">Servicio</th>
                  <th className="py-4 px-4 text-left">Comisión</th>
                  <th className="py-4 px-4 text-left">Límite Mínimo</th>
                  <th className="py-4 px-4 text-left">Límite Máximo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Envío de criptomonedas</td>
                  <td className="py-4 px-4">0.5% + tarifa de red</td>
                  <td className="py-4 px-4">Equivalente a $10 USD</td>
                  <td className="py-4 px-4">Equivalente a $10,000 USD</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Recepción de criptomonedas</td>
                  <td className="py-4 px-4">Sin comisión</td>
                  <td className="py-4 px-4">Sin límite</td>
                  <td className="py-4 px-4">Sin límite</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Compra de criptomonedas</td>
                  <td className="py-4 px-4">1.5%</td>
                  <td className="py-4 px-4">Equivalente a $20 USD</td>
                  <td className="py-4 px-4">Equivalente a $5,000 USD</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-4 px-4">Venta de criptomonedas</td>
                  <td className="py-4 px-4">1.5%</td>
                  <td className="py-4 px-4">Equivalente a $20 USD</td>
                  <td className="py-4 px-4">Equivalente a $5,000 USD</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Conversión entre criptomonedas</td>
                  <td className="py-4 px-4">0.8%</td>
                  <td className="py-4 px-4">Equivalente a $10 USD</td>
                  <td className="py-4 px-4">Equivalente a $10,000 USD</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground mt-8 leading-relaxed">
            Para más información sobre nuestros servicios de criptoactivos o para resolver dudas específicas, por favor
            contáctenos a través del correo electrónico:{" "}
            <Link href="mailto:crypto@example.invalid" className="text-primary hover:underline">
              crypto@example.invalid
            </Link>
          </p>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <InfoCard
            title="Actualización: 08/05/2024"
            subtitle="Información Financiera"
            company="DECO EXCHANGE"
            companyInfo="Sin licencia operativa"
          />

          <div className="grid grid-cols-1 gap-4">
            <DownloadCard
              title="Guía de Criptoactivos"
              description="Descargar PDF"
              href="/downloads/guia-criptoactivos.pdf"
            />

            <DownloadCard
              title="Política de Custodia Crypto"
              description="Descargar PDF"
              href="/downloads/politica-custodia-crypto.pdf"
            />
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
