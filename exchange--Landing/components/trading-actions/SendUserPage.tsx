"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { AlertTriangle, Bell, Loader2, ReceiptText, Search, ShieldCheck, UserCheck, Wallet, X } from "lucide-react"

import { useAuth } from "@/components/p2p/use-auth"
import {
  EasyCryptoConfirmModal,
  EasyCryptoHero,
  EasyCryptoHeroStat,
  EasyCryptoMetricCard,
  EasyCryptoPanel,
  EasyCryptoSummary,
} from "@/components/easy-crypto/easy-crypto-components"
import { useAllAssets, useQuote } from "@/hooks/use-quote"
import { ActionPageShell } from "@/components/trading-actions/ActionPageShell"
import { ActionStatusCard } from "@/components/trading-actions/ActionStatusCard"
import { AssetAmountInput } from "@/components/trading-actions/AssetAmountInput"
import { QuotePreviewCard } from "@/components/trading-actions/QuotePreviewCard"

interface FoundUser {
  _id: string
  email: string
  name?: string
  username?: string
}

const networksByAsset: Record<string, string[]> = {
  BTC: ["Bitcoin"],
  ETH: ["Ethereum", "Arbitrum", "Base"],
  USDT: ["TRON", "Ethereum", "BSC"],
  USDC: ["Ethereum", "Base", "Polygon"],
  SOL: ["Solana"],
}

