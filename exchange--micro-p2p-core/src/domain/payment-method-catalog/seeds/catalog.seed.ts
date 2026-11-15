import { v4 as uuidv4 } from 'uuid';
import { PaymentMethodType } from '../../../shared/enums/p2p.enums';

const FALLBACK_ICON = '/images/logos/FiatMethods/default-fiat-method.svg';

/**
 * Catálogo semilla de métodos de pago P2P por país.
 *
 * REGLA: Estos métodos son EXTERNOS/OFF-PLATFORM.
 * NO representan saldos fiat internos de BlackCEX.
 * El comprador paga fiat fuera de BlackCEX por el método acordado.
 * BlackCEX gestiona la orden y el escrow crypto únicamente.
 *
 * Upsert key: { country, currency, providerCode } — idempotente.
 * catalogId solo se asigna en $setOnInsert (primer insert).
 */
export interface CatalogSeedEntry {
  country: string;
  currency: string;
  methodType: string;
  name: string;
  providerCode: string;
  displayName?: string;
  description?: string;
  enabled: boolean;
  requiresBankName: boolean;
  requiresAccountNumber: boolean;
  requiresAccountHolder: boolean;
  requiresDocumentId: boolean;
  instructions: string;
  iconUrl: string;
  logoUrl?: string;
  sortOrder: number;
  adminEditable: boolean;
  comingSoon: boolean;
}

