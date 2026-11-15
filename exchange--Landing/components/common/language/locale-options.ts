import type { ComponentType } from "react"
import * as Flags from "country-flag-icons/react/3x2"
import { languages } from "./languages"

export type FlagComponent = ComponentType<{ className?: string; title?: string }>

export type RegionOption = {
  value: string
  label: string
  code: string
  currency: string
  note: string
  Flag: FlagComponent
}

export type CurrencyOption = {
  value: string
  label: string
  symbol: string
  region: string
}

export const localeLanguages = languages

export const regions: RegionOption[] = [
  { value: "CO", label: "Colombia", code: "CO", currency: "COP", note: "Operación sujeta a disponibilidad local.", Flag: Flags.CO },
  { value: "US", label: "Estados Unidos", code: "US", currency: "USD", note: "Disponibilidad regulada por estado.", Flag: Flags.US },
  { value: "EU", label: "Unión Europea", code: "EU", currency: "EUR", note: "Preferencias para países de la UE.", Flag: Flags.EU },
  { value: "MX", label: "México", code: "MX", currency: "MXN", note: "Pagos y referencias en peso mexicano.", Flag: Flags.MX },
  { value: "CL", label: "Chile", code: "CL", currency: "CLP", note: "Referencias en peso chileno.", Flag: Flags.CL },
  { value: "PE", label: "Perú", code: "PE", currency: "PEN", note: "Referencias en sol peruano.", Flag: Flags.PE },
  { value: "AR", label: "Argentina", code: "AR", currency: "ARS", note: "Referencias en peso argentino.", Flag: Flags.AR },
  { value: "VE", label: "Venezuela", code: "VE", currency: "VES", note: "Referencias en bolívar venezolano.", Flag: Flags.VE },
  { value: "AW", label: "Aruba", code: "AW", currency: "AWG", note: "Referencias en florín arubeño.", Flag: Flags.AW },
  { value: "BR", label: "Brasil", code: "BR", currency: "BRL", note: "Referencias en real brasileño.", Flag: Flags.BR },
  { value: "DO", label: "República Dominicana", code: "DO", currency: "DOP", note: "Referencias en peso dominicano.", Flag: Flags.DO },
  { value: "CA", label: "Canadá", code: "CA", currency: "CAD", note: "Referencias en dólar canadiense.", Flag: Flags.CA },
  { value: "SV", label: "El Salvador", code: "SV", currency: "SVC", note: "Preferencias para pagos locales.", Flag: Flags.SV },
  { value: "PA", label: "Panamá", code: "PA", currency: "USD", note: "Referencias en dólar estadounidense.", Flag: Flags.PA },
]

export const currencies: CurrencyOption[] = [
  { value: "COP", label: "Peso colombiano", symbol: "$", region: "CO" },
  { value: "USD", label: "Dólar estadounidense", symbol: "$", region: "US" },
  { value: "EUR", label: "Euro", symbol: "€", region: "EU" },
  { value: "MXN", label: "Peso mexicano", symbol: "$", region: "MX" },
  { value: "CLP", label: "Peso chileno", symbol: "$", region: "CL" },
  { value: "PEN", label: "Sol peruano", symbol: "S/", region: "PE" },
  { value: "ARS", label: "Peso argentino", symbol: "$", region: "AR" },
  { value: "VES", label: "Bolívar venezolano", symbol: "Bs", region: "VE" },
  { value: "AWG", label: "Florín arubeño", symbol: "ƒ", region: "AW" },
  { value: "BRL", label: "Real brasileño", symbol: "R$", region: "BR" },
  { value: "DOP", label: "Peso dominicano", symbol: "RD$", region: "DO" },
  { value: "CAD", label: "Dólar canadiense", symbol: "$", region: "CA" },
  { value: "GBP", label: "Libra esterlina", symbol: "£", region: "GB" },
  { value: "JPY", label: "Yen japonés", symbol: "¥", region: "JP" },
  { value: "VND", label: "Dong vietnamita", symbol: "₫", region: "VN" },
  { value: "TRY", label: "Lira turca", symbol: "₺", region: "TR" },
  { value: "HKD", label: "Dólar de Hong Kong", symbol: "HK$", region: "HK" },
  { value: "IDR", label: "Rupia indonesia", symbol: "Rp", region: "ID" },
  { value: "INR", label: "Rupia india", symbol: "₹", region: "IN" },
  { value: "PHP", label: "Peso filipino", symbol: "₱", region: "PH" },
  { value: "CNY", label: "Yuan chino", symbol: "¥", region: "CN" },
  { value: "MYR", label: "Ringgit malayo", symbol: "RM", region: "MY" },
  { value: "TWD", label: "Dólar taiwanés", symbol: "NT$", region: "TW" },
  { value: "AUD", label: "Dólar australiano", symbol: "$", region: "AU" },
  { value: "CHF", label: "Franco suizo", symbol: "Fr", region: "CH" },
  { value: "EGP", label: "Libra egipcia", symbol: "EGP", region: "EG" },
  { value: "NGN", label: "Naira nigeriana", symbol: "NGN", region: "NG" },
  { value: "THB", label: "Baht tailandés", symbol: "฿", region: "TH" },
]
