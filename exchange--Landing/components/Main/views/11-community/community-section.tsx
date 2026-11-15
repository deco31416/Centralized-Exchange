import { MessageCircle, Music2, Send } from "lucide-react"
import type { LucideIcon } from "lucide-react"

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M14 8.5V7.1c0-.7.5-1.1 1.2-1.1H17V3h-2.6C11.8 3 10 4.7 10 7.1v1.4H8v3h2V21h4v-9.5h2.6l.4-3H14Z" />
    </svg>
  )
}

const communityLinks: Array<{
  href: string
  label: string
  Icon: LucideIcon | typeof FacebookIcon
}> = [
  {
    href: "https://www.tiktok.com/@deco31416",
    label: "TikTok @deco31416",
    Icon: Music2,
  },
  {
    href: "https://facebook.com/deco-exchange",
    label: "Facebook deco-exchange",
    Icon: FacebookIcon,
  },
  {
    href: "https://t.me/deco31416",
    label: "Telegram @deco31416",
    Icon: Send,
  },
  {
    href: "https://wa.me/573013099880",
    label: "WhatsApp DECO",
    Icon: MessageCircle,
  },
]

export default function CommunitySection() {
  return (
    <section id="comunidad" className="py-12 md:py-16 bg-background relative overflow-hidden">
      <div className="container relative z-10">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="w-full rounded-[var(--radius)] border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-none md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center md:text-left">
              Únase a la comunidad deco31416
            </h2>

            <div className="flex items-center gap-4 md:gap-6">
              {communityLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="group grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-foreground hover:text-background md:h-16 md:w-16"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 md:h-6 md:w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
