"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Globe, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BrandLogo } from "@/components/common/brand-logo";

const highlights = [
  { icon: Shield, label: "Seguridad para tus activos" },
  { icon: Zap, label: "Transacciones ágiles" },
  { icon: Globe, label: "Acceso global" },
];

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100vw-2rem)] border-border bg-background p-5 text-foreground shadow-2xl sm:max-w-[390px]">
        <DialogHeader className="flex flex-col items-center gap-2 space-y-0">
          <BrandLogo className="w-[180px]" variant="name" />
          <DialogTitle className="text-center text-xl font-bold leading-tight text-foreground">
            Bienvenido
          </DialogTitle>
          <DialogDescription className="max-w-[310px] text-center text-sm leading-relaxed text-muted-foreground">
            Intercambia activos digitales y dinero fiat con una experiencia simple, segura y global.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-1" />

        <div className="space-y-3 py-2">
          <div className="grid gap-2">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
                <Icon className="h-4 w-4 shrink-0 text-foreground" />
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <Alert
            variant="default"
            className="rounded-md border-amber-500/50 bg-amber-500/10 p-3 text-amber-900 dark:border-amber-400/50 dark:bg-amber-400/10 dark:text-amber-100"
          >
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
              <div>
                <AlertDescription className="text-xs font-medium leading-relaxed">
                  No ofrecemos servicios financieros
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <p className="text-center text-sm font-medium text-muted-foreground">
            Por{" "}
            <a
              href="https://www.deco31416.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary underline-offset-4 hover:underline"
            >
              DECO31416
            </a>
          </p>
        </div>

        <DialogFooter>
          <Button className="h-11 w-full border border-primary" onClick={() => setOpen(false)}>
            Explorar deco-exchange
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
