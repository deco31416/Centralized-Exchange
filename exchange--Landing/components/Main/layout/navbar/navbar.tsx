"use client";

// DesktopNavbar (Main): navbar principal con auth, avatar dropdown, idioma y descarga.
// Se usa en todas las páginas a través del layout principal.
// Navbar canónico usado por home, páginas legales y P2P.
// Los dropdowns de idioma, descarga y usuario usan tokens de tema compartidos.

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Globe, Menu, X, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserDropdown } from "@/components/Main/layout/navbar/UserDropdown";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { MegaMenu } from "@/components/Main/layout/navbar/mega-menu";
import { LocalePreferencesModal } from "@/components/common/language/locale-preferences-modal";
import { QRCodeContent } from "@/components/common/modals/QRCodeContent";
import { LoginModal } from "@/components/common/onboarding/login-modal";
import { RegisterModal } from "@/components/common/onboarding/register-modal";
import { useAuth } from "@/components/p2p/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { BrandLogo } from "@/components/common/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GooeyInput } from "@/components/ui/gooey-input";

const navMenus = [
  {
    label: "Crypto fácil",
    sections: [
      {
        label: "Explora y aprende",
        badge: "Nivel 1 · Aprendiz",
        items: [
          {
            title: "Compra cripto",
            href: "/easy-crypto/buy",
            description: "Empieza con solo $1. Así de fácil.",
          },
          {
            title: "Vende cripto",
            href: "/easy-crypto/sell",
            description: "Recibe tu dinero en moneda local.",
          },
          {
            title: "Convertidor",
            href: "/easy-crypto/convert",
            description: "Cambia rápido, seguro y sin sorpresas.",
          },
          {
            title: "Envía cripto",
            href: "/easy-crypto/send",
            description: "Envía saldo con cero comisiones.",
          },
          {
            title: "Opera en vivo",
            href: "/easy-crypto/spot-lite",
            description: "Sigue la tendencia y opera de forma simple.",
          },
        ],
      },
    ],
  },
  {
    label: "Bolsillito",
    sections: [
      {
        label: "Saldo Bolsillito",
        badge: "Nivel 2 · Listo para usar",
        items: [
          {
            title: "Recarga saldo",
            href: "/bolsillito/add-money",
            description: "Agrega saldo a tu cuenta.",
          },
          {
            title: "Envía saldo",
            href: "/bolsillito/send-money",
            description: "Transfiere saldo a otros usuarios.",
          },
          // {
          //   title: "Envío global",
          //   href: "/bolsillito/global-transfer",
          //   description:
          //     "Envía crédito interno a usuarios verificados en países disponibles, sujeto a límites, validaciones y disponibilidad.",
          // },
          {
            title: "Remesas",
            href: "/bolsillito/remittances",
            description: "Envía dinero entre países.",
          },
          {
            title: "Retira saldo",
            href: "/bolsillito/withdraw-credit",
            description: "Retira saldo a medios disponibles.",
          },
          // {
          //   title: "Financiación",
          //   href: "/bolsillito/personal-loans",
          //   description:
          //     "Explora opciones de financiación disponibles en la plataforma.",
          // },
        ],
      },
    ],
  },
  {
    label: "Mercados",
    sections: [
      {
        label: "Opera sin complicaciones",
        badge: "Nivel 3 · Explorador",
        items: [
          {
            title: "Spot",
            href: "/markets/spot",
            description: "Compra y vende cripto al precio de mercado.",
          },
          {
            title: "Futuros",
            href: "/markets/futures",
            description: "Contratos con margen y gestión de riesgo.",
          },
          {
            title: "P2P Market",
            href: "/markets/p2p",
            description: "Intercambio directo entre personas.",
          },
          {
            title: "Market Maker",
            href: "/markets/market-maker",
            description: "Liquidez OTC para alto volumen.",
          },
          {
            title: "Trading Pro",
            href: "/markets/advanced-orders",
            description: "Limit, stop, OCO y ejecución avanzada.",
          },
          {
            title: "Análisis de Mercado",
            href: "/markets/market-analysis",
            description: "Tendencias, volumen y oportunidades.",
          },
          {
            title: "Historial de Órdenes",
            href: "/markets/order-history",
            description: "Consulta órdenes, fills y actividad.",
          },
          {
            title: "Alertas de Precio",
            href: "/markets/price-alerts",
            description: "Crea alertas para activos clave.",
          },
        ],
      },
    ],
  },
  // {
  //   label: "Comercio",
  //   sections: [
  //     {
  //       label: "Controla tus operaciones",
  //       badge: "Nivel 4 · Estratega",
  //       items: [
  //         {
  //           title: "Trading Terminal",
  //           href: "/trading/terminal",
  //           description: "Gráficos y órdenes avanzadas.",
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    label: "Rendimiento",
    sections: [
      {
        label: "Potencia tu cuenta",
        badge: "Nivel 4 · Uso Inteligente",
        items: [
          {
            title: "Staking de Tokens",
            href: "/rendimiento/staking-tokens",
            description: "Rendimiento estimado por activo.",
          },
          {
            title: "Bóveda Programada",
            href: "/rendimiento/boveda-programada",
            description: "Plazos con proyección.",
          },
          {
            title: "Reservas",
            href: "/rendimiento/reservas",
            description: "Respaldo y cobertura.",
          },
          {
            title: "Calculadora de Retorno",
            href: "/rendimiento/calculator",
            description: "Simula antes de activar.",
          },
        ],
      },
    ],
  },
  {
    label: "Ganar",
    sections: [
      {
        label: "Tu impacto vale",
        badge: "Nivel 5 · Embajador",
        items: [
          {
            title: "Referidos",
            href: "/earn/referrals",
            description: "Invita y gana comisiones",
          },
          {
            title: "Puntos Deco",
            href: "/earn/deco-points",
            description: "Acumula y canjea beneficios",
          },
          {
            title: "Cashback",
            href: "/earn/cashback",
            description: "Gana devoluciones en compras",
          },
          {
            title: "Aprende y Gana",
            href: "/earn/learn-and-earn",
            description: "Aprende y gana recompensas",
          },
          {
            title: "Misiones",
            href: "/earn/missions",
            description: "Completa retos diarios",
          },
          {
            title: "Sponsor Ads",
            href: "/earn/sponsor-ads",
            description: "Promociona y gana tokens",
          },
          {
            title: "Launchpad",
            href: "/earn/launchpad",
            description: "Invierte en nuevos proyectos",
          },
          {
            title: "Ranking de Ganadores",
            href: "/earn/top-earners",
            description: "Top usuarios del mes",
          },
        ],
      },
    ],
  },
  {
    label: "Red y Aliados",
    sections: [
      {
        label: "Red física",
        badge: "Nivel 6 · Aliados",
        items: [
          {
            title: "Red Deco",
            href: "/bolsillito/red-deco",
            description: "Efectivo y remesas con aliados.",
          },
          {
            title: "Buscar punto cercano",
            href: "/bolsillito/red-deco/nearby",
            description: "Encuentra aliados disponibles.",
          },
          {
            title: "Depositar efectivo",
            href: "/bolsillito/red-deco/deposit",
            description: "Convierte efectivo en saldo Deco.",
          },
          {
            title: "Retirar efectivo",
            href: "/bolsillito/red-deco/withdraw",
            description: "Cobra saldo con un aliado.",
          },
          {
            title: "Remesas presenciales",
            href: "/bolsillito/red-deco/remittance",
            description: "Envía dinero entre países.",
          },
          {
            title: "Aliado Deco",
            href: "/earn/aliado-deco",
            description: "Opera como punto verificado.",
          },
        ],
      },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Sesión cerrada correctamente", variant: "success" });
  };

  const userInitials = user ? user.name.substring(0, 2).toUpperCase() : "";

  const userAvatarUrl = user?.avatar
    ? user.avatar
    : user
      ? `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
      : undefined;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/80 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            : "bg-transparent py-3 md:py-4",
        )}
      >
        <div className="container max-w-[1440px] border-border">
          <div
            className={cn(
              "flex h-14 w-full items-center justify-between rounded-2xl border px-4 backdrop-blur transition-all duration-300 sm:h-16 md:h-18 md:px-6",
              scrolled
                ? "bg-card/90 shadow-[0_14px_40px_rgba(15,23,42,0.10)] dark:bg-background/90 dark:shadow-none"
                : "bg-card/75 shadow-[0_18px_50px_rgba(15,23,42,0.10)] dark:bg-background/70 dark:shadow-none",
            )}
          >
            <div className="flex items-center gap-4 md:gap-6">
              <Link href="/" className="flex items-center space-x-2">
                <BrandLogo className="w-[180px]" priority />
              </Link>
              {isMounted ? (
                <nav className="hidden xl:flex items-center gap-2 lg:gap-4">
                  {navMenus.map((menu) => (
                    <MegaMenu
                      key={menu.label}
                      label={menu.label}
                      sections={menu.sections}
                    />
                  ))}
                </nav>
              ) : (
                <nav className="hidden min-h-10 xl:flex" aria-hidden="true" />
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isMounted && !user ? <GooeyInput className="hidden xl:flex" placeholder="Buscar..." /> : null}

              {user ? (
                <UserDropdown
                  name={user.name}
                  email={user.email}
                  username={user.username}
                  avatarUrl={userAvatarUrl}
                  initials={userInitials}
                  onLogout={handleLogout}
                />
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex text-xs lg:text-sm ml-4 md:ml-2"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Iniciar sesión
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden md:flex text-xs lg:text-sm ml-4 md:ml-2"
                    onClick={() => setIsRegisterOpen(true)}
                  >
                    Registrarse
                  </Button>
                </>
              )}

              {isMounted ? (
                <LocalePreferencesModal>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex h-[40px] w-[40px] rounded-full border border-border bg-background text-foreground"
                  >
                    <Globe className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                </LocalePreferencesModal>
              ) : null}

              <ThemeToggle className="hidden md:flex" />

              {isMounted ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex h-[40px] w-[40px] rounded-full border border-border bg-background text-foreground"
                    >
                      <Download className="h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-transparent border-none shadow-none">
                    <QRCodeContent />
                  </PopoverContent>
                </Popover>
              ) : null}

              {isMounted ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="xl:hidden h-[40px] w-[40px] rounded-full border border-border bg-background text-foreground"
                    >
                      <Menu className="!h-5 !w-5" />
                    </Button>
                  </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[260px] border-l border-border p-0 [&>button]:hidden"
                >
                  <SheetHeader className="relative p-4 border-b border-border">
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-[0px] top-[1.15rem] h-[40px] w-[40px] rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>

                    <SheetTitle>
                      <div className="flex items-center space-x-2">
                        <BrandLogo />
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="py-4">
                    <nav className="flex flex-col space-y-0 px-4">
                      {navMenus.map((menu) => (
                        <Link
                          key={menu.label}
                          href={menu.sections[0].items[0].href}
                          className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/50"
                        >
                          {menu.label}
                          <span className="text-xs">›</span>
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-6 px-4 space-y-4">
                      {user ? (
                        <>
                          <div className="flex items-center gap-3 px-1 pb-2 border-b border-border">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={userAvatarUrl}
                                alt={user.name}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
                                {userInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground font-medium truncate">
                                {user.username || user.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <SheetClose asChild>
                            <Button
                              variant="outline"
                              className="w-full text-sm"
                              asChild
                            >
                              <Link href="/dashboard">Mi cuenta</Link>
                            </Button>
                          </SheetClose>
                          <Button
                            variant="ghost"
                            className="w-full text-sm text-destructive hover:text-destructive"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar sesión
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="w-full text-sm"
                            onClick={() => setIsLoginOpen(true)}
                          >
                            Iniciar sesión
                          </Button>
                          <Button
                            variant="default"
                            className="w-full text-sm"
                            onClick={() => setIsRegisterOpen(true)}
                          >
                            Registrarse
                          </Button>
                        </>
                      )}
                      <LocalePreferencesModal>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 text-sm"
                        >
                          <Globe className="h-4 w-4" />
                          Idioma, país y moneda
                        </Button>
                      </LocalePreferencesModal>
                      <ThemeToggle showLabel />
                    </div>
                  </div>
                </SheetContent>
                </Sheet>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* MODAL LOGIN FUERA DEL HEADER */}
      <LoginModal
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onRegisterClick={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />
      <RegisterModal
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onLoginClick={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </>
  );
}
