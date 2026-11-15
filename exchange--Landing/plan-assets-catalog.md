# Plan Assets Catalog - Deco Exchange

Documento de control tipo Jira para crear el catalogo publico de activos, monedas fiat, criptoactivos, tokens internos y metodos de pago de Deco Exchange.

Decision de arquitectura: el catalogo de producto vive en `/assets`. Las paginas legales siguen en `/legals/*` y se enlazan como respaldo normativo, no como experiencia principal.

---

## Principios

- `/assets` es producto, navegacion, educacion y disponibilidad comercial.
- `/legals` es reglas, riesgos, condiciones, terminos y cumplimiento.
- Cada activo o metodo debe tener URL propia cuando sea relevante para usuario, SEO, soporte o backend.
- Las fichas deben ser publicas sin login, pero nunca mostrar datos personales.
- Los datos personales, saldos, limites, wallets, referencias, cuentas destino, historial y acciones operativas requieren login.
- Todo debe quedar componentizado antes de conectar backend.
- TradingView se usa solo cuando exista simbolo publico confiable.
- Tokens internos o activos sin ticker publico usan grafica Deco propia.
- Fiat usa grafica de tasa/cambio, no necesariamente TradingView.
- Metodos de pago usan disponibilidad, limites, tiempos y productos soportados, no grafica de precio.
- Las rutas deben renderizar con datos compartidos, no con paginas hardcodeadas por activo.
- Toda ficha debe tener estado `available`, `limited`, `coming-soon`, `disabled` o `unsupported`.
- La disponibilidad publica es general; la disponibilidad real del usuario depende de login, pais, KYC y backend.

---

## Alcance MVP

Para evitar construir demasiado de una vez, el primer release debe cubrir:

| Tipo | Items MVP | Motivo |
|---|---|---|
| Cripto | BTC, ETH, SOL, USDT, USDC | Activos principales y soporte TradingView/mercado. |
| Fiat | USD, COP, MXN | Base global, Colombia y Mexico como casos iniciales. |
| Token Deco | DECOToken | Separar producto de legal. |
| Metodos | PSE, Nequi, Daviplata, NuBank, Pix, efectivo, tarjetas | Casos por banco, wallet, rail, efectivo y tarjeta. |
| Footer | Mercados DECO, Tasas Fiat, Metodos de Pago | Reemplazar links que hoy apuntan a legales cuando existe producto. |

Fuera del MVP: rutas individuales por todos los fiat globales, paginas de moneda por pais, status page dedicada, calculadora nueva de tasas y API privada real.

---

## Rutas Propuestas

| Ruta | Tipo | Proposito |
|---|---|---|
| `/assets` | Hub | Centro publico de activos, fiat, cripto, tokens y metodos. |
| `/assets/crypto` | Categoria | Criptoactivos publicos como BTC, ETH, SOL, BNB. |
| `/assets/fiat` | Categoria | Monedas fiat como USD, COP, MXN, EUR, BRL. |
| `/assets/tokens` | Categoria | Tokens del ecosistema, como DECOToken. |
| `/assets/payment-methods` | Categoria | Metodos de pago, bancos, wallets, efectivo y tarjetas. |
| `/assets/btc` | Ficha asset | Bitcoin. |
| `/assets/eth` | Ficha asset | Ethereum. |
| `/assets/sol` | Ficha asset | Solana. |
| `/assets/usdt` | Ficha asset | Tether USD. |
| `/assets/usdc` | Ficha asset | USD Coin. |
| `/assets/usd` | Ficha fiat | Dolar estadounidense. |
| `/assets/cop` | Ficha fiat | Peso colombiano. |
| `/assets/mxn` | Ficha fiat | Peso mexicano. |
| `/assets/deco` | Ficha token | DECOToken. |
| `/assets/payment-methods/nequi` | Ficha metodo | Nequi. |
| `/assets/payment-methods/pse` | Ficha metodo | PSE. |
| `/assets/payment-methods/daviplata` | Ficha metodo | Daviplata. |
| `/assets/payment-methods/nubank` | Ficha metodo | NuBank. |
| `/assets/payment-methods/pix` | Ficha metodo | Pix. |
| `/assets/payment-methods/cash` | Ficha metodo | Efectivo/corresponsales. |
| `/assets/payment-methods/cards` | Ficha metodo | Tarjetas. |

