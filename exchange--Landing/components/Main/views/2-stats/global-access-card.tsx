"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import GlobalAccessSwarm from "./global-access-swarm";

export default function GlobalAccessCard() {
  return (
    <section className="bg-background pb-12 md:pb-16">
      <div className="container">
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[0_24px_70px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.08)] dark:bg-[#050505] dark:shadow-none">
          <div className="grid min-h-[520px] items-center lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7 }}
              className="relative z-10 p-8 md:p-12 lg:p-16"
            >
              <span className="mb-6 inline-flex rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background dark:bg-accent dark:text-accent-foreground">
                Acceso global
              </span>
              <h2 className="max-w-xl text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                Toma el control de tu dinero
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Explora herramientas para gestionar cripto, monedas fiat y pagos
                desde una experiencia simple, segura y preparada para operar a
                escala global.
              </p>
              <div className="mt-8 w-fit max-w-full">
                <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
                  <span className="rounded-full border border-border bg-background/70 px-4 py-2 dark:bg-background/40">Cripto</span>
                  <span className="rounded-full border border-border bg-background/70 px-4 py-2 dark:bg-background/40">Fiat</span>
                  <span className="rounded-full border border-border bg-background/70 px-4 py-2 dark:bg-background/40">Pagos</span>
                  <span className="rounded-full border border-border bg-background/70 px-4 py-2 dark:bg-background/40">Remesas y más</span>
                </div>
                <Button asChild size="lg" className="mt-10 w-full rounded-full font-semibold">
                  <Link href="/markets/p2p">Ver más activos</Link>
                </Button>
              </div>
            </motion.div>

            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden lg:min-h-[520px]">
              <div className="absolute inset-0 bg-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-b from-transparent to-card dark:to-[#050505]" />
              <div className="relative z-10 aspect-square w-[min(86vw,460px)] md:w-[500px] lg:w-[540px]">
                <GlobalAccessSwarm />
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-5xl text-center text-sm leading-relaxed text-muted-foreground">
          La disponibilidad de productos y funcionalidades puede variar según la
          jurisdicción, la verificación del usuario y los requisitos
          regulatorios aplicables. deco-exchange no ofrece servicios financieros
          hasta obtener las licencias correspondientes.
        </p>
      </div>
    </section>
  );
}
