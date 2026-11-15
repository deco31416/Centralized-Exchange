import { Injectable } from '@nestjs/common';
import type { FundingMethodsPort } from '../../application/ports/funding-methods.port';
import type { FundingMethodEntity } from '../../domain/entities/funding-method.entity';

@Injectable()
export class MockFundingMethodsAdapter implements FundingMethodsPort {
  private buildMethod(input: {
    code: string;
    name: string;
    description: string;
    fiatCode: string;
    country: string;
    type: FundingMethodEntity['type'];
    minAmount: number;
    maxAmount: number;
    requiresKyc: boolean;
    settlementTime: string;
    instructions: string;
    iconUrl: string;
    isInternal?: boolean;
    isManualDeposit?: boolean;
    adminEditable?: boolean;
    enabled?: boolean;
    disabledReason?: string;
    displayOrder: number;
    metadata?: Record<string, unknown>;
  }): FundingMethodEntity {
    return {
      code: input.code,
      methodCode: input.code,
      name: input.name,
      description: input.description,
      fiatCode: input.fiatCode,
      currency: input.fiatCode,
      country: input.country,
      type: input.type,
      minAmount: input.minAmount,
      maxAmount: input.maxAmount,
      requiresSavedCard: false,
      requiresKyc: input.requiresKyc,
      settlementTime: input.settlementTime,
      instructions: input.instructions,
      iconUrl: input.iconUrl,
      isInternal: input.isInternal === true,
      isManualDeposit: input.isManualDeposit === true,
      adminEditable: input.adminEditable ?? true,
      displayOrder: input.displayOrder,
      enabled: input.enabled ?? true,
      disabledReason: input.disabledReason,
      metadata: {
        rail: input.type,
        ...(input.metadata ?? {}),
      },
    };
  }

  private blcMethod(fiatCode: string, country: string, displayOrder: number): FundingMethodEntity {
    return this.buildMethod({
      code: 'authorized_store',
      name: 'Saldo interno BLC',
      description: 'Unidad interna BlackCEX. No es moneda fiat legal.',
      fiatCode,
      country,
      type: 'INTERNAL_BALANCE',
      minAmount: 1,
      maxAmount: 1000000,
      requiresKyc: false,
      settlementTime: 'instant',
      instructions: 'Usa saldo interno disponible en tu cuenta BlackCEX.',
      iconUrl: '/images/logos/stablecoin/blc-blackcex-credit-logo.svg',
      isInternal: true,
      isManualDeposit: false,
      adminEditable: true,
      displayOrder,
    });
  }