## Reglas De Ruteo

| Regla | Decision |
|---|---|
| Ruta dinamica de asset | `app/assets/[slug]/page.tsx` debe resolver cripto, fiat, stablecoin y token interno. |
| Ruta dinamica de metodo | `app/assets/payment-methods/[slug]/page.tsx` debe resolver metodos de pago. |
| Rutas categoria | `crypto`, `fiat`, `tokens`, `payment-methods` deben existir como paginas estaticas antes de `[slug]`. |
| Slugs | Siempre minuscula: `btc`, `eth`, `usd`, `nequi`, `pse`. |
| Canonical | Cada ficha debe declarar canonical propio, ejemplo `/assets/btc`. |
| No encontrado | Slug desconocido debe mostrar `notFound()` o estado 404 claro. |
| Alias futuro | Aliases como `/assets/bitcoin` pueden redirigir a `/assets/btc`, pero no son MVP. |

---

## Relacion Con Legales

| Producto en `/assets` | Respaldo legal |
|---|---|
| Criptoactivos | `/legals/criptoactivos`, `/legals/risks`, `/legals/monedas` |
| Fiat | `/legals/monedas`, `/legals/tasas`, `/legals/comisiones` |
| DECOToken | `/legals/deco-token`, `/legals/risks` |
| Medios electronicos | `/legals/electronicos`, `/legals/comisiones` |
| Tarjetas | `/legals/tarjetas`, `/legals/comisiones` |
| Efectivo/corresponsales | `/legals/efectivo`, `/legals/cajeros`, `/legals/giros-puntos` |

Regla: la pagina `/assets/*` vende y explica el producto; la pagina `/legals/*` documenta condiciones y riesgos.

---

## Footer Propuesto

### Mercados DECO

| Label | Destino nuevo |
|---|---|
| Resumen del mercado | `/markets/market-analysis` |
| Catalogo de activos | `/assets` |
| Bitcoin | `/assets/btc` |
| Ethereum | `/assets/eth` |
| Solana | `/assets/sol` |
| DECOToken | `/assets/deco` |

### Tasas Fiat

| Label | Destino nuevo |
|---|---|
| Monedas fiat | `/assets/fiat` |
| USD | `/assets/usd` |
| COP | `/assets/cop` |
| Tasas de divisas fiat | `/legals/tasas` o futuro `/assets/rates` |
| Calculadora de tasas | `/legals/calculadora` o futuro `/tools/rates-calculator` |

### Metodos De Pago

| Label | Destino nuevo |
|---|---|
| Medios electronicos | `/assets/payment-methods` |
| Nequi | `/assets/payment-methods/nequi` |
| PSE | `/assets/payment-methods/pse` |
| Daviplata | `/assets/payment-methods/daviplata` |
| NuBank | `/assets/payment-methods/nubank` |
| Efectivo | `/assets/payment-methods/cash` |
| Tarjetas | `/assets/payment-methods/cards` |

### Legal

| Label | Destino |
|---|---|
| Politica de monedas | `/legals/monedas` |
| Politica de medios electronicos | `/legals/electronicos` |
| Politica de tarjetas | `/legals/tarjetas` |
| Politica de efectivo | `/legals/efectivo` |
| Comisiones | `/legals/comisiones` |
| Riesgos | `/legals/risks` |

---

## Estrategia De Graficas

| Tipo | Grafica | Ejemplos | Regla |
|---|---|---|---|
| Cripto publico | TradingView | BTC, ETH, SOL, BNB | Usar si existe `tradingViewSymbol`. |
| Stablecoins | TradingView o Deco Chart | USDT, USDC | TradingView para mercado publico; Deco Chart para disponibilidad interna. |
| Fiat | Grafica Deco de tasa | USD/COP, USD/MXN, EUR/USD | Mostrar tasa referencial, variacion y fuente. |
| Token interno | Deco Chart | DECOToken | No depender de TradingView si no hay ticker publico. |
| Metodo de pago | Sin grafica de precio | Nequi, PSE, NuBank, Pix | Mostrar disponibilidad, tiempo, limites, comision y productos. |

Contrato de datos para graficas propias: el frontend acepta `chartSeries` como arreglo de puntos `{ label, value }` y `rateQuote` para fuente, compra, venta, spread, rango 24h y actualizacion. En MVP usa serie mock con el mismo formato; cuando el gateway entregue data real, el componente usa esos campos sin cambiar UI.