export default function SendUserPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { cryptoAssets, fiatAssets, loading: assetsLoading } = useAllAssets()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FoundUser[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [recipient, setRecipient] = useState<FoundUser | null>(null)
  const [amount, setAmount] = useState("")
  const [asset, setAsset] = useState("USDT")
  const [network, setNetwork] = useState("TRON")
  const [reviewOpen, setReviewOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parsedAmount = parseFloat(amount) || 0
  const { data: quote, loading: quoteLoading, error: quoteError, refresh } = useQuote(asset, "USD", parsedAmount)
  const canShowQuote = parsedAmount > 0 && recipient !== null
  const canReview = Boolean(user && recipient && parsedAmount > 0)
  const assetNetworks = networksByAsset[asset.toUpperCase()] ?? ["Red principal"]
  const allAssets = assetsLoading ? [{ code: asset, label: asset }] : [...cryptoAssets, ...fiatAssets]

  async function searchUsers(q: string) {
    if (q.trim().length < 3) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    setSearchError(null)
    try {
      const res = await fetch(`/api/internal/users/search?q=${encodeURIComponent(q)}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      const list: FoundUser[] = Array.isArray(data) ? data : (data.users ?? data.data ?? [])
      setSearchResults(list)
    } catch (e: unknown) {
      setSearchError((e as Error).message || "Error al buscar usuarios")
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchUsers(value), 400)
  }

  function selectRecipient(foundUser: FoundUser) {
    setRecipient(foundUser)
    setSearchQuery(foundUser.email)
    setSearchResults([])
  }

  function clearRecipient() {
    setRecipient(null)
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <ActionPageShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <section className="space-y-6">
          <EasyCryptoHero
            title="Envía cripto"
            description="Mueve saldo cripto a otro usuario Deco o prepara una salida por red con destinatario, fee y confirmacion clara."
            aside={<EasyCryptoHeroStat label="Envio interno" value="0 fee" description="Entre usuarios Deco, sujeto a disponibilidad y verificacion." />}
          />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-5">
              <EasyCryptoPanel>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Destinatario</p>
                <div className="relative mt-4">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                    {recipient ? <UserCheck className="h-4 w-4 shrink-0 text-primary" /> : <Search className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      disabled={Boolean(recipient)}
                      placeholder="Email o usuario Deco"
                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
                    />
                    {searchLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {recipient && (
                      <button type="button" onClick={clearRecipient} className="text-muted-foreground hover:text-foreground" aria-label="Cambiar destinatario">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {searchResults.length > 0 && !recipient && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                      {searchResults.map((foundUser) => (
                        <button
                          key={foundUser._id}
                          type="button"
                          onClick={() => selectRecipient(foundUser)}
                          className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-accent"
                        >
                          <span className="text-sm font-black text-foreground">{foundUser.name || foundUser.username || foundUser.email}</span>
                          {(foundUser.name || foundUser.username) && <span className="text-xs text-muted-foreground">{foundUser.email}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {searchError && <p className="mt-2 text-xs text-destructive">{searchError}</p>}
                {!user && !authLoading && <p className="mt-2 text-xs text-amber-500">Necesitas iniciar sesion para buscar usuarios.</p>}
              </EasyCryptoPanel>

              <EasyCryptoPanel>
                <AssetAmountInput
                  label="Monto a enviar"
                  amount={amount}
                  onAmountChange={setAmount}
                  selectedAsset={asset}
                  onAssetChange={(value) => {
                    setAsset(value)
                    setNetwork((networksByAsset[value.toUpperCase()] ?? ["Red principal"])[0])
                  }}
                  assets={allAssets}
                  placeholder="0.00"
                />

                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Red</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {assetNetworks.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setNetwork(item)}
                        className={[
                          "rounded-xl border border-border bg-background px-3 py-3 text-sm font-black text-foreground transition hover:bg-card/70",
                          network === item ? "bg-primary/[0.05]" : "",
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </EasyCryptoPanel>

              {canShowQuote && (
                <QuotePreviewCard
                  from={asset}
                  to="USD"
                  amount={parsedAmount}
                  result={quote?.converted ?? 0}
                  rate={quote?.rate ?? 0}
                  timestamp={quote?.timestamp}
                  loading={quoteLoading}
                  error={quoteError}
                  onRefresh={refresh}
                />
              )}
            </div>

            <div className="space-y-5">
              <EasyCryptoPanel>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Tipo de envio</p>
                <div className="mt-4 grid gap-2">
                  {[
                    ["Usuario Deco", "Instantaneo interno", "Activo"],
                    ["Wallet externa", "Fee de red", "Mockup"],
                    ["QR cripto", "Lectura pendiente", "Mockup"],
                  ].map(([title, detail, status]) => (
                    <div key={title} className="flex min-h-[72px] items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                      <span>
                        <span className="block text-sm font-black text-foreground">{title}</span>
                        <span className="text-xs text-muted-foreground">{detail}</span>
                      </span>
                      <span className="text-xs font-bold text-primary">{status}</span>
                    </div>
                  ))}
                </div>
              </EasyCryptoPanel>

              <ActionStatusCard
                title="Transferencia pendiente"
                description="La busqueda de usuarios existe. La ejecucion de envio se conectara al endpoint de transferencias."
                debtCode="SENDUSER-BACKEND-001"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <EasyCryptoSummary title="Resumen de envio" icon={<ReceiptText className="h-4 w-4 text-primary" />}>
            <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Enviaras</p>
              <p className="mt-2 text-3xl font-black text-foreground">
                {parsedAmount || 0} {asset}
              </p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: "Destino", value: recipient?.email ?? "Selecciona usuario" },
                { label: "Red", value: network },
                { label: "Fee", value: recipient ? "0 interno" : "Pendiente" },
                { label: "Valor ref.", value: quote ? `${quote.converted.toLocaleString(undefined, { maximumFractionDigits: 4 })} USD` : "Pendiente" },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="max-w-[190px] text-right font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              disabled={!canReview}
              className="mt-5 flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Revisar envio
            </button>
          </EasyCryptoSummary>

          <div className="grid grid-cols-2 gap-3">
            <EasyCryptoMetricCard icon={<Wallet className="h-4 w-4" />} label="Fee" value={recipient ? "0" : "-"} detail="Envio interno" />
            <EasyCryptoMetricCard icon={<Bell className="h-4 w-4" />} label="Aviso" value="Real time" detail="Al receptor" />
          </div>

          <EasyCryptoPanel>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-black text-foreground">Firma segura</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              La confirmacion final debe validar red, destinatario y firma del usuario antes de mover fondos.
            </p>
          </EasyCryptoPanel>
        </aside>
      </main>

      <EasyCryptoConfirmModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Revisar envio"
        subtitle="Mockup listo para conectar al flujo de firma y transferencias."
        footer={
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center rounded-full bg-primary/40 px-4 py-3 text-sm font-bold text-primary-foreground opacity-70"
          >
            Firma final pendiente
          </button>
        }
      >
        <div className="space-y-3 text-sm">
          {[
            { label: "Destinatario", value: recipient?.email ?? "Pendiente" },
            { label: "Monto", value: `${parsedAmount} ${asset}` },
            { label: "Red", value: network },
            { label: "Fee", value: "0 interno" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-right font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
          <div className="flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            En wallet externa, una red incorrecta puede causar perdida irreversible.
          </div>
        </div>
      </EasyCryptoConfirmModal>
    </ActionPageShell>
  )
}
