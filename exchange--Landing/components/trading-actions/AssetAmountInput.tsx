"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { getAssetIconUrl } from "@/lib/assets/get-asset-icon-url"

interface AssetOption {
  code: string
  label: string
  name?: string
  source?: "fiat" | "crypto" | "stablecoin" | "launchpad" | "internal"
  iconUrl?: string
  logoUrl?: string
  isInternal?: boolean
  disabledReason?: string
}

interface AssetAmountInputProps {
  label: string
  amount: string
  onAmountChange: (val: string) => void
  selectedAsset: string
  onAssetChange: (code: string) => void
  assets: AssetOption[]
  disabled?: boolean
  placeholder?: string
}

export function AssetAmountInput({
  label,
  amount,
  onAmountChange,
  selectedAsset,
  onAssetChange,
  assets,
  disabled = false,
  placeholder = "0.00",
}: AssetAmountInputProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const selected = assets.find((a) => a.code === selectedAsset)
  const filteredAssets = assets.filter((asset) => {
    const term = query.trim().toLowerCase()
    return !term || asset.code.toLowerCase().includes(term) || asset.label.toLowerCase().includes(term) || asset.name?.toLowerCase().includes(term)
  })

  const typeLabel = (source?: AssetOption["source"], isInternal?: boolean) => {
    if (isInternal || source === "internal") return "Interno"
    if (source === "fiat") return "Fiat"
    if (source === "stablecoin") return "Stablecoin"
    if (source === "launchpad") return "Launchpad"
    return "Crypto"
  }

  const initials = (code: string) => code.slice(0, 3).toUpperCase()

  function handleAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    // Solo permitir números positivos y decimales
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      onAmountChange(val)
    }
  }

  function handleSelect(code: string) {
    onAssetChange(code)
    setOpen(false)
    setQuery("")
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-muted-foreground">{label}</label>
      <div className="grid min-h-[78px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmount}
          disabled={disabled}
          placeholder={placeholder}
          className="min-w-0 bg-transparent text-2xl font-black text-foreground outline-none placeholder:text-muted-foreground/45 disabled:cursor-not-allowed"
        />
        <div ref={containerRef} className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="flex min-w-[118px] items-center justify-between gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-black text-foreground transition hover:bg-muted disabled:cursor-not-allowed"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
              {selected ? (
                <img
                  src={getAssetIconUrl(selected.code, selected.logoUrl ?? selected.iconUrl)}
                  alt={selected.code}
                  className="h-7 w-7 rounded-full object-contain"
                />
              ) : (
                <span className="text-[10px] font-bold text-foreground/80">{initials(selectedAsset)}</span>
              )}
            </span>
            <span>{selectedAsset}</span>
            <ChevronDown className="h-3.5 w-3.5 text-primary" />
          </button>
          {open && assets.length > 0 && (
            <div className="absolute right-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
              <div className="border-b border-border p-2">
                <label className="flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-foreground">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar activo"
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </label>
              </div>
              <div role="listbox" className="max-h-80 overflow-y-auto p-1 dropdown-scroll">
                {filteredAssets.map((a) => (
                  <button
                    key={a.code}
                    type="button"
                    role="option"
                    aria-selected={a.code === selectedAsset}
                    disabled={Boolean(a.disabledReason)}
                    onClick={() => {
                      if (a.disabledReason) return
                      handleSelect(a.code)
                    }}
                    className={[
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
                      a.code === selectedAsset ? "bg-primary/[0.06]" : "",
                    ].join(" ")}
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
                      <img
                        src={getAssetIconUrl(a.code, a.logoUrl ?? a.iconUrl)}
                        alt={a.code}
                        className="h-8 w-8 rounded-full object-contain"
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-base font-black leading-none text-foreground">
                        {a.code}
                        {a.name && a.name !== a.code ? <span className="font-semibold text-muted-foreground"> · {a.name}</span> : ""}
                      </span>
                      <span className="mt-1 truncate text-xs text-muted-foreground">
                        {typeLabel(a.source, a.isInternal)}
                        {a.disabledReason ? ` · ${a.disabledReason}` : ""}
                      </span>
                    </span>
                  </button>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">No encontramos ese activo.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
