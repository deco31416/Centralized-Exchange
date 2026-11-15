package config

import "os"

type LedgerConfig struct {
    DbName string
    CollectionTxs string
    CollectionEntries string
}

func GetLedgerConfig() LedgerConfig {
    return LedgerConfig{
        DbName: os.Getenv("LEDGER_DB_NAME", "deco_ledger_core"),
        CollectionTxs: "ledger_txs",
        CollectionEntries: "ledger_entries",
    }
}
