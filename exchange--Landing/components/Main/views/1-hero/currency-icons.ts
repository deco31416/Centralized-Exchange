/**
 * Mapa de íconos locales por código de moneda.
 * Fuente: /public/images/logos/{carpeta}/{archivo}.svg
 * Usado como fallback cuando la API no retorna imgUrl.
 *
 * IMPORTANTE: Solo incluir entradas cuyos archivos existen y son servibles.
 * Si el archivo tiene un nombre con caracteres problemáticos (espacios, etc.)
 * NO incluir la entrada — la moneda queda como "asset faltante".
 *
 * Pendientes de icono (asset faltante):
 *   PAB — archivo: panama-pa-usd-logo_z4yis6 1.svg (espacio en nombre, no servible)
 */
export const LOCAL_CURRENCY_ICONS: Record<string, string> = {
  // ── Interno deco-exchange ─────────────────────────────────────────────────────
  BLC: "/images/logos/stablecoin/blc-deco-exchange-credit-logo.svg",

  // ── Fiat ─────────────────────────────────────────────────────────────────
  ARS: "/images/logos/FiatAccepted/argentina-ar-ars-logo_vhf9iy.svg",
  AWG: "/images/logos/FiatAccepted/aruba-aw-awg-logo_ygxapm.svg",
  BRL: "/images/logos/FiatAccepted/brasil-br-brl-logo_dcxcvj.svg",
  CAD: "/images/logos/FiatAccepted/canada-ca-cad-logo_cu35ca.svg",
  COP: "/images/logos/FiatAccepted/colombia-co-cop-logo_jc6iu2.svg",
  MXN: "/images/logos/FiatAccepted/mexico-mx-mxn-logo_ctxoht.svg",
  // PAB: pendiente — renombrar archivo (espacio en el nombre impide servirlo)
  PEN: "/images/logos/FiatAccepted/peru-pe-sol-logo_rbaixq.svg",
  DOP: "/images/logos/FiatAccepted/republicadomincana-do-dot-logo_kehpud.svg",
  EUR: "/images/logos/FiatAccepted/unioneuropea-eu-euro-logo_vpycdd.svg",
  USD: "/images/logos/FiatAccepted/usa-us-usd-logo_lx28hi.svg",
  VES: "/images/logos/FiatAccepted/venezuela-ve-ves-logo_s3y7me.svg",

  // ── Coins principales ─────────────────────────────────────────────────────
  AVAX: "/images/logos/coins/avalanche-avax-logo_qsvy4u.svg",
  BNB:  "/images/logos/coins/binancecoin-bnb-logo_ohkihi.svg",
  BTC:  "/images/logos/coins/bitcoin-btc-logo_vftsg2.svg",
  ADA:  "/images/logos/coins/cardano-ada-logo_wqdcwl.svg",
  DOGE: "/images/logos/coins/dogecoin-doge-logo_irw7os.svg",
  ETH:  "/images/logos/coins/ethereum-eth-logo_vgwnfh.svg",
  LTC:  "/images/logos/coins/litecoin-ltc-logo_xzaiai.svg",
  XMR:  "/images/logos/coins/monero-xmr-logo_khal3x.svg",
  OP:   "/images/logos/coins/optimism-op-logo_otizmd.svg",
  DOT:  "/images/logos/coins/polkadot-dot-logo_adc7sb.svg",
  POL:  "/images/logos/coins/polygon-pol-logo_ywvda8.svg",
  MATIC: "/images/logos/coins/polygon-pol-logo_ywvda8.svg",
  SOL:  "/images/logos/coins/solana-sol-logo_igkjzk.svg",
  XLM:  "/images/logos/coins/stellar-xlm-dark-logo_pfkyun.svg",
  TON:  "/images/logos/coins/toncoin-ton-logo_kp3fzb.svg",
  TRX:  "/images/logos/coins/tron-trx-logo_qia8hy.svg",
  XRP:  "/images/logos/coins/xrp-xrp-dark-logo_wl2vxs.svg",

  // ── Altcoins ──────────────────────────────────────────────────────────────
  AAVE:  "/images/logos/altcoins/aave-aave-logo_sccj4r.svg",
  APE:   "/images/logos/altcoins/apecoin-ape_fvgra5.svg",
  LINK:  "/images/logos/altcoins/chainlink-link-logo_svmufx.svg",
  NOW:   "/images/logos/altcoins/ChangeNOWToken-now-logo_vxjczj.svg",
  CRV:   "/images/logos/altcoins/curvedaotoken-crv-logo_shwxye.svg",
  FLOKI: "/images/logos/altcoins/floki-floki-logo_qp1fnb.svg",
  HNY:   "/images/logos/altcoins/honey-hny-logo_znvesx.svg",
  HYPE:  "/images/logos/altcoins/hyperliquid-hype-logo_jn4pvf.svg",
  JST:   "/images/logos/altcoins/just-jst-logo_zzjufq.svg",
  GLMR:  "/images/logos/altcoins/moonbeam-glmr-logo_zutz1y.svg",
  NEAR:  "/images/logos/altcoins/nearprotocol-near-logo_fxf5i8.svg",
  CAKE:  "/images/logos/altcoins/PancakeSwap-cake-logo_kzflv7.svg",
  PEPE:  "/images/logos/altcoins/pepe-pepe-logo_gsk8wz.svg",
  QUICK: "/images/logos/altcoins/quickswap-quick-logo_ynaggu.svg",
  RAY:   "/images/logos/altcoins/raydium-ray-logo_qlvwdb.svg",
  SHIB:  "/images/logos/altcoins/shibainu-shib-logo_lcgstq.svg",
  SUSHI: "/images/logos/altcoins/sushiswap-sushi-logo_o20k6a.svg",
  UNI:   "/images/logos/altcoins/uniswap-uni-logo_xvbylu.svg",
  WLD:   "/images/logos/altcoins/worldcoin-wld-dark-logo_nefjwe.svg",
  WBTC:  "/images/logos/altcoins/wrappedbitcoin-wbtc-logo_oakxqe.svg",

  // ── Stablecoins ───────────────────────────────────────────────────────────
  DAI:   "/images/logos/stablecoin/dai-dai-logo_irexm0.svg",
  USDD:  "/images/logos/stablecoin/decentralizedusd-usdd-logo_scxyir.svg",
  DEUSD: "/images/logos/stablecoin/elixir-deusd_t5isrt.svg",
  USDE:  "/images/logos/stablecoin/ethena-usde-logo_sjgi2o.svg",
  FDUSD: "/images/logos/stablecoin/firstdigitalusd-fdusd-logo_xtb7py.svg",
  FRAX:  "/images/logos/stablecoin/frax-frax-logo_pwgnjn.svg",
  GUSD:  "/images/logos/stablecoin/gemini-gusd-logo_qnz4r4.svg",
  OUSD:  "/images/logos/stablecoin/origindollar-ousd-logo_uipql0.svg",
  PYUSD: "/images/logos/stablecoin/paypal-pyusd-logo_xk0ckj.svg",
  USDT:  "/images/logos/stablecoin/tether-usdt-logo_nwgfgy.svg",
  TUSD:  "/images/logos/stablecoin/trueusd-tusd-logo_txmaob.svg",
  USDC:  "/images/logos/stablecoin/usdcoin-usdc-logo_rkqw1c.svg",
  USD0:  "/images/logos/stablecoin/usualusd-usd0-logo_pwbpeo.svg",
  XAUT:  "/images/logos/stablecoin/xaut_d02e413ebc_1_ojdrhv.svg",
  // ── Tokens propios (launchpad) ─────────────────────────────────────────────
  DECO:  "/images/logos/altcoins/deco31416-decot-logo.svg",

  XDAI:  "/images/logos/stablecoin/xdai-xdai-logo_avsvdr.svg",
};

/**
 * Retorna `true` solo si el código de moneda tiene una entrada real en el mapa local.
 * El placeholder genérico NO cuenta como icono válido.
 * Usar esta función para filtrar dropdowns antes de renderizar opciones.
 */
export function hasCurrencyIcon(code?: string): boolean {
  if (!code) return false;
  return Object.prototype.hasOwnProperty.call(
    LOCAL_CURRENCY_ICONS,
    code.trim().toUpperCase(),
  );
}
