import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Main/layout/navbar/navbar";
import Footer from "@/components/Main/layout/footer/footer";

// Evita el prerender estático (Next 15.4+ aplica reglas más estrictas que
// rompen el SSG de error pages que importan client components con efectos).
// Esto NO afecta el comportamiento visual: la 404 sigue siendo SSR-on-demand.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <Navbar />

      <main className="flex-grow flex items-center justify-center relative py-40">
        {/* Fondos decorativos */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-muted/30 to-transparent" />
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="particle-container" />
        </div>

        <div className="relative z-10 w-full max-w-screen-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto">
          <Card className="border-border bg-card/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md overflow-hidden rounded-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Columna izquierda */}
              <div className="p-6 lg:p-10 xl:p-12 flex flex-col">
                <CardHeader className="p-0 pb-6 sm:pb-8 space-y-4">
                  <span className="inline-block px-4 py-1.5 text-sm font-medium rounded-full bg-accent text-accent-foreground w-fit">
                    404
                  </span>

                  <div>
                    <h1 className="text-4xl xl:text-5xl font-bold tracking-tight">
                      Página no encontrada
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground font-light">
                      Lo sentimos, la página que estás buscando no existe o ha
                      sido movida.
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-0 pb-6 sm:pb-8 flex-grow">
                  <div className="p-5 rounded-lg bg-muted/50 border border-muted/50">
                    <div className="flex items-start space-x-3">
                      <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Si estás buscando información sobre tu portafolio o
                          transacciones, revisa tu panel de control o
                          contáctanos.
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground/70">
                          ID de referencia:{" "}
                          <span className="font-mono">XFR-7829-4021</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-6 sm:mb-8" />

                <CardFooter className="p-0 flex flex-col xs:flex-row gap-4">
                  <Button asChild size="lg" className="w-full xs:w-auto px-6">
                    <Link href="/" className="flex items-center justify-center">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <span>Volver al Dashboard</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className={cn(
                      "w-full xs:w-auto px-6 border-border bg-transparent hover:bg-muted",
                      "text-foreground shadow-sm transition-colors"
                    )}
                  >
                    <Link
                      href="/help"
                      className="flex items-center justify-center"
                    >
                      <span>Visita el Help Center</span>
                    </Link>
                  </Button>
                </CardFooter>
              </div>

              {/* Columna derecha */}
              <div className="relative bg-gradient-to-br from-muted to-background hidden lg:block">
                <div className="absolute inset-0 bg-[url('/circuit-pattern.png')] opacity-[0.07]" />
                <div className="absolute inset-0 flex items-center justify-center p-10">
                  <div className="relative aspect-square w-full max-w-[320px] xl:max-w-[400px]">
                    <div className="absolute inset-8 rounded-full bg-[#ff6c02]/15 blur-3xl animate-pulse" />
                    <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                      <Image
                        src="/images/deco-gif/coin-web3.gif"
                        width={420}
                        height={420}
                        alt="Visualización de página no encontrada"
                        className="h-full w-full scale-[1.08] object-cover"
                        unoptimized
                        priority
                      />
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 border border-border/30 rounded-full" />
                    <div className="absolute bottom-10 left-0 w-16 h-16 border border-border/20 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Imagen móvil */}
              <div className="p-6 flex justify-center lg:hidden">
                <div className="relative aspect-square w-full max-w-[250px]">
                  <div className="absolute inset-8 rounded-full bg-[#ff6c02]/15 blur-3xl animate-pulse" />
                  <div className="relative z-10 h-full w-full overflow-hidden rounded-full">
                  <Image
                    src="/images/deco-gif/coin-web3.gif"
                    width={250}
                    height={250}
                    alt="Visualización de página no encontrada"
                    className="h-full w-full scale-[1.08] object-cover"
                    unoptimized
                    priority
                  />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
