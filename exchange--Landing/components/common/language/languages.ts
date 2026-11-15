import type { ComponentType } from "react"
import * as Flags from "country-flag-icons/react/3x2"

type FlagComponent = ComponentType<{
  className?: string
  title?: string
}>

export type LanguageOption = {
  value: string
  label: string
  region: string
  Flag: FlagComponent
}

export const languages: LanguageOption[] = [
  { value: "es", label: "Español", region: "ES", Flag: Flags.ES },
  { value: "en", label: "English", region: "US", Flag: Flags.US },
  { value: "pt-BR", label: "Português", region: "BR", Flag: Flags.BR },
  { value: "ar", label: "العربية", region: "SA", Flag: Flags.SA },
  { value: "zh-CN", label: "中文", region: "CN", Flag: Flags.CN },
  { value: "zh-TW", label: "繁體中文", region: "TW", Flag: Flags.TW },
  { value: "ja", label: "日本語", region: "JP", Flag: Flags.JP },
  { value: "ko", label: "한국어", region: "KR", Flag: Flags.KR },
  { value: "hi", label: "हिन्दी", region: "IN", Flag: Flags.IN },
  { value: "ur", label: "اردو", region: "PK", Flag: Flags.PK },
  { value: "fa", label: "فارسی", region: "IR", Flag: Flags.IR },
  { value: "ru", label: "Русский", region: "RU", Flag: Flags.RU },
  { value: "pl", label: "Polski", region: "PL", Flag: Flags.PL },
  { value: "de", label: "Deutsch", region: "DE", Flag: Flags.DE },
  { value: "it", label: "Italiano", region: "IT", Flag: Flags.IT },
  { value: "el", label: "Ελληνικά", region: "GR", Flag: Flags.GR },
  { value: "nl", label: "Nederlands", region: "NL", Flag: Flags.NL },
  { value: "tr", label: "Türkçe", region: "TR", Flag: Flags.TR },
  { value: "vi", label: "Tiếng Việt", region: "VN", Flag: Flags.VN },
  { value: "th", label: "ภาษาไทย", region: "TH", Flag: Flags.TH },
  { value: "sq", label: "Shqip", region: "AL", Flag: Flags.AL },
  { value: "fr", label: "Français", region: "FR", Flag: Flags.FR },
  { value: "id", label: "Bahasa", region: "ID", Flag: Flags.ID },
  { value: "pap-AW", label: "Papiamento", region: "AW", Flag: Flags.AW },
  { value: "uk", label: "Українська", region: "UA", Flag: Flags.UA },
]
