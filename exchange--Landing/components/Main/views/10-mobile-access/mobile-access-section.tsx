import AppExchangeScreen from "@/components/wallet/AppExchangeScreen"
import MobileMockup from "@/components/wallet/MobileMockup"
import Image from "next/image"
import Link from "next/link"

export default function MobileAccessSection() {
  return (
    <section id="wallet" className="py-12 md:py-20 bg-background relative overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="relative hidden h-[620px] justify-center order-2 md:order-1 md:flex">
            <MobileMockup>
              <AppExchangeScreen />
            </MobileMockup>
          </div>

          <div className="space-y-6 md:space-y-8 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
              Gestiona tus operaciones desde cualquier dispositivo
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Utilice todas las funcionalidades del servicio en la aplicación móvil
            </p>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="grid h-32 w-32 shrink-0 place-items-center rounded-md border border-border bg-background p-2">
                  <Image
                    src="/images/utils/qr-code.png"
                    alt="QR Code"
                    width={120}
                    height={120}
                    className="aspect-square h-28 w-28 rounded object-contain dark:hidden"
                  />
                  <Image
                    src="/images/utils/qr-code-white.png"
                    alt="QR Code"
                    width={120}
                    height={120}
                    className="hidden aspect-square h-28 w-28 rounded object-contain dark:block"
                  />
                </div>
                <p className="text-base md:text-lg text-muted-foreground">
                  Escanea el QR y prepárate para disfrutar de nuestros servicios. Muy pronto podrás descargar nuestra app desde App Store y Google Play
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="#" className="inline-block">
                  <Image
                    src="/images/main/icon-app-es-dark.svg"
                    alt="Download on App Store"
                    width={140}
                    height={46}
                    className="h-12 w-auto"
                  />
                </Link>
                <Link href="#" className="inline-block">
                  <Image
                    src="/images/main/googleplay.png"
                    alt="Get it on Google Play"
                    width={160}
                    height={46}
                    className="h-12 w-auto"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