export const PAYMENT_METHOD_CATALOG_SEED: CatalogSeedEntry[] = [
  // ─────────────────────────────────────────────
  // COLOMBIA — COP
  // ─────────────────────────────────────────────
  {
    country: 'CO', currency: 'COP', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Nequi', providerCode: 'nequi', displayName: 'Nequi',
    description: 'Billetera digital de Bancolombia',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia vía Nequi. Compartir número de celular registrado.',
    iconUrl: '/images/logos/FiatMethods/default-fiat-method.svg',
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'CO', currency: 'COP', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Daviplata', providerCode: 'daviplata', displayName: 'Daviplata',
    description: 'Billetera digital de Davivienda',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia vía Daviplata. Compartir número de celular registrado.',
    iconUrl: '/images/logos/FiatMethods/cop/daviplata.svg',
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'CO', currency: 'COP', methodType: PaymentMethodType.BANK,
    name: 'Bancolombia', providerCode: 'bancolombia', displayName: 'Bancolombia',
    description: 'Transferencia a cuenta Bancolombia',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia a cuenta Bancolombia. Indicar tipo de cuenta (ahorros/corriente) y número.',
    iconUrl: '/images/logos/FiatMethods/cop/bancolombia.svg',
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },
  {
    country: 'CO', currency: 'COP', methodType: PaymentMethodType.BANK,
    name: 'Transferencia Bancaria', providerCode: 'co-bank-transfer', displayName: 'Transferencia Bancaria',
    description: 'Transferencia bancaria estándar en Colombia',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia bancaria estándar en Colombia. Indicar banco, tipo de cuenta y número de cuenta.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 4, adminEditable: true, comingSoon: false,
  },
  {
    country: 'CO', currency: 'COP', methodType: PaymentMethodType.OTHER,
    name: 'BBVA Colombia', providerCode: 'bbva-co', displayName: 'BBVA',
    description: 'Transferencia a cuenta BBVA Colombia',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia a cuenta BBVA. Indicar número de cuenta y tipo.',
    iconUrl: '/images/logos/FiatMethods/cop/bbva.svg',
    sortOrder: 5, adminEditable: true, comingSoon: false,
  },
  {
    country: 'CO', currency: 'COP', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'MercadoPago Colombia', providerCode: 'mercadopago-co', displayName: 'MercadoPago',
    description: 'Billetera digital MercadoPago',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia vía MercadoPago Colombia. Compartir cuenta de usuario.',
    iconUrl: '/images/logos/FiatMethods/cop/mercadopago.svg',
    sortOrder: 6, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // MÉXICO — MXN
  // ─────────────────────────────────────────────
  {
    country: 'MX', currency: 'MXN', methodType: PaymentMethodType.TRANSFER,
    name: 'SPEI', providerCode: 'spei', displayName: 'SPEI',
    description: 'Sistema de Pagos Electrónicos Interbancarios 24/7',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia SPEI disponible 24/7. Proporcionar CLABE interbancaria (18 dígitos).',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'MX', currency: 'MXN', methodType: PaymentMethodType.BANK,
    name: 'BBVA México', providerCode: 'bbva-mx', displayName: 'BBVA México',
    description: 'Transferencia a cuenta BBVA México',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia a cuenta BBVA. Proporcionar CLABE o número de tarjeta.',
    iconUrl: '/images/logos/FiatMethods/cop/bbva.svg',
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'MX', currency: 'MXN', methodType: PaymentMethodType.BANK,
    name: 'Banorte', providerCode: 'banorte', displayName: 'Banorte',
    description: 'Transferencia a cuenta Banorte',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia a cuenta Banorte. Proporcionar CLABE interbancaria.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },
  {
    country: 'MX', currency: 'MXN', methodType: PaymentMethodType.BANK,
    name: 'Santander México', providerCode: 'santander-mx', displayName: 'Santander',
    description: 'Transferencia a cuenta Santander México',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia a cuenta Santander. Proporcionar CLABE interbancaria.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 4, adminEditable: true, comingSoon: false,
  },
  {
    country: 'MX', currency: 'MXN', methodType: PaymentMethodType.BANK,
    name: 'Transferencia Bancaria', providerCode: 'mx-bank-transfer', displayName: 'Transferencia Bancaria',
    description: 'Transferencia bancaria estándar en México',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia bancaria en México. Proporcionar CLABE interbancaria (18 dígitos) y banco de destino.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 5, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // PERÚ — PEN
  // ─────────────────────────────────────────────
  {
    country: 'PE', currency: 'PEN', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Yape', providerCode: 'yape', displayName: 'Yape',
    description: 'Billetera digital del BCP (Yape)',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Pago vía Yape. Compartir número de celular registrado en Yape.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'PE', currency: 'PEN', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Plin', providerCode: 'plin', displayName: 'Plin',
    description: 'Billetera digital Plin (BBVA/Interbank/Scotiabank)',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Pago vía Plin. Compartir número de celular registrado.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'PE', currency: 'PEN', methodType: PaymentMethodType.BANK,
    name: 'BCP', providerCode: 'bcp-pe', displayName: 'Banco de Crédito del Perú',
    description: 'Transferencia a cuenta BCP',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia a cuenta BCP. Indicar número de cuenta (CCI).',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },
  {
    country: 'PE', currency: 'PEN', methodType: PaymentMethodType.BANK,
    name: 'Interbank', providerCode: 'interbank-pe', displayName: 'Interbank',
    description: 'Transferencia a cuenta Interbank',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia a cuenta Interbank. Indicar número de cuenta o CCI.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 4, adminEditable: true, comingSoon: false,
  },
  {
    country: 'PE', currency: 'PEN', methodType: PaymentMethodType.BANK,
    name: 'Transferencia Bancaria', providerCode: 'pe-bank-transfer', displayName: 'Transferencia Bancaria',
    description: 'Transferencia bancaria estándar en Perú',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia bancaria estándar en Perú. Indicar banco, número de cuenta y CCI.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 5, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // EL SALVADOR — USD (SV)
  // ─────────────────────────────────────────────
  {
    country: 'SV', currency: 'USD', methodType: PaymentMethodType.BANK,
    name: 'Transferencia Bancaria', providerCode: 'sv-bank-transfer', displayName: 'Transferencia Bancaria',
    description: 'Transferencia bancaria en El Salvador (USD)',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia bancaria en El Salvador. Indicar banco, número de cuenta y DUI del titular.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'SV', currency: 'USD', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Chivo Wallet', providerCode: 'chivo-sv', displayName: 'Chivo Wallet',
    description: 'Billetera digital gubernamental de El Salvador',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Pago vía Chivo Wallet. Compartir número de celular o dirección Bitcoin registrada.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'SV', currency: 'USD', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Billetera Móvil', providerCode: 'sv-mobile-wallet', displayName: 'Billetera Móvil',
    description: 'Billetera digital móvil registrada',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Pago vía billetera digital móvil. Especificar nombre del proveedor y cuenta.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // CHILE — CLP
  // ─────────────────────────────────────────────
  {
    country: 'CL', currency: 'CLP', methodType: PaymentMethodType.BANK,
    name: 'BancoEstado', providerCode: 'bancoestado-cl', displayName: 'BancoEstado',
    description: 'Transferencia a cuenta BancoEstado',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia a cuenta BancoEstado. Indicar número de cuenta y RUT del titular.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'CL', currency: 'CLP', methodType: PaymentMethodType.BANK,
    name: 'Cuenta RUT', providerCode: 'cuenta-rut-cl', displayName: 'Cuenta RUT BancoEstado',
    description: 'Cuenta RUT de BancoEstado (acceso universal)',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia a Cuenta RUT. Proporcionar RUT del destinatario (el número de cuenta coincide con el RUT).',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'CL', currency: 'CLP', methodType: PaymentMethodType.BANK,
    name: 'Transferencia Bancaria', providerCode: 'cl-bank-transfer', displayName: 'Transferencia Bancaria',
    description: 'Transferencia bancaria estándar en Chile',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia bancaria estándar en Chile. Indicar banco, número de cuenta y RUT del titular.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // ARGENTINA — ARS
  // ─────────────────────────────────────────────
  {
    country: 'AR', currency: 'ARS', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'MercadoPago', providerCode: 'mercadopago-ar', displayName: 'MercadoPago',
    description: 'Billetera digital MercadoPago Argentina',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia vía MercadoPago. Alias CVU o CBU registrado en MercadoPago.',
    iconUrl: '/images/logos/FiatMethods/cop/mercadopago.svg',
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'AR', currency: 'ARS', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Ualá', providerCode: 'uala-ar', displayName: 'Ualá',
    description: 'Billetera digital Ualá Argentina',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferencia vía Ualá. Proporcionar CVU de la cuenta Ualá.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'AR', currency: 'ARS', methodType: PaymentMethodType.BANK,
    name: 'Transferencia Bancaria', providerCode: 'ar-bank-transfer', displayName: 'Transferencia Bancaria',
    description: 'Transferencia bancaria estándar en Argentina (CBU/CVU)',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia bancaria estándar. Proporcionar CBU o CVU (22 dígitos) y CUIL/CUIT del titular.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // BRASIL — BRL
  // ─────────────────────────────────────────────
  {
    country: 'BR', currency: 'BRL', methodType: PaymentMethodType.TRANSFER,
    name: 'PIX', providerCode: 'pix-br', displayName: 'PIX',
    description: 'Pagamento instantâneo brasileiro (Banco Central do Brasil)',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Pagamento via PIX. Fornecer chave PIX: CPF, CNPJ, e-mail, celular ou chave aleatória.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'BR', currency: 'BRL', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Nubank', providerCode: 'nubank-br', displayName: 'Nubank',
    description: 'Conta digital Nubank (Nu Pagamentos)',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transferência via Nubank. Fornecer chave PIX ou conta Nubank.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'BR', currency: 'BRL', methodType: PaymentMethodType.BANK,
    name: 'Transferência Bancária', providerCode: 'br-bank-transfer', displayName: 'Transferência Bancária',
    description: 'TED/DOC bancário padrão no Brasil',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'TED/DOC bancário padrão. Fornecer banco, agência, conta e CPF/CNPJ do titular.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // ESTADOS UNIDOS — USD
  // ─────────────────────────────────────────────
  {
    country: 'US', currency: 'USD', methodType: PaymentMethodType.BANK,
    name: 'ACH Transfer', providerCode: 'ach-us', displayName: 'ACH Transfer',
    description: 'Automated Clearing House — transferencia bancaria estándar',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'ACH bank transfer. Provide routing number (9 digits) and account number.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'US', currency: 'USD', methodType: PaymentMethodType.BANK,
    name: 'Wire Transfer', providerCode: 'wire-us', displayName: 'Wire Transfer',
    description: 'Transferencia Wire (nacional e internacional)',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Wire transfer. Provide bank name, routing number, account number, and SWIFT code for international.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'US', currency: 'USD', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Zelle', providerCode: 'zelle-us', displayName: 'Zelle',
    description: 'Red de pagos digital Zelle (integrada a bancos US)',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Send via Zelle. Provide registered email or phone number.',
    iconUrl: '/images/logos/FiatMethods/usd/zelle.svg',
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },
  {
    country: 'US', currency: 'USD', methodType: PaymentMethodType.BANK,
    name: 'Bank Transfer', providerCode: 'us-bank-transfer', displayName: 'Bank Transfer',
    description: 'Transferencia bancaria genérica en USA',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Standard US bank transfer. Provide bank name, routing number, and account number.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 4, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // UNIÓN EUROPEA — EUR
  // ─────────────────────────────────────────────
  {
    country: 'EU', currency: 'EUR', methodType: PaymentMethodType.TRANSFER,
    name: 'SEPA Transfer', providerCode: 'sepa-eu', displayName: 'SEPA',
    description: 'Transferencia SEPA dentro de la zona Euro',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'SEPA bank transfer. Provide IBAN and BIC/SWIFT code of the recipient bank.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'EU', currency: 'EUR', methodType: PaymentMethodType.BANK,
    name: 'Bank Transfer', providerCode: 'eu-bank-transfer', displayName: 'Bank Transfer',
    description: 'Transferencia bancaria estándar en zona Euro',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Standard EU bank transfer (IBAN + BIC required).',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'EU', currency: 'EUR', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Revolut', providerCode: 'revolut-eu', displayName: 'Revolut',
    description: 'Cuenta fintech Revolut (zona Euro)',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transfer via Revolut. Provide Revolut username or linked phone number.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },
  {
    country: 'EU', currency: 'EUR', methodType: PaymentMethodType.TRANSFER,
    name: 'Wise', providerCode: 'wise-eu', displayName: 'Wise (TransferWise)',
    description: 'Transferencia internacional vía Wise',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transfer via Wise. Provide Wise email or account reference.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 4, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // REINO UNIDO — GBP
  // ─────────────────────────────────────────────
  {
    country: 'GB', currency: 'GBP', methodType: PaymentMethodType.TRANSFER,
    name: 'Faster Payments', providerCode: 'faster-payments-gb', displayName: 'Faster Payments',
    description: 'UK Faster Payments Service (instantáneo)',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'UK Faster Payments. Provide Sort Code (6 digits) and Account Number (8 digits).',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'GB', currency: 'GBP', methodType: PaymentMethodType.BANK,
    name: 'Bank Transfer', providerCode: 'gb-bank-transfer', displayName: 'Bank Transfer',
    description: 'Transferencia bancaria estándar en Reino Unido',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Standard UK bank transfer. Provide Sort Code (6 digits) and Account Number (8 digits).',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'GB', currency: 'GBP', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Revolut', providerCode: 'revolut-gb', displayName: 'Revolut',
    description: 'Cuenta fintech Revolut (GBP)',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transfer via Revolut. Provide Revolut username or linked phone number.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },
  {
    country: 'GB', currency: 'GBP', methodType: PaymentMethodType.TRANSFER,
    name: 'Wise', providerCode: 'wise-gb', displayName: 'Wise (TransferWise)',
    description: 'Transferencia internacional vía Wise',
    enabled: true, requiresBankName: false, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: false,
    instructions: 'Transfer via Wise. Provide Wise email or account reference.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 4, adminEditable: true, comingSoon: false,
  },

  // ─────────────────────────────────────────────
  // VENEZUELA — VES
  // ─────────────────────────────────────────────
  {
    country: 'VE', currency: 'VES', methodType: PaymentMethodType.MOBILE_MONEY,
    name: 'Pago Móvil', providerCode: 'pago-movil-ve', displayName: 'Pago Móvil',
    description: 'Sistema de Pago Móvil Interbancario venezolano',
    enabled: true, requiresBankName: true, requiresAccountNumber: false, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Pago vía Pago Móvil. Proporcionar: banco, número de cédula (CI) y número de celular registrado.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 1, adminEditable: true, comingSoon: false,
  },
  {
    country: 'VE', currency: 'VES', methodType: PaymentMethodType.BANK,
    name: 'Banesco', providerCode: 'banesco-ve', displayName: 'Banesco',
    description: 'Transferencia a cuenta Banesco Venezuela',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia a cuenta Banesco. Indicar número de cuenta y cédula del titular.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 2, adminEditable: true, comingSoon: false,
  },
  {
    country: 'VE', currency: 'VES', methodType: PaymentMethodType.BANK,
    name: 'Banco de Venezuela', providerCode: 'bdv-ve', displayName: 'Banco de Venezuela',
    description: 'Transferencia a cuenta Banco de Venezuela',
    enabled: true, requiresBankName: false, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia a cuenta Banco de Venezuela (BDV). Indicar número de cuenta y cédula del titular.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 3, adminEditable: true, comingSoon: false,
  },
  {
    country: 'VE', currency: 'VES', methodType: PaymentMethodType.BANK,
    name: 'Transferencia Bancaria', providerCode: 've-bank-transfer', displayName: 'Transferencia Bancaria',
    description: 'Transferencia bancaria estándar en Venezuela',
    enabled: true, requiresBankName: true, requiresAccountNumber: true, requiresAccountHolder: true, requiresDocumentId: true,
    instructions: 'Transferencia bancaria estándar en Venezuela. Indicar banco, número de cuenta y cédula del titular.',
    iconUrl: FALLBACK_ICON,
    sortOrder: 4, adminEditable: true, comingSoon: false,
  },
];