---

## Contenido De Ficha Asset

| Bloque | Publico sin login | Privado con login |
|---|---|---|
| Hero | Nombre, simbolo, categoria, icono, descripcion. | Balance personal, estado habilitado. |
| Mercado | Grafica, precio/tasa referencial, variacion. | Precio personalizado, limites, quote firmable. |
| Disponibilidad | Paises, productos soportados, riesgos. | Disponibilidad segun KYC, pais y perfil. |
| Usos en Deco | Comprar, vender, convertir, enviar, spot, P2P, rendimiento. | Acciones reales y flujos con saldo. |
| Legal | Links a condiciones y riesgos. | Aceptaciones firmadas y versiones aceptadas. |

---

## Contenido De Ficha Metodo De Pago

| Bloque | Publico sin login | Privado con login |
|---|---|---|
| Hero | Nombre, pais, categoria, descripcion. | Estado habilitado para el usuario. |
| Disponibilidad | Paises, monedas, productos soportados. | Disponibilidad por KYC, region, titularidad. |
| Operacion | Tiempo estimado, minimo general, comision referencial. | Limites personales, referencia unica, cuenta destino. |
| Flujos | Recargar, retirar, remesa, P2P, compra. | Crear orden, ver estado, comprobante. |
| Legal | Politicas aplicables. | Aceptaciones o restricciones personales. |

---

## Modelo De Datos Frontend

### Asset

| Campo | Ejemplo |
|---|---|
| `slug` | `btc` |
| `symbol` | `BTC` |
| `name` | `Bitcoin` |
| `type` | `crypto`, `fiat`, `stablecoin`, `deco-token` |
| `icon` | `/icons/btc.svg` |
| `description` | `Activo digital usado como referencia principal de mercado.` |
| `tradingViewSymbol` | `BINANCE:BTCUSDT` |
| `chartType` | `tradingview`, `deco-rate`, `deco-token` |
| `chartSeries` | `[{ label: "09:00", value: 4000 }]` |
| `rateQuote` | `{ source: "Deco Rate", last: 4000, bid: 3996, ask: 4004, spreadPct: 0.2 }` |
| `supportedProducts` | `buy`, `sell`, `convert`, `spot`, `p2p` |
| `legalLinks` | `/legals/criptoactivos`, `/legals/risks` |
| `status` | `available`, `limited`, `coming-soon`, `disabled` |
| `countries` | `CO`, `US`, `MX` |
| `networks` | `bitcoin`, `ethereum`, `solana` |
| `riskLevel` | `low`, `medium`, `high` |
| `seoTitle` | `Bitcoin BTC en Deco Exchange` |
| `seoDescription` | `Consulta precio, disponibilidad y usos de Bitcoin dentro de Deco Exchange.` |

### Payment Method

| Campo | Ejemplo |
|---|---|
| `slug` | `nequi` |
| `name` | `Nequi` |
| `type` | `wallet`, `bank`, `cash`, `card`, `rail` |
| `countries` | `CO` |
| `currencies` | `COP` |
| `supportedProducts` | `add-money`, `withdraw-credit`, `p2p` |
| `estimatedTime` | `5-15 min` |
| `minAmount` | `10000 COP` |
| `feeLabel` | `Segun proveedor` |
| `legalLinks` | `/legals/electronicos`, `/legals/comisiones` |
| `status` | `available`, `limited`, `coming-soon`, `disabled` |
| `providerType` | `bank`, `wallet`, `card-network`, `cash-network` |
| `requiresKyc` | `true` |
| `requiresOwnership` | `true` |
| `availabilityNotes` | `Disponible en Colombia para COP segun proveedor.` |

---

## Fuente De Datos

| Etapa | Fuente | Regla |
|---|---|---|
| Mock frontend | `components/assets/assets-data.ts` o similar | Datos publicos, versionados y sin informacion privada. |
| BFF existente | `/api/catalog/assets`, `/api/catalog/assets/grouped` | Ya existe como fuente futura para assets. Debe evaluarse antes de duplicar data. |
| Gateway futuro | Catalog service / asset registry | Fuente definitiva de activos, paises, iconos, disponibilidad y canales. |
| Mercados | `/api/markets/*` | Fuente para pares, TradingView symbol, ticker y estado de mercado. |
| Metodos | Funding/payment catalog futuro | Fuente para Nequi, PSE, Daviplata, NuBank, Pix, efectivo y tarjetas. |

