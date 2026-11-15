import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type P2PAssetCatalogDocument = P2PAssetCatalog & Document;

/**
 * Catálogo de activos crypto disponibles para trading P2P en BlackCEX.
 *
 * Este catálogo es INDEPENDIENTE del asset-registry.
 * asset-registry gestiona activos operacionales del exchange (buy/sell/convert/send).
 * Este catálogo gestiona activos específicamente habilitados para el marketplace P2P.
 *
 * Campos notables:
 * - assetCode: código canónico del activo (BTC, ETH, USDT, USDC, BNB, TON)
 * - supportedFiatCodes: fiats en los que se puede cotizar este activo en el P2P
 * - requiresEscrow: siempre true en MVP — el crypto del vendedor se bloquea en escrow
 * - DECOX/DECO NO deben añadirse a este catálogo (son tokens internos, no públicos en P2P)
 */
@Schema({ timestamps: true, collection: 'p2p_asset_catalog' })
export class P2PAssetCatalog extends Document {
  // Código canónico del activo (PK lógica, unique)
  @Prop({ required: true, unique: true, uppercase: true })
  assetCode: string;

  // Nombre de visualización (ej: "Bitcoin", "Tether USD")
  @Prop({ required: true })
  displayName: string;

  // Descripción breve visible en UI
  @Prop()
  description: string;

  // Path relativo al logo SVG (sin CDN todavía — paths locales de blackCEX--Landing)
  @Prop()
  iconUrl: string;

  // true = visible y operable en el marketplace P2P
  @Prop({ default: true })
  enabled: boolean;

  // Lista de códigos fiat en los que se puede cotizar este activo
  // Ej: ['COP', 'MXN', 'PEN', 'USD', 'EUR', 'GBP', 'ARS', 'BRL', 'VES']
  @Prop({ type: [String], default: [] })
  supportedFiatCodes: string[];

  // Monto mínimo de crypto por anuncio P2P (en la unidad del activo, ej: 0.001 BTC)
  @Prop({ default: 0 })
  minCryptoAmount: number;

  // Monto máximo de crypto por anuncio P2P (0 = sin límite)
  @Prop({ default: 0 })
  maxCryptoAmount: number;

  // Siempre true en MVP — el crypto del vendedor se bloquea en escrow antes de la orden
  @Prop({ default: true })
  requiresEscrow: boolean;

  // Orden de presentación en selectors de UI (menor = primero)
  @Prop({ default: 99 })
  sortOrder: number;

  // true = visible pero no operativo todavía ("Próximamente")
  @Prop({ default: false })
  comingSoon: boolean;
}

export const P2PAssetCatalogSchema = SchemaFactory.createForClass(P2PAssetCatalog);

P2PAssetCatalogSchema.index({ enabled: 1, sortOrder: 1 });
// No duplicar index de assetCode — unique:true ya crea el índice
