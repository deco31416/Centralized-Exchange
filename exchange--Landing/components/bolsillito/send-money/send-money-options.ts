export type SendRecipient = {
  id: string
  name: string
  handle: string
  detail: string
}

export const mockRecipients: SendRecipient[] = [
  { id: "andres", name: "Andres Gomez", handle: "@andres", detail: "Usuario verificado" },
  { id: "laura", name: "Laura Mendez", handle: "@laura", detail: "Contacto frecuente" },
  { id: "deco-store", name: "Deco Store", handle: "@decostore", detail: "Comercio aliado" },
  { id: "familia", name: "Cuenta familiar", handle: "@familia", detail: "Grupo privado" },
]

const quickAmountsByCurrency: Record<string, number[]> = {
  COP: [10000, 25000, 50000, 100000],
  USD: [5, 10, 25, 50],
  EUR: [5, 10, 25, 50],
  MXN: [100, 250, 500, 1000],
  PEN: [20, 50, 100, 250],
  BRL: [20, 50, 100, 250],
}

export function getSendQuickAmounts(currency: string) {
  return quickAmountsByCurrency[currency.toUpperCase()] ?? [10, 25, 50, 100]
}
