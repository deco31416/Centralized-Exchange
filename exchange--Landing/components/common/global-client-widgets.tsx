"use client"

import { CookieConsentModal } from "@/components/privacy/cookie-consent-modal"
import { DecoSupportWidget } from "@/components/support/deco-support-widget"
import { Toaster } from "@/components/ui/toaster"

export function GlobalClientWidgets() {
  return (
    <>
      <DecoSupportWidget />
      <CookieConsentModal />
      <Toaster />
    </>
  )
}
