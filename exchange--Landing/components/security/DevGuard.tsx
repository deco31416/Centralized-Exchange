"use client";

import { useEffect, useRef } from "react";

const DEVTOOLS_ALLOWED = process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "true";
const DEVTOOLS_PROTECTION_ENABLED =
  process.env.NODE_ENV === "production" && !DEVTOOLS_ALLOWED;

const SIZE_THRESHOLD = 160;
const REDIRECT_DELAY = 7000;

export function DevGuard() {
  const triggered = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!DEVTOOLS_PROTECTION_ENABLED) return;

    const onDetected = () => {
      if (triggered.current) return;
      triggered.current = true;

      try {
        console.clear();
      } catch {
        // Ignore locked-down console environments.
      }

      try {
        console.log(
          "%cDECO31416",
          "color:#ff3b30;font-size:62px;font-weight:900;font-family:'Courier New',monospace;text-shadow:0 0 10px #ff3b30,0 0 20px #ff3b30,0 0 40px #ff0000;letter-spacing:4px;padding:20px 0;",
        );
        console.log(
          "%c---------------------------------------------",
          "color:#ff3b30;font-size:10px;",
        );
        console.log(
          "%cDETENTE!",
          "color:#ff3b30;font-size:28px;font-weight:900;text-shadow:1px 1px 2px rgba(0,0,0,0.5);",
        );
        console.log(
          "%cEsta funcion del navegador esta pensada para desarrolladores.\n\n" +
            "Si alguien te indico que copiaras y pegaras algo aqui para\n" +
            "activar una funcion de Deco Exchange, mover fondos o acceder\n" +
            "a una cuenta, se trata de un FRAUDE.\n\n" +
            "Si lo haces, esa persona podria acceder a tu cuenta.\n",
          "color:#ffa500;font-size:14px;font-family:system-ui;line-height:1.6;",
        );
        console.log(
          "%cVisita /legals para mas informacion de seguridad.",
          "color:#666;font-size:12px;font-style:italic;",
        );
        console.warn(
          "%cRedirigiendo en 7 segundos...",
          "color:#ff3b30;font-size:16px;font-weight:bold;background:#1a0000;padding:8px 12px;border-radius:4px;border:1px solid #ff3b30;",
        );
      } catch {
        // Console formatting is best-effort only.
      }

      if (redirectTimer.current) clearTimeout(redirectTimer.current);
      redirectTimer.current = setTimeout(() => {
        window.location.href = "/not-found";
      }, REDIRECT_DELAY);
    };

    const checkDimensions = () => {
      if (triggered.current) return;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > SIZE_THRESHOLD || heightDiff > SIZE_THRESHOLD) {
        onDetected();
      }
    };

    checkDimensions();
    window.addEventListener("resize", checkDimensions);
    const detectionInterval = setInterval(checkDimensions, 2000);

    const trapInterval = setInterval(() => {
      if (triggered.current) return;
      const trap = new Image();
      Object.defineProperty(trap, "id", {
        get() {
          onDetected();
          return "";
        },
      });

      try {
        console.debug("%c", trap);
      } catch {
        // Ignore locked-down console environments.
      }
    }, 3000);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F12") {
        event.preventDefault();
        onDetected();
        return;
      }

      if (event.ctrlKey && event.shiftKey && /^[IJCijc]$/.test(event.key)) {
        event.preventDefault();
        onDetected();
        return;
      }

      if (event.ctrlKey && /^[Uu]$/.test(event.key)) {
        event.preventDefault();
        onDetected();
        return;
      }

      if (event.metaKey && event.altKey && /^[Ii]$/.test(event.key)) {
        event.preventDefault();
        onDetected();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    const onContextMenu = (event: Event) => {
      event.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("contextmenu", onContextMenu, true);
      window.removeEventListener("resize", checkDimensions);
      clearInterval(detectionInterval);
      clearInterval(trapInterval);
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
        redirectTimer.current = null;
      }
    };
  }, []);

  return null;
}