Regla: el frontend puede tener mockups, pero el shape debe parecerse al contrato futuro para migrar sin reescribir UI.

---

## Arquitectura Componentizada

| Componente | Responsabilidad |
|---|---|
| `AssetsHubPage` | Layout principal de `/assets`. |
| `AssetCategoryPage` | Listados por `crypto`, `fiat`, `tokens`. |
| `AssetDetailPage` | Ficha dinamica `/assets/[slug]`. |
| `PaymentMethodsPage` | Hub de metodos `/assets/payment-methods`. |
| `PaymentMethodDetailPage` | Ficha dinamica `/assets/payment-methods/[slug]`. |
| `AssetHero` | Nombre, simbolo, tipo, estado y CTA. |
| `AssetChartPanel` | TradingView, Deco Rate Chart o Deco Token Chart. |
| `AssetAvailabilityPanel` | Paises, productos, estado y notas. |
| `AssetUseCasesGrid` | Comprar, vender, convertir, spot, P2P, rendimiento, bolsillito. |
| `AssetLegalLinks` | Links a legales relacionados. |
| `PaymentMethodHero` | Metodo, paises, moneda, proveedor y estado. |
| `PaymentMethodRulesPanel` | Tiempos, minimos, fees, KYC y titularidad. |
| `CatalogSearch` | Busca activos, fiat, tokens y metodos. |
| `CatalogFilterBar` | Filtra por tipo, pais, moneda, producto y estado. |
| `CatalogCard` | Card compacta reutilizable. |

Regla de oro: no crear paginas sueltas copiadas; crear shells y componentes compartidos.

---

## SEO Y Metadata

| Elemento | Regla |
|---|---|
| `generateMetadata` | Cada ficha debe tener title, description, canonical y OG basados en data. |
| Sitemap | Las rutas publicas `/assets/*` deben entrar al sitemap cuando esten estables. |
| Robots | Fichas publicas indexables; estados privados/no disponibles no deben exponer datos. |
| Structured data | Evaluar `FinancialProduct`, `CurrencyConversionService` o schema generico segun pagina. |
| Copy legal | No prometer ganancias, disponibilidad garantizada ni aprobacion. |
| Links legales | Cada ficha enlaza condiciones aplicables. |

---

## Performance Y Resiliencia

| Area | Regla |
|---|---|
| TradingView | Lazy load, timeout y fallback Deco Chart como en mercados. |
| Graficas fiat | Recharts o componente ligero propio; no bloquear el hero. |
| Iconos | Usar iconos locales o registry; fallback visual si falta asset. |
| Buscador | Dataset local pequeño en MVP; backend search futuro. |
| Carga | Skeletons compactos y estados vacios. |
| Cache | Public catalog cacheable; datos privados no cacheables en cliente compartido. |
| Errores | 404 para slug inexistente, `coming soon` para item conocido no activo, `limited` para disponibilidad parcial. |

---

## Seguridad Y Privacidad

| Riesgo | Regla |
|---|---|
| Datos privados en catalogo | Prohibido mostrar saldos, limites personales, wallets, referencias o historial. |
| Disponibilidad personalizada | Solo con login y endpoint privado. |
| KYC/region | Mostrar regla general sin login; decision real con usuario autenticado. |
| Links externos | Abrir con `rel="noopener noreferrer"`. |
| Scripts externos | TradingView debe tener fallback y no romper render. |
| Acciones operativas | Comprar, retirar, recargar, enviar, reclamar o firmar requieren login. |

---

## QA Profesional

| QA | Criterio |
|---|---|
| Typecheck | `pnpm exec tsc --noEmit --pretty false`. |
| Build | `pnpm run build`. |
| Link audit | Footer, legales y assets no deben apuntar a rutas inexistentes. |
| Visual desktop | 1440px y 1280px sin overflow/solapes. |
| Visual mobile | 360px y 390px; cards compactas y texto sin romper. |
| Dark/light | Colores legibles y sin bordes naranjas pesados. |
| TradingView fallback | Desconectar/timeout no deja card rota. |
| No login | Solo datos publicos. |
| Login futuro | Bloques privados con gating consistente. |
| Accesibilidad | Labels, foco visible, contraste, botones reales. |

