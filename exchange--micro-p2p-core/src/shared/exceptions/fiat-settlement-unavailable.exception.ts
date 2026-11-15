import { ServiceUnavailableException } from '@nestjs/common';

/**
 * Lanzada cuando se intenta ejecutar una operación de hold/release/refund fiat
 * a través del rail INTERNAL_FIAT_WALLET, pero la infraestructura de holds reales
 * no está implementada.
 *
 * Deuda técnica registrada: P2P-FIAT-HOLD-INTEGRATION-001
 *
 * Requisitos bloqueantes:
 *   - wallet-ledger: lockAvailable(), releaseLockedToAccount(), refundLocked()
 *   - Nuevos ledger tx types: P2P_FIAT_LOCK, P2P_FIAT_RELEASE, P2P_FIAT_REFUND
 *   - custody-fiat: capa de holds fiat (hoy es solo webhook ingestion)
 */
export class FiatSettlementUnavailableException extends ServiceUnavailableException {
  constructor(operation: string) {
    super(
      `INTERNAL_FIAT_WALLET rail no disponible: la operación '${operation}' requiere holds fiat reales ` +
        `que aún no están implementados en wallet-ledger ni en custody-fiat. ` +
        `Ver deuda técnica: P2P-FIAT-HOLD-INTEGRATION-001.`,
    );
  }
}
