import { WalletTransactionsPage } from "@/components/biblioteca/transactions/wallet-transactions-page"

export default function TransactionsCompletadasPage() {
  return (
    <WalletTransactionsPage
      title="Transacciones completadas"
      description="Movimientos confirmados por wallet-ledger y disponibles para auditoría."
      mode="completed"
    />
  )
}