---

## Roadmap General

| ID | Epica | Estado | Prioridad | Area |
|---|---|---|---|---|
| ASSET-001 | Definir arquitectura `/assets` | HECHO | Alta | Rutas |
| ASSET-002 | Definir modelo de datos | HECHO | Alta | Data |
| ASSET-003 | Crear hub `/assets` | HECHO | Alta | UI |
| ASSET-004 | Crear fichas cripto | HECHO | Alta | BTC/ETH/SOL/USDT/USDC |
| ASSET-005 | Crear fichas fiat | HECHO | Alta | USD/COP/MXN/EUR |
| ASSET-006 | Crear ficha DECOToken | HECHO | Alta | Token interno |
| ASSET-007 | Crear catalogo de metodos | HECHO | Alta | Payment methods |
| ASSET-008 | Crear fichas de metodos | HECHO | Alta | Nequi/PSE/NuBank/etc |
| ASSET-009 | Integrar graficas | HECHO | Alta | TradingView/Deco Chart |
| ASSET-010 | Reorganizar footer | HECHO | Media | Footer |
| ASSET-011 | Conectar con legales | HECHO | Alta | Legal links |
| ASSET-012 | Gating auth | HECHO | Alta | Public/private |
| ASSET-013 | QA visual | POR HACER | Alta | Desktop/mobile |
| ASSET-014 | SEO y metadata | HECHO | Alta | Metadata/sitemap |
| ASSET-015 | Migracion de links | EN REVISION | Alta | Footer/legales/nav |
| ASSET-016 | Contratos backend | EN REVISION | Alta | Catalog/gateway |

---

# ASSET-001 - Arquitectura `/assets`

## Objetivo

Separar la experiencia comercial y educativa de activos/metodos de las paginas legales.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-001-01 | Elegir ruta base | HECHO | Ruta base definida como `/assets`. |
| ASSET-001-02 | Separar producto/legal | HECHO | `/assets` producto, `/legals` condiciones. |
| ASSET-001-03 | Definir categorias | HECHO | Crypto, fiat, tokens y payment methods. |
| ASSET-001-04 | Definir rutas individuales | HECHO | Existe mapa de `/assets/[slug]` y `/assets/payment-methods/[slug]`. |

---

# ASSET-002 - Modelo De Datos

## Objetivo

Crear estructuras reutilizables para renderizar fichas sin hardcodear cada pagina.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-002-01 | Definir `Asset` | HECHO | Campos para cripto, fiat, stablecoin y token interno. |
| ASSET-002-02 | Definir `PaymentMethod` | HECHO | Campos para wallets, bancos, efectivo, tarjetas y rails. |
| ASSET-002-03 | Definir relacion asset-metodo | HECHO | Producto sabe que moneda y metodo soporta. |
| ASSET-002-04 | Definir fallback backend | HECHO | Mock local hoy, gateway/catalog API futuro. |

---

# ASSET-003 - Hub `/assets`

## Objetivo

Crear primera pantalla del catalogo con buscador, categorias, activos destacados y metodos populares.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-003-01 | Hero dashboard landing | HECHO | Sigue estilo home/P2P/Market Maker/Rendimiento. |
| ASSET-003-02 | Buscador global | HECHO | Busca BTC, USD, Nequi, PSE, DECOToken. |
| ASSET-003-03 | Categorias | HECHO | Crypto, fiat, tokens y metodos. |
| ASSET-003-04 | Cards compactas | HECHO | Sin bordes naranjas pesados; layout compacto. |

---

# ASSET-004 - Fichas Cripto

## Objetivo

Crear fichas publicas para criptoactivos con grafica TradingView cuando aplique.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-004-01 | BTC | HECHO | `/assets/btc` con TradingView `BINANCE:BTCUSDT`. |
| ASSET-004-02 | ETH | HECHO | `/assets/eth` con TradingView `BINANCE:ETHUSDT`. |
| ASSET-004-03 | SOL | HECHO | `/assets/sol` con TradingView `BINANCE:SOLUSDT`. |
| ASSET-004-04 | USDT/USDC | HECHO | Stablecoins con mercado publico y reglas de disponibilidad. |

---

# ASSET-005 - Fichas Fiat

## Objetivo