  private catalog: FundingMethodEntity[] = [
    // MX / MXN
    this.buildMethod({ code: 'spei', name: 'SPEI', description: 'Transferencia bancaria instantánea en México.', fiatCode: 'MXN', country: 'MX', type: 'SPEI', minAmount: 50, maxAmount: 250000, requiresKyc: true, settlementTime: '5-30m', instructions: 'Usa CLABE y referencia.', iconUrl: '/images/logos/FiatMethods/spei-logo.svg', displayOrder: 1 }),
    this.buildMethod({ code: 'card', name: 'Tarjeta débito/crédito', description: 'Pago con tarjeta nacional o internacional vía Stripe.', fiatCode: 'MXN', country: 'MX', type: 'CARD', minAmount: 10, maxAmount: 50000, requiresKyc: false, settlementTime: 'instant', instructions: 'Confirma OTP del emisor si aplica.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', displayOrder: 2 }),
    this.buildMethod({ code: 'oxxo', name: 'OXXO', description: 'Paga en efectivo en cualquier tienda OXXO con voucher generado por Stripe.', fiatCode: 'MXN', country: 'MX', type: 'OXXO', minAmount: 10, maxAmount: 10000, requiresKyc: false, settlementTime: '1-3d', instructions: 'Se genera un voucher. Preséntalo en caja OXXO antes de que expire.', iconUrl: '/images/logos/FiatMethods/cash-deposit-logo.svg', metadata: { stripePaymentMethod: 'oxxo' }, displayOrder: 3 }),
    this.buildMethod({ code: 'cash_deposit', name: 'Efectivo en tiendas', description: 'Pago referenciado en establecimientos autorizados.', fiatCode: 'MXN', country: 'MX', type: 'CASH', minAmount: 20, maxAmount: 20000, requiresKyc: true, settlementTime: '15-120m', instructions: 'Presenta referencia en caja.', iconUrl: '/images/logos/FiatMethods/cash-deposit-logo.svg', isManualDeposit: true, enabled: false, disabledReason: 'Próximamente disponible', displayOrder: 4 }),
    this.blcMethod('MXN', 'MX', 5),

    // CO / COP
    this.buildMethod({ code: 'pse', name: 'PSE / Transferencia bancaria', description: 'Débito en línea desde banca colombiana.', fiatCode: 'COP', country: 'CO', type: 'BANK_TRANSFER', minAmount: 10000, maxAmount: 100000000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Selecciona banco y confirma pago PSE.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 1 }),
    this.buildMethod({ code: 'bancolombia', name: 'Bancolombia', description: 'Transferencia directa desde Bancolombia.', fiatCode: 'COP', country: 'CO', type: 'BANK_TRANSFER', minAmount: 10000, maxAmount: 50000000, requiresKyc: true, settlementTime: '5-30m', instructions: 'Usa referencia única del depósito.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 2 }),
    this.buildMethod({ code: 'nequi', name: 'Nequi', description: 'Envío inmediato desde Nequi.', fiatCode: 'COP', country: 'CO', type: 'PAYMENT_APP', minAmount: 5000, maxAmount: 3000000, requiresKyc: false, settlementTime: 'instant', instructions: 'Paga al número empresarial habilitado.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 3 }),
    this.buildMethod({ code: 'daviplata', name: 'Daviplata', description: 'Transferencia móvil desde Daviplata.', fiatCode: 'COP', country: 'CO', type: 'PAYMENT_APP', minAmount: 5000, maxAmount: 3000000, requiresKyc: false, settlementTime: 'instant', instructions: 'Usa referencia para conciliación.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 4 }),
    this.buildMethod({ code: 'card', name: 'Tarjeta', description: 'Pago con tarjeta emitida en Colombia vía Stripe.', fiatCode: 'COP', country: 'CO', type: 'CARD', minAmount: 5000, maxAmount: 30000000, requiresKyc: false, settlementTime: 'instant', instructions: '3DS habilitado.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', metadata: { stripePaymentMethod: 'card' }, displayOrder: 5 }),
    this.blcMethod('COP', 'CO', 6),

    // VE / VES
    this.buildMethod({ code: 'pago_movil', name: 'Pago Móvil', description: 'Pago móvil interbancario venezolano.', fiatCode: 'VES', country: 'VE', type: 'MOBILE_PAYMENT', minAmount: 100, maxAmount: 5000000, requiresKyc: true, settlementTime: 'instant', instructions: 'Enviar comprobante con referencia bancaria.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 1 }),
    this.buildMethod({ code: 'banesco', name: 'Banesco', description: 'Transferencia bancaria Banesco.', fiatCode: 'VES', country: 'VE', type: 'BANK_TRANSFER', minAmount: 100, maxAmount: 5000000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Usa cuenta receptora y referencia.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 2 }),
    this.buildMethod({ code: 'banco_venezuela', name: 'Banco de Venezuela', description: 'Transferencia desde BDV.', fiatCode: 'VES', country: 'VE', type: 'BANK_TRANSFER', minAmount: 100, maxAmount: 5000000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Usa referencia del panel de depósito.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 3 }),
    this.buildMethod({ code: 'mercantil', name: 'Mercantil', description: 'Transferencia Mercantil.', fiatCode: 'VES', country: 'VE', type: 'BANK_TRANSFER', minAmount: 100, maxAmount: 5000000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Adjunta referencia para conciliación.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 4 }),
    this.buildMethod({ code: 'provincial', name: 'Provincial', description: 'Transferencia Provincial.', fiatCode: 'VES', country: 'VE', type: 'BANK_TRANSFER', minAmount: 100, maxAmount: 5000000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Valida titular y referencia.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 5 }),
    this.buildMethod({ code: 'bank_transfer', name: 'Transferencia bancaria', description: 'Transferencia bancaria nacional en VES.', fiatCode: 'VES', country: 'VE', type: 'BANK_TRANSFER', minAmount: 100, maxAmount: 5000000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Usa banco disponible de tu preferencia.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 6 }),
    this.blcMethod('VES', 'VE', 7),

    // PE / PEN
    this.buildMethod({ code: 'yape', name: 'Yape', description: 'Pago móvil vía Yape.', fiatCode: 'PEN', country: 'PE', type: 'PAYMENT_APP', minAmount: 5, maxAmount: 10000, requiresKyc: false, settlementTime: 'instant', instructions: 'Usa referencia yape de plataforma.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 1 }),
    this.buildMethod({ code: 'plin', name: 'Plin', description: 'Pago móvil vía Plin.', fiatCode: 'PEN', country: 'PE', type: 'PAYMENT_APP', minAmount: 5, maxAmount: 10000, requiresKyc: false, settlementTime: 'instant', instructions: 'Confirma referencia de conciliación.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 2 }),
    this.buildMethod({ code: 'bcp', name: 'BCP', description: 'Transferencia por BCP.', fiatCode: 'PEN', country: 'PE', type: 'BANK_TRANSFER', minAmount: 10, maxAmount: 100000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Transferir a cuenta BCP corporativa.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 3 }),
    this.buildMethod({ code: 'interbank', name: 'Interbank', description: 'Transferencia por Interbank.', fiatCode: 'PEN', country: 'PE', type: 'BANK_TRANSFER', minAmount: 10, maxAmount: 100000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Usa referencia única.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 4 }),
    this.buildMethod({ code: 'bank_transfer', name: 'Transferencia bancaria', description: 'Transferencia nacional en PEN.', fiatCode: 'PEN', country: 'PE', type: 'BANK_TRANSFER', minAmount: 10, maxAmount: 100000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Depósito por banca local.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 5 }),
    this.buildMethod({ code: 'card', name: 'Tarjeta', description: 'Tarjeta de débito o crédito vía Stripe.', fiatCode: 'PEN', country: 'PE', type: 'CARD', minAmount: 10, maxAmount: 25000, requiresKyc: false, settlementTime: 'instant', instructions: '3DS obligatorio según emisor.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', metadata: { stripePaymentMethod: 'card' }, displayOrder: 6 }),
    this.blcMethod('PEN', 'PE', 7),

    // BR / BRL
    this.buildMethod({ code: 'pix', name: 'PIX', description: 'Transferencia inmediata con PIX.', fiatCode: 'BRL', country: 'BR', type: 'PIX', minAmount: 5, maxAmount: 300000, requiresKyc: true, settlementTime: 'instant', instructions: 'Escanea QR PIX o usa clave.', iconUrl: '/images/logos/FiatMethods/pix-logo.svg', isManualDeposit: true, displayOrder: 1 }),
    this.buildMethod({ code: 'nubank', name: 'Nubank', description: 'Transferencia vía Nubank.', fiatCode: 'BRL', country: 'BR', type: 'BANK_TRANSFER', minAmount: 10, maxAmount: 100000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Usa referencia bancaria.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 2 }),
    this.buildMethod({ code: 'bank_transfer', name: 'Transferencia bancaria', description: 'Transferencia bancaria en BRL.', fiatCode: 'BRL', country: 'BR', type: 'BANK_TRANSFER', minAmount: 10, maxAmount: 300000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Transferencia TED/PIX manual.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 3 }),
    this.buildMethod({ code: 'card', name: 'Tarjeta', description: 'Pago con tarjeta en BRL vía Stripe.', fiatCode: 'BRL', country: 'BR', type: 'CARD', minAmount: 10, maxAmount: 50000, requiresKyc: false, settlementTime: 'instant', instructions: 'Tarjetas habilitadas por BIN.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', metadata: { stripePaymentMethod: 'card' }, displayOrder: 4 }),
    this.buildMethod({ code: 'boleto', name: 'Boleto Bancário', description: 'Paga con boleto bancário en cualquier banco o lotérica. Procesado por Stripe.', fiatCode: 'BRL', country: 'BR', type: 'BOLETO', minAmount: 10, maxAmount: 50000, requiresKyc: true, settlementTime: '1-3d', instructions: 'Se genera un boleto PDF. Paga antes del vencimiento en banco o app.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', metadata: { stripePaymentMethod: 'boleto' }, displayOrder: 5 }),
    this.buildMethod({ code: 'pix_stripe', name: 'PIX (Stripe)', description: 'Transferencia PIX instantánea procesada directamente por Stripe.', fiatCode: 'BRL', country: 'BR', type: 'PIX_STRIPE', minAmount: 5, maxAmount: 100000, requiresKyc: false, settlementTime: 'instant', instructions: 'Se genera un QR PIX. Escanea con tu app bancaria.', iconUrl: '/images/logos/FiatMethods/pix-logo.svg', metadata: { stripePaymentMethod: 'pix' }, displayOrder: 6 }),
    this.blcMethod('BRL', 'BR', 7),

    // AR / ARS
    this.buildMethod({ code: 'mercadopago', name: 'MercadoPago', description: 'Pago con cuenta MercadoPago.', fiatCode: 'ARS', country: 'AR', type: 'PAYMENT_APP', minAmount: 100, maxAmount: 2000000, requiresKyc: true, settlementTime: 'instant', instructions: 'Confirma referencia de pago.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 1 }),
    this.buildMethod({ code: 'uala', name: 'Ualá', description: 'Pago desde Ualá.', fiatCode: 'ARS', country: 'AR', type: 'PAYMENT_APP', minAmount: 100, maxAmount: 1000000, requiresKyc: true, settlementTime: 'instant', instructions: 'Transferencia con referencia.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 2 }),
    this.buildMethod({ code: 'bank_transfer', name: 'Transferencia bancaria', description: 'Transferencia CBU/CVU en ARS.', fiatCode: 'ARS', country: 'AR', type: 'BANK_TRANSFER', minAmount: 100, maxAmount: 4000000, requiresKyc: true, settlementTime: '5-120m', instructions: 'Usar CBU corporativa.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 3 }),
    this.buildMethod({ code: 'card', name: 'Tarjeta', description: 'Tarjeta de débito/crédito vía Stripe.', fiatCode: 'ARS', country: 'AR', type: 'CARD', minAmount: 100, maxAmount: 1500000, requiresKyc: false, settlementTime: 'instant', instructions: 'Puede requerir 3DS.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', metadata: { stripePaymentMethod: 'card' }, displayOrder: 4 }),
    this.blcMethod('ARS', 'AR', 5),

    // CL / CLP
    this.buildMethod({ code: 'bancoestado', name: 'BancoEstado', description: 'Transferencia vía BancoEstado.', fiatCode: 'CLP', country: 'CL', type: 'BANK_TRANSFER', minAmount: 1000, maxAmount: 10000000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Transferencia a cuenta BancoEstado.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 1 }),
    this.buildMethod({ code: 'cuenta_rut', name: 'Cuenta RUT', description: 'Depósito/transferencia desde Cuenta RUT.', fiatCode: 'CLP', country: 'CL', type: 'BANK_TRANSFER', minAmount: 1000, maxAmount: 3000000, requiresKyc: true, settlementTime: '5-60m', instructions: 'Usa referencia obligatoria.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 2 }),
    this.buildMethod({ code: 'bank_transfer', name: 'Transferencia bancaria', description: 'Transferencia nacional en CLP.', fiatCode: 'CLP', country: 'CL', type: 'BANK_TRANSFER', minAmount: 1000, maxAmount: 10000000, requiresKyc: true, settlementTime: '5-120m', instructions: 'Compatible con bancos chilenos.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 3 }),
    this.buildMethod({ code: 'card', name: 'Tarjeta', description: 'Tarjeta emitida en Chile vía Stripe.', fiatCode: 'CLP', country: 'CL', type: 'CARD', minAmount: 1000, maxAmount: 5000000, requiresKyc: false, settlementTime: 'instant', instructions: 'Tarjetas habilitadas.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', metadata: { stripePaymentMethod: 'card' }, displayOrder: 4 }),
    this.blcMethod('CLP', 'CL', 5),

    // US / USD
    this.buildMethod({ code: 'card', name: 'Tarjeta', description: 'Tarjeta en USD vía Stripe.', fiatCode: 'USD', country: 'US', type: 'CARD', minAmount: 5, maxAmount: 75000, requiresKyc: false, settlementTime: 'instant', instructions: 'Tarjeta con 3DS.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', metadata: { stripePaymentMethod: 'card' }, displayOrder: 1 }),
    this.buildMethod({ code: 'ach_debit', name: 'ACH Direct Debit', description: 'Débito directo desde cuenta bancaria estadounidense vía Stripe.', fiatCode: 'USD', country: 'US', type: 'ACH_DEBIT', minAmount: 5, maxAmount: 500000, requiresKyc: true, settlementTime: '1-2d', instructions: 'Conecta tu cuenta bancaria. Stripe valida con microdepósitos.', iconUrl: '/images/logos/FiatMethods/ach-logo.svg', metadata: { stripePaymentMethod: 'us_bank_account' }, displayOrder: 2 }),
    this.buildMethod({ code: 'ach', name: 'ACH (manual)', description: 'Transferencia ACH doméstica manual.', fiatCode: 'USD', country: 'US', type: 'ACH', minAmount: 5, maxAmount: 500000, requiresKyc: true, settlementTime: '1-2d', instructions: 'Conecta cuenta bancaria y valida microdepósitos.', iconUrl: '/images/logos/FiatMethods/ach-logo.svg', isManualDeposit: true, enabled: false, disabledReason: 'Próximamente disponible', displayOrder: 3 }),
    this.buildMethod({ code: 'wire', name: 'Wire Transfer', description: 'Transferencia bancaria wire.', fiatCode: 'USD', country: 'US', type: 'WIRE', minAmount: 20, maxAmount: 2000000, requiresKyc: true, settlementTime: 'same-day', instructions: 'Usa datos SWIFT/ABA.', iconUrl: '/images/logos/FiatMethods/wire-logo.svg', isManualDeposit: true, displayOrder: 4 }),
    this.buildMethod({ code: 'zelle', name: 'Zelle', description: 'Pago instantáneo por Zelle.', fiatCode: 'USD', country: 'US', type: 'PAYMENT_APP', minAmount: 10, maxAmount: 10000, requiresKyc: true, settlementTime: 'instant', instructions: 'Transferencia al correo/telefono empresarial.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 5 }),
    this.blcMethod('USD', 'US', 6),

    // EU / EUR
    this.buildMethod({ code: 'card', name: 'Tarjeta', description: 'Tarjeta en EUR vía Stripe. Visa/Mastercard/Amex.', fiatCode: 'EUR', country: 'EU', type: 'CARD', minAmount: 5, maxAmount: 50000, requiresKyc: false, settlementTime: 'instant', instructions: 'Tarjetas emitidas en la zona euro.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', metadata: { stripePaymentMethod: 'card' }, displayOrder: 1 }),
    this.buildMethod({ code: 'sepa_debit', name: 'SEPA Direct Debit', description: 'Débito directo desde cuenta bancaria IBAN vía Stripe. Sin tarjeta.', fiatCode: 'EUR', country: 'EU', type: 'SEPA_DEBIT', minAmount: 5, maxAmount: 500000, requiresKyc: true, settlementTime: '1-3d', instructions: 'Proporciona tu IBAN. Stripe autoriza el débito.', iconUrl: '/images/logos/FiatMethods/sepa-logo.svg', metadata: { stripePaymentMethod: 'sepa_debit' }, displayOrder: 2 }),
    this.buildMethod({ code: 'ideal', name: 'iDEAL', description: 'Pago desde banca en línea holandesa vía Stripe.', fiatCode: 'EUR', country: 'NL', type: 'IDEAL', minAmount: 1, maxAmount: 50000, requiresKyc: false, settlementTime: 'instant', instructions: 'Selecciona tu banco y confirma en tu app bancaria.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', metadata: { stripePaymentMethod: 'ideal' }, displayOrder: 3 }),
    this.buildMethod({ code: 'sepa', name: 'SEPA (transferencia manual)', description: 'Transferencia SEPA manual en euros.', fiatCode: 'EUR', country: 'EU', type: 'SEPA', minAmount: 5, maxAmount: 500000, requiresKyc: true, settlementTime: '1d', instructions: 'Usa IBAN y referencia.', iconUrl: '/images/logos/FiatMethods/sepa-logo.svg', isManualDeposit: true, displayOrder: 4 }),
    this.buildMethod({ code: 'wise', name: 'Wise', description: 'Transferencia vía Wise.', fiatCode: 'EUR', country: 'EU', type: 'BANK_TRANSFER', minAmount: 5, maxAmount: 250000, requiresKyc: true, settlementTime: '1d', instructions: 'Enviar por cuenta Wise empresarial.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 5 }),
    this.buildMethod({ code: 'revolut', name: 'Revolut', description: 'Transferencia vía Revolut.', fiatCode: 'EUR', country: 'EU', type: 'BANK_TRANSFER', minAmount: 5, maxAmount: 250000, requiresKyc: true, settlementTime: 'instant', instructions: 'Usar referencia obligatoria.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 6 }),
    this.blcMethod('EUR', 'EU', 7),

    // UK / GBP
    this.buildMethod({ code: 'faster_payments', name: 'Faster Payments', description: 'Transferencia instantánea en Reino Unido.', fiatCode: 'GBP', country: 'GB', type: 'BANK_TRANSFER', minAmount: 5, maxAmount: 250000, requiresKyc: true, settlementTime: 'instant', instructions: 'Usa sort code/account con referencia.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 1 }),
    this.buildMethod({ code: 'bank_transfer', name: 'Bank Transfer', description: 'Transferencia bancaria local en GBP.', fiatCode: 'GBP', country: 'GB', type: 'BANK_TRANSFER', minAmount: 5, maxAmount: 250000, requiresKyc: true, settlementTime: '1d', instructions: 'Transferencia local en libras.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 2 }),
    this.buildMethod({ code: 'wise', name: 'Wise', description: 'Transferencia vía Wise en GBP.', fiatCode: 'GBP', country: 'GB', type: 'BANK_TRANSFER', minAmount: 5, maxAmount: 250000, requiresKyc: true, settlementTime: '1d', instructions: 'Enviar a cuenta Wise corporativa.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 3 }),
    this.buildMethod({ code: 'revolut', name: 'Revolut', description: 'Transferencia vía Revolut en GBP.', fiatCode: 'GBP', country: 'GB', type: 'BANK_TRANSFER', minAmount: 5, maxAmount: 250000, requiresKyc: true, settlementTime: 'instant', instructions: 'Usa referencia única.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 4 }),
    this.buildMethod({ code: 'card', name: 'Tarjeta', description: 'Tarjeta en GBP vía Stripe.', fiatCode: 'GBP', country: 'GB', type: 'CARD', minAmount: 5, maxAmount: 50000, requiresKyc: false, settlementTime: 'instant', instructions: '3DS según emisor.', iconUrl: '/images/logos/FiatMethods/credit-card-logo.svg', metadata: { stripePaymentMethod: 'card' }, displayOrder: 5 }),
    this.blcMethod('GBP', 'GB', 6),

    // SV / SVC
    this.buildMethod({ code: 'bank_transfer', name: 'Transferencia bancaria', description: 'Transferencia bancaria en El Salvador.', fiatCode: 'SVC', country: 'SV', type: 'BANK_TRANSFER', minAmount: 5, maxAmount: 100000, requiresKyc: true, settlementTime: '5-120m', instructions: 'Transferir a cuenta corporativa SV.', iconUrl: '/images/logos/FiatMethods/bank-transfer-logo.svg', isManualDeposit: true, displayOrder: 1 }),
    this.buildMethod({ code: 'chivo_wallet', name: 'Chivo Wallet', description: 'Pago desde Chivo Wallet.', fiatCode: 'SVC', country: 'SV', type: 'PAYMENT_APP', minAmount: 5, maxAmount: 20000, requiresKyc: true, settlementTime: 'instant', instructions: 'Enviar con referencia de depósito.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 2 }),
    this.buildMethod({ code: 'mobile_wallet', name: 'Mobile Wallet', description: 'Billetera móvil local compatible.', fiatCode: 'SVC', country: 'SV', type: 'MOBILE_PAYMENT', minAmount: 5, maxAmount: 20000, requiresKyc: true, settlementTime: 'instant', instructions: 'Usar billetera móvil autorizada.', iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg', isManualDeposit: true, displayOrder: 3 }),
    this.blcMethod('SVC', 'SV', 4),
  ];

  async getAvailableMethods(filters?: {
    fiatCode?: string;
    countryCode?: string;
  }): Promise<FundingMethodEntity[]> {
    const fiatCode = filters?.fiatCode?.trim().toUpperCase();
    const countryCode = filters?.countryCode?.trim().toUpperCase();

    return this.catalog.filter((method) => {
      if (fiatCode && method.currency.toUpperCase() !== fiatCode) return false;
      if (countryCode && method.country?.toUpperCase() !== countryCode) return false;
      return true;
    });
  }

  async listAllMethods(): Promise<FundingMethodEntity[]> {
    return [...this.catalog].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }

  async getMethodByCode(code: string): Promise<FundingMethodEntity | null> {
    return this.catalog.find((m) => m.code === code) ?? null;
  }

  async createMethod(method: FundingMethodEntity): Promise<FundingMethodEntity> {
    const created: FundingMethodEntity = {
      ...method,
      methodCode: method.methodCode ?? method.code,
      enabled: method.enabled ?? true,
      displayOrder: method.displayOrder ?? 999,
      requiresSavedCard: method.requiresSavedCard ?? false,
    };
    this.catalog.push(created);
    return created;
  }

  async updateMethod(code: string, changes: Partial<FundingMethodEntity>): Promise<FundingMethodEntity | null> {
    const method = this.catalog.find((m) => m.code === code);
    if (!method) return null;
    Object.assign(method, changes);
    return method;
  }
}