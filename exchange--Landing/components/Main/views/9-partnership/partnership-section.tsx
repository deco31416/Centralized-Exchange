import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const partnershipPrograms = [
  {
    title: "Referidos",
    description: "Invita a tus amigos y gana 3 USDC por cada referido que deposite $100 y complete su verificación",
    image: "/images/main/programs/referidos.png",
    href: "/legals/referidos",
    cta: "Ver referidos",
  },
  {
    title: "Launchpad",
    description: "Accede al lanzamiento de nuevos proyectos y sé de los primeros en invertir en tokens exclusivos",
    image: "/images/main/programs/launchpad.png",
    href: "/legals/criptoactivos",
    cta: "Explorar launchpad",
  },
  {
    title: "Cashback",
    description: "Opera y recibe recompensas cada vez que realices una transacción en los tokens promocionado",
    image: "/images/main/programs/cashback.png",
    href: "/legals/lee-y-gana",
    cta: "Ver cashback",
  },
  {
    title: "Market Maker",
    description: "Aporta liquidez a los mercados y obtén hasta el 50% de las comisiones por las operaciones",
    image: "/images/main/programs/mmaker.png",
    href: "/markets/market-maker",
    cta: "Conocer programa",
  },
]

const rewardCardClass =
  "overflow-hidden rounded-[var(--radius)] border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-none dark:hover:shadow-none"

export default function PartnershipSection() {
  return (
    <section id="recompensas" className="py-12 md:py-16 bg-background">
      <div className="container">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10">Programas de recompensas</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {partnershipPrograms.map((program, index) => (
            <Card key={index} className={rewardCardClass}>
              <CardContent className="p-6 md:p-8 pt-8 md:pt-10">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative h-24 w-24 md:h-28 md:w-28 mb-6">
                    <Image
                      src={program.image || "/placeholder.svg"}
                      alt={program.title}
                      width={112}
                      height={112}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-center">{program.title}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground text-center">{program.description}</p>
              </CardContent>
              <CardFooter className="p-6 md:p-8 pt-0">
                <Button
                  asChild
                  className="w-full rounded-full bg-[#ff6c02] text-base font-semibold text-white hover:bg-[#ff6c02]/90"
                >
                  <Link href={program.href}>
                    {program.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