Crear fichas fiat con grafica de tasa Deco y disponibilidad por pais.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-005-01 | USD | HECHO | `/assets/usd` con tasa y usos dentro de Deco. |
| ASSET-005-02 | COP | HECHO | `/assets/cop` con minimo COP y metodos locales. |
| ASSET-005-03 | MXN | HECHO | `/assets/mxn` con metodos y referencias mexicanas. |
| ASSET-005-04 | EUR/BRL/DOP/etc | POR HACER | Fichas por prioridad de mercado. |

---

# ASSET-006 - DECOToken

## Objetivo

Crear ficha de producto para DECOToken separada de su documento legal.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-006-01 | Ficha `/assets/deco` | HECHO | Explica utilidad, disponibilidad, riesgos y links legales. |
| ASSET-006-02 | Grafica Deco | HECHO | Usa chart interno, no TradingView obligatorio. |
| ASSET-006-03 | Legal link | HECHO | Enlaza `/legals/deco-token` y `/legals/risks`. |

---

# ASSET-007 - Catalogo De Metodos

## Objetivo

Crear indice de metodos de pago por pais, moneda, producto y tipo.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-007-01 | Hub metodos | HECHO | `/assets/payment-methods` lista wallets, bancos, efectivo y tarjetas. |
| ASSET-007-02 | Filtros | HECHO | Pais, moneda, producto, tipo. |
| ASSET-007-03 | Disponibilidad | HECHO | Publica general; privada personalizada con login futuro. |

---

# ASSET-008 - Fichas De Metodos

## Objetivo

Crear fichas para medios como Nequi, PSE, Daviplata, NuBank, Pix, efectivo y tarjetas.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-008-01 | Nequi | HECHO | `/assets/payment-methods/nequi` con COP, Colombia y productos. |
| ASSET-008-02 | PSE | HECHO | `/assets/payment-methods/pse` con banco colombiano. |
| ASSET-008-03 | Daviplata | HECHO | `/assets/payment-methods/daviplata`. |
| ASSET-008-04 | NuBank | HECHO | `/assets/payment-methods/nubank`, paises segun disponibilidad. |
| ASSET-008-05 | Pix | HECHO | `/assets/payment-methods/pix` para Brasil. |
| ASSET-008-06 | Cash/cards | HECHO | Efectivo y tarjetas como categorias/metodos. |

---

# ASSET-009 - Graficas

## Objetivo

Definir grafica correcta segun tipo de item.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-009-01 | TradingView cripto | HECHO | Carga solo cuando `tradingViewSymbol` existe. |
| ASSET-009-02 | Deco Rate Chart fiat | HECHO | Linea de tasa fiat referencial. |
| ASSET-009-03 | Deco Token Chart | HECHO | Grafica interna para DECOToken/tokens especiales. |
| ASSET-009-04 | No-chart metodos | HECHO | Metodos muestran disponibilidad, no grafica de precio. |

---

# ASSET-010 - Footer

## Objetivo

Reemplazar destinos legales por destinos de producto donde aplique.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-010-01 | Mercados DECO | HECHO | BTC/ETH/SOL/DECOToken apuntan a `/assets/*`. |
| ASSET-010-02 | Tasas fiat | HECHO | Monedas fiat apunta a `/assets/fiat`. |
| ASSET-010-03 | Metodos de pago | HECHO | Crear grupo o reorganizar links actuales. |
| ASSET-010-04 | Legal footer | HECHO | Mantener politicas legales separadas. |

---

# ASSET-011 - Auth Y Backend Futuro

## Objetivo

Preparar el catalogo para gateway/backend sin filtrar datos privados.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-011-01 | Public catalog API | POR HACER | Endpoints publicos no devuelven datos personales. |
| ASSET-011-02 | Private availability API | POR HACER | Disponibilidad real requiere login. |
| ASSET-011-03 | KYC/region gating | POR HACER | Limites, metodos y acciones dependen de usuario. |
| ASSET-011-04 | Legal acceptance | POR HACER | Riesgos/terminos firmados quedan privados. |

---

# ASSET-012 - Gating Auth

## Objetivo

Definir que bloques quedan publicos y que bloques deben abrir login o esperar backend privado.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-012-01 | Bloques publicos | HECHO | Hero, chart, disponibilidad general y legales son publicos. |
| ASSET-012-02 | Bloques privados | HECHO | Saldo, limites, wallets, historial y accion real requieren login. |
| ASSET-012-03 | CTA inteligente | EN REVISION | Sin login abre modal; con login lleva al flujo correspondiente. |
| ASSET-012-04 | KYC/region | POR HACER | Mostrar estado despues de login si el usuario no cumple. |

