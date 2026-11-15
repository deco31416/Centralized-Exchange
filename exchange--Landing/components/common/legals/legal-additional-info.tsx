import Link from "next/link"

export function LegalAdditionalInfo() {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.20),rgba(226,232,240,0.40)_28%,transparent_56%),linear-gradient(180deg,#ffffff_0%,hsl(var(--background))_68%)] px-5 py-16 text-center shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.13),rgba(255,255,255,0.04)_28%,transparent_52%),linear-gradient(180deg,#050505_0%,#000000_68%)] dark:shadow-none sm:px-8 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.18))] opacity-70 dark:bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.03))] dark:opacity-100" />
      <div className="relative mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ff6c02]">Información adicional</p>
        <h2 className="mt-3 text-3xl font-black tracking-normal text-foreground md:text-5xl">Departamento legal DECO</h2>
        <p className="mx-auto mt-8 max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Para obtener información adicional sobre políticas, términos, disponibilidad regulatoria y procedimientos del ecosistema DECO EXCHANGE, puede contactar a nuestro equipo legal. La plataforma no ofrece servicios financieros activos hasta obtener las licencias correspondientes.
        </p>
        <Link
          href="mailto:contacto@deco31416.com"
          className="mt-8 inline-flex rounded-full bg-[#ff6c02] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_36px_rgba(255,108,2,0.22)] transition-colors hover:bg-[#e85f00]"
        >
          contacto@deco31416.com
        </Link>
      </div>
    </section>
  )
}
