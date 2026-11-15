import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentMethodType } from '../../../shared/enums/p2p.enums';

export type P2PPaymentMethodCatalogDocument = P2PPaymentMethodCatalog & Document;

@Schema({ timestamps: true })
export class P2PPaymentMethodCatalog {
  @Prop({ required: true, unique: true })
  catalogId: string;

  @Prop({ required: true, index: true })
  country: string;

  @Prop({ required: true, index: true })
  currency: string;

  @Prop({ required: true, enum: Object.values(PaymentMethodType) })
  methodType: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false })
  requiresBankName: boolean;

  @Prop({ default: false })
  requiresAccountNumber: boolean;

  @Prop({ default: false })
  requiresAccountHolder: boolean;

  @Prop({ default: false })
  requiresDocumentId: boolean;

  @Prop()
  minAmount: number;

  @Prop()
  maxAmount: number;

  @Prop()
  instructions: string;

  // Identificador interno canónico del proveedor (ej: 'nequi', 'spei', 'pix')
  // Upsert key secundario — permite actualizar sin duplicar al re-sembrar
  @Prop()
  providerCode: string;

  // Nombre de visualización en UI (puede diferir del name por localización)
  @Prop()
  displayName: string;

  // Descripción corta visible en UI (ej: "Billetera digital colombiana")
  @Prop()
  description: string;

  // Path relativo o URL de logo/icono (sin binarios en Mongo — solo paths/URLs)
  // A futuro se reemplazará con secureUrl de Cloudinary desde admin-panel
  @Prop()
  iconUrl: string;

  @Prop()
  logoUrl: string;

  // Orden de presentación en UI (menor = primero)
  @Prop({ default: 99 })
  sortOrder: number;

  // true = admin-panel puede editar instrucciones/imagen sin code deploy
  @Prop({ default: true })
  adminEditable: boolean;

  // true = visible en UI pero no operativo todavía ("Próximamente")
  @Prop({ default: false })
  comingSoon: boolean;
}

export const P2PPaymentMethodCatalogSchema = SchemaFactory.createForClass(P2PPaymentMethodCatalog);

P2PPaymentMethodCatalogSchema.index({ country: 1, currency: 1, enabled: 1 });
// Index para upsert idempotente en seed
P2PPaymentMethodCatalogSchema.index({ country: 1, currency: 1, providerCode: 1 }, { sparse: true });