---

# ASSET-013 - QA Visual Y Funcional

## Objetivo

Validar que el catalogo se vea como dashboard landing, funcione en responsive y no rompa navegacion.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-013-01 | QA desktop | POR HACER | `/assets`, `/assets/btc`, `/assets/usd`, `/assets/payment-methods/nequi`. |
| ASSET-013-02 | QA mobile | POR HACER | 360/390px sin texto cortado ni overflow. |
| ASSET-013-03 | QA light/dark | POR HACER | Contraste correcto y estilos consistentes. |
| ASSET-013-04 | QA links | POR HACER | Footer, cards y legales apuntan a rutas reales. |
| ASSET-013-05 | QA build | HECHO | Typecheck y build pasan con pnpm. |

---

# ASSET-014 - SEO Y Metadata

## Objetivo

Hacer que cada ficha publica sea indexable y compartible sin duplicar contenido legal.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-014-01 | Metadata dinamica | HECHO | `generateMetadata` usa nombre, simbolo, tipo y descripcion. |
| ASSET-014-02 | Canonicals | HECHO | Cada ficha declara canonical estable. |
| ASSET-014-03 | Sitemap | HECHO | Rutas estables de `/assets` incluidas desde `app/sitemap.ts`. |
| ASSET-014-04 | OG/social | HECHO | Preview compartible con nombre y categoria. |

---

# ASSET-015 - Migracion De Links

## Objetivo

Mover navegacion de producto desde legales hacia assets sin romper paginas legales.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-015-01 | Footer mercados | HECHO | BTC/ETH/SOL/DECO apuntan a `/assets/*`. |
| ASSET-015-02 | Footer fiat | HECHO | Monedas fiat apunta a `/assets/fiat`. |
| ASSET-015-03 | Footer metodos | HECHO | Metodos tienen grupo propio o destino claro. |
| ASSET-015-04 | Legales cross-link | HECHO | `/legals/monedas`, `/legals/electronicos`, `/legals/tarjetas` y `/legals/efectivo` enlazan catalogo como experiencia de producto. |
| ASSET-015-05 | Knowledge Base | POR HACER | Articulos apuntan a assets cuando hablen de ficha de activo. |

---

# ASSET-016 - Contratos Backend

## Objetivo

Preparar integracion con gateway/catalog sin reescribir la UI.

## Endpoints Esperados

| Endpoint | Publico/Privado | Proposito |
|---|---|---|
| `GET /api/catalog/assets` | Publico | Listado de activos. |
| `GET /api/catalog/assets/grouped` | Publico | Grupos fiat/crypto/internal existentes. |
| `GET /api/catalog/assets/:code` | Publico | Ficha publica del activo. |
| `GET /api/catalog/payment-methods` | Publico | Listado general de metodos. |
| `GET /api/catalog/payment-methods/:slug` | Publico | Ficha publica del metodo. |
| `GET /api/catalog/me/availability` | Privado | Disponibilidad real por usuario/KYC/pais. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| ASSET-016-01 | Auditar BFF actual | POR HACER | Revisar `/api/catalog/assets` antes de crear mocks. |
| ASSET-016-02 | Definir DTO publico | POR HACER | DTO no contiene datos personales. |
| ASSET-016-03 | Definir DTO privado | POR HACER | Disponibilidad personalizada requiere sesion. |
| ASSET-016-04 | Fallback local | HECHO | UI funciona si gateway no responde. |

---

## Orden Recomendado

1. ASSET-002 Modelo de datos.
2. ASSET-003 Hub `/assets`.
3. ASSET-016 Contratos backend y fallback.
4. ASSET-004 Fichas cripto base.
5. ASSET-005 Fichas fiat base.
6. ASSET-006 DECOToken.
7. ASSET-007 Catalogo de metodos.
8. ASSET-008 Fichas de metodos.
9. ASSET-009 Graficas por tipo.
10. ASSET-012 Gating auth.
11. ASSET-014 SEO y metadata.
12. ASSET-015 Migracion de links.
13. ASSET-010 Footer.
14. ASSET-013 QA visual.
