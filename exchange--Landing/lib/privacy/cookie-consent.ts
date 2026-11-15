export type CookieCategoryId = "necessary" | "functional" | "analytics" | "advertising"

export type CookiePreference = Record<CookieCategoryId, boolean>

export type StoredCookieConsent = {
  version: 1
  savedAt: string
  preferences: CookiePreference
}

export const COOKIE_CONSENT_STORAGE_KEY = "deco_cookie_consent_v1"

export const defaultCookiePreferences: CookiePreference = {
  necessary: true,
  functional: false,
  analytics: false,
  advertising: false,
}

export const allCookiePreferences: CookiePreference = {
  necessary: true,
  functional: true,
  analytics: true,
  advertising: true,
}

export function normalizeCookiePreferences(preferences?: Partial<CookiePreference> | null): CookiePreference {
  return {
    ...defaultCookiePreferences,
    ...preferences,
    necessary: true,
  }
}

export function readCookieConsent(): StoredCookieConsent | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!storedConsent) {
      return null
    }

    const parsedConsent = JSON.parse(storedConsent) as Partial<StoredCookieConsent>
    return {
      version: 1,
      savedAt: parsedConsent.savedAt ?? new Date(0).toISOString(),
      preferences: normalizeCookiePreferences(parsedConsent.preferences),
    }
  } catch {
    return null
  }
}

export function persistCookieConsent(preferences: CookiePreference): StoredCookieConsent | null {
  if (typeof window === "undefined") {
    return null
  }

  const consent: StoredCookieConsent = {
    version: 1,
    savedAt: new Date().toISOString(),
    preferences: normalizeCookiePreferences(preferences),
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent))
  window.dispatchEvent(new CustomEvent("deco:cookies-changed", { detail: consent }))

  return consent
}
