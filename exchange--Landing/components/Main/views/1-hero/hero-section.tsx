"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QRCodeContent } from "@/components/common/modals/QRCodeContent";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HeroExchangeWidget } from "./hero-exchange-widget";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section id="inicio" className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.20),rgba(226,232,240,0.45)_28%,transparent_56%),linear-gradient(180deg,#ffffff_0%,hsl(var(--background))_62%)] pb-16 pt-32 dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.13),rgba(255,255,255,0.04)_28%,transparent_52%),linear-gradient(180deg,#050505_0%,#000000_62%)] md:pb-24 md:pt-36">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(440px,470px)] xl:gap-14">
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="mb-6 inline-block rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background shadow-sm ring-1 ring-foreground/10 dark:bg-accent dark:text-accent-foreground dark:shadow-none dark:ring-0">
                Revolucionamos la forma de intercambiar
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                Todo empieza
                <br />
                con una cuenta
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-md">
                Opere y gestione sus activos con nuestra plataforma segura, rápida e intuitiva.
              </p>
            </div>

            <div className="space-y-6">
              <Button asChild size="lg" className="w-full sm:w-auto text-base">
                <Link href="#productos">
                  Aprender más
                </Link>
              </Button>

              <div className="flex flex-wrap gap-4 items-center">
                <Link href="#wallet" className="inline-block">
                  <Image
                    src="/images/main/icon-app-es-dark.svg"
                    alt="Download on App Store"
                    width={120}
                    height={40}
                    className="h-12 w-auto"
                  />
                </Link>
                <Link href="#wallet" className="inline-block">
                  <Image
                    src="/images/main/googleplay.png"
                    alt="Get it on Google Play"
                    width={135}
                    height={40}
                    className="h-12 w-auto"
                  />
                </Link>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="inline-block">
                      <Image
                        src="/images/main/qr-code-main-black.png"
                        alt="QR Code"
                        width={20}
                        height={20}
                        className="h-6 w-6 dark:hidden"
                      />
                      <Image
                        src="/images/main/qr-code-main.png"
                        alt="QR Code"
                        width={20}
                        height={20}
                        className="hidden h-6 w-6 dark:block"
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-transparent border-none shadow-none">
                    <QRCodeContent />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full max-w-[470px] justify-self-center lg:mt-0 lg:justify-self-end">
            <HeroExchangeWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
