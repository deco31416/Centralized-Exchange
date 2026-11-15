"use client"

import { AdminModulePlaceholderPage } from "@/components/biblioteca/admin-module-placeholder-page"

export default function HotWalletsPage() {
  return (
    <AdminModulePlaceholderPage
      title="Hot wallets status"
      description="Monitoreo de wallets calientes, límites operativos, recargas y movimientos críticos."
      state="pending"
      percent={10}
      note="Pendiente conectar custody crypto, ledger y métricas reales de wallets por gateway admin."
      scopes={[
        {
          title: "Saldos",
          description: "Balances reales por red, moneda y wallet operativa.",
        },
        {
          title: "Umbrales",
          description: "Límites mínimos, alertas y políticas de recarga.",
        },
        {
          title: "Movimientos",
          description: "Barridos, recargas, retiros y auditoría de firmas.",
        },
      ]}
    />
  )
}
