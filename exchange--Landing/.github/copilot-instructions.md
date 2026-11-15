# blackCEX — Copilot Instructions (frontend monolítico)

> Este repo es el **frontend monolítico de blackCEX** (Next.js 15 + React 18 + Tailwind 3 + shadcn/ui).
> Se conecta al ecosistema **Deco31416** vía BFF → `api-gateway-user` (:8081) → microservicios.
> El diseño visual está **APROBADO**. Solo se cablea funcionalidad real, no se inventan mocks.

---

## Contexto de la landing pública

Este repo sirve una **landing pública** (`http://localhost:3000/` en dev). Reglas específicas:

- **No conectar datos privados de usuario en landing pública.** Ningún componente visible sin login debe mostrar saldos, transacciones, o datos personales reales.
- **El mockup móvil usa un balance demo** (`DEMO_TOTAL_BALANCE`). Los precios de activos sí son reales vía pricing-aggregator. El balance fijo es aceptable y está señalizado en UI.
- **Toda métrica pública debe ser real, config aprobada, o demo señalizado.** No inventar números, no hardcodear tasas de cambio sin documentarlas como config.
- **No exponer `x-internal-auth` ni ningún token interno al browser.** Todas las llamadas al pricing-aggregator pasan por BFF server-side (`app/api/prices/`).

---

## Clasificación de problemas — sistema obligatorio

Usar siempre esta clasificación al registrar o reportar un problema:

| Clasificación | Descripción | Acción |
|--------------|-------------|--------|
| **BUG** | Error funcional o de datos real | Corregir |
| **DEUDA** | Código que funciona pero tiene un problema de mantenibilidad/calidad | Registrar, corregir en sprint |
| **CONFIG APROBADA** | Valor o fórmula decidida por producto, no es bug | No tocar sin aprobación |
| **MOCK** | Dato ficticio usado en lugar de API real | Documentar, reemplazar si hay API |
| **LIMITACIÓN** | Funcionalidad ausente por falta de backend o decisión pendiente | Documentar, esperar |
| **MEJORA FUTURA** | Mejora de UX/performance no urgente | Registrar en deuda |

**Nunca llamar "operativo" a un mock. Nunca ocultar errores con fallbacks falsos.**

---

## Flujo de trabajo aprobado

```
verdad → evidencia → operación → valor → escala
```

1. Cerrar primero bugs visibles/runtime (los que el usuario ve)
2. Luego deudas técnicas bloqueantes
3. Luego deudas técnicas no bloqueantes
4. Nunca refactor grande sin necesidad concreta
5. Patch mínimo > solución elegante que rompe más cosas
6. Siempre verificar con `pnpm tsc --noEmit` tras modificar TypeScript

---

## Stack y tooling

- **Framework:** Next.js 15 (App Router) + React 18 + TypeScript estricto
- **Gestor:** `pnpm` (NUNCA mezclar npm/yarn)
- **UI:** Tailwind 3 + shadcn/ui (`components/ui/`) + `lucide-react`
- **Estado/forms:** `react-hook-form` + `zod`
- **HTTP:** `axios` con cliente centralizado en `lib/axiosClient.ts`
- **Toasts/notificaciones:** `hooks/use-toast.ts` + `components/ui/toaster.tsx`
  - Variantes válidas: `"default"` | `"destructive"` (no `"success"` ni `"info"` — no existen en `toastVariants`)
- **i18n:** carpeta `locales/` con un archivo por idioma (ver sección abajo)

---

## Regla absoluta: 1 archivo = 1 componente

**Cada `.tsx` exporta UN solo componente React.** Prohibido apilar 2-3 componentes en el mismo archivo, ni siquiera "helpers visuales pequeños". Si necesitas un sub-bloque (un row, una card interna, un header de modal), va en su propio archivo dentro de la misma carpeta de feature.

```
✅ components/p2p/buy-modal/p2p-buy-modal.tsx           (componente principal)
✅ components/p2p/buy-modal/p2p-buy-modal-header.tsx    (subcomponente)
✅ components/p2p/buy-modal/p2p-buy-modal-summary.tsx   (subcomponente)
❌ components/p2p/p2p-buy-modal.tsx con 3 componentes adentro
```

**Excepción única:** tipos/interfaces auxiliares del mismo componente pueden vivir en el mismo `.tsx` o en `[componente].types.ts` al lado.

---

## Estructura de carpetas obligatoria

```
app/                       Rutas (App Router). NUNCA lógica de negocio aquí.
  api/                     BFF routes (Next API). Único punto que habla con el gateway/aggregator.
  [feature]/page.tsx       Server component delgado, importa el view correspondiente.

components/
  ui/                      shadcn/ui base. NO modificar manualmente.
  common/                  Compartidos cross-feature (Spinner, EmptyState, ErrorBoundary, etc.)
  common/mockup-wallet/    Mockup móvil de la sección Mobile Access. Vistas internas autónomas.
  Main/                    Layout principal del sitio (navbar, footer, hero, sections).
  Main/views/              Secciones de la landing (1-hero … 12-partners).
  p2p/                     Feature P2P. Subcarpetas por subfeature.
    market/
    orders/
    chat/
    modals/
    shared/                Componentes P2P reutilizables internos.

views/                     Vistas que componen una página (orquestan componentes).
                           Una página = un view. NO inline JSX gigante en page.tsx.

hooks/                     Hooks reutilizables (use-*.ts). Uno por archivo.
                           Hooks específicos de feature van en components/[feature]/hooks/.

services/                  Clientes HTTP por dominio (CryptoService, P2PService, etc.).
  CryptoService.ts         getCryptoCurrencies, getStablecoins, getCryptoBySymbols,
                           getMarketStats, getFiatCurrencies — usan /api/prices BFF.

lib/                       Utilidades puras (utils.ts, formatters, validators, axiosClient).
                           Sin dependencias de React.

types/                     Modelos/contratos compartidos (DTOs, enums, interfaces).
                           Un dominio = un archivo (orders.ts, p2p.ts, currency.ts).

locales/                   Traducciones. Un archivo por idioma (es.json, en.json).
                           Estructura por feature: { p2p: { market: { title: ... } } }

styles/                    CSS global y tokens.
  globals.css              Incluye .mock-wallet-scroll (scrollbar interno mock),
                           .scrollbar-hide, y corrección de scrollbar global.
                           NO usar clases scrollbar-thin/scrollbar-dark (no hay plugin Tailwind).

public/                    Assets estáticos.
```

---

## Reglas de componentización y reutilización

1. **Detecta repetición ANTES de duplicar.** Si un patrón aparece 2+ veces, extráelo a `components/common/` o `components/[feature]/shared/`.
2. **Composición sobre props gigantes.** Prefiere `<Card><CardHeader/><CardBody/></Card>` con `children`.
3. **Smart vs Dumb:** los componentes en `components/` son presentacionales. La lógica de fetch/estado vive en hooks (`hooks/use-*.ts`) o en views.
4. **Props tipadas siempre.** Nada de `any`. Si el dato viene de API, tiene que existir su tipo en `types/`.
5. **Estados explícitos:** loading, empty, error, success.
6. **Nombres consistentes:** kebab-case para archivos (`p2p-buy-modal.tsx`), PascalCase para el export (`P2PBuyModal`).

---

## Conexión con backend (BFF estricto)

```
Browser → fetch('/api/X/...') → app/api/X/route.ts (BFF) → api-gateway-user (:8081) → micro
Browser → fetch('/api/prices/...') → app/api/prices/route.ts (BFF) → pricing-aggregator (:3013)
```

- **Prohibido** llamar directo al gateway o a pricing-aggregator desde el browser. Todo pasa por BFF.
- **Prohibido** `localStorage.getItem('access_token')`. Auth con cookies HTTP-only.
- Los `services/` del frontend usan rutas relativas (`/api/prices/...`), NUNCA `http://localhost:3013/...`.
- Los BFF routes inyectan `x-internal-auth` (desde env server-side) — NUNCA exponer al cliente.

### Variables de entorno BFF (server-side, sin NEXT_PUBLIC_)

```
PRICING_AGGREGATOR_URL=http://localhost:3013
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8081
INTERNAL_AUTH_TOKEN=<token_interno>
```

---

## Reglas de scrollbar

- **Clases operativas:** `.mock-wallet-scroll` (en `globals.css`) para scrollbars internos del mockup móvil.
- **Clases operativas:** `.scrollbar-hide` para ocultar scrollbar completamente.
- **Clases NO operativas:** `scrollbar-thin`, `scrollbar-dark` — no hay plugin Tailwind de scrollbar instalado. Usar siempre `.mock-wallet-scroll` en su lugar.
- El scrollbar global de página nunca debe desaparecer al abrir modales/dropdowns. Revisar `overflow-hidden` en `<body>` o proveedores de modal.

---

## Hooks: una responsabilidad cada uno

```
hooks/use-toast.ts            ✅ feedback al usuario
hooks/use-mobile.tsx          ✅ detectar viewport
hooks/use-p2p-orders.ts       ✅ fetch + estado de órdenes P2P
hooks/use-debounce.ts         ✅ utilidad reutilizable
```

---

## Traducciones (i18n)

- Carpeta `locales/` con `es.json` y `en.json` (mínimo).
- Estructura jerárquica por feature: `{ p2p: { market: { buyButton: "Comprar" } } }`.
- NUNCA strings hardcodeados en componentes nuevos.

---

## Notificaciones

Una sola fuente: `useToast()` desde `hooks/use-toast.ts`. Variantes válidas: `"default"` | `"destructive"`.

```tsx
const { toast } = useToast();
toast({ variant: "destructive", title: "Error", description: "..." });
toast({ title: "Operación completada" }); // usa "default"
```

**Prohibido:** `"success"`, `"info"` (no existen en `toastVariants`), `alert()`, `console.log` para feedback, cast `as Parameters<typeof toast>[0]`.

---

## Modelos / Tipos

- Todos los modelos en `types/[dominio].ts`. Un dominio = un archivo.
- Si un tipo lo usa una sola pantalla, va en `[componente].types.ts` al lado del componente.
- DTOs de request/response con sufijo claro: `P2POrderRequest`, `P2POrderResponse`.
- Enums fuertes: `OrderStatus.PENDING` no `"pending"`.

---

## Diseño visual: APROBADO y CONGELADO

- **No tocar** botones, textos, iconos, colores, layout, espaciados, tipografías de páginas existentes.
- Si un botón existe sin `onClick` → solo se le agrega el handler.
- Si una lista muestra mocks → se reemplaza la fuente por API real, render idéntico.
- No agregar tooltips, badges, secciones, ni elementos visuales nuevos sin pedido explícito.
- No reorganizar el layout ni mover componentes de posición.

---

## Deudas abiertas conocidas (2026-05-01)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| `MOBILEAPP-MOCK-001` | Balance demo en mockup (señalizado) | baja / aceptada |
| `MOBILEAPP-DEBT-001` | Gráficos sin histórico real (sin() determinístico) | baja |
| `MOBILEAPP-DEBT-002` | Math.random() en coin-detail + analytics | media |
| `MOBILEAPP-DEBT-003` | Vistas hijas del mockup pendientes auditoría | baja |
| `PORTFOLIO-TEMP-001` | Recompensas hardcoded — config de producto | pendiente producto |
| `PORTFOLIO-DEAD-001` | Arrays dead code en portfolio-builder | menor |
| `PORTFOLIO-NOVEDADES-001` | Tab Novedades: curación editorial manual | pendiente editorial |
| `TOKENPRICE-DEBT-001` | formatPercent/formatVolume duplicados | baja |
| `MARKET-DEBT-001` | Sin endpoint dedicado /api/market-overview | baja |
| `MARKET-DEBT-002` | market-overview.tsx monolítico | baja |
| `RATES-DEBT-002` | Sin polling en Fiat Currency Rates | baja |

### Configs aprobadas (no tocar)

| ID | Descripción |
|----|-------------|
| `RATES-CONFIG-001` | Buy/Sell ±5% — fórmula de spread aprobada |
| `RATES-CONFIG-002` | P2P ±2% — variación aprobada |
| `RATES-CONFIG-003` | CENTRAL_BANK_RATES_STATIC_CONFIG — tasas oficiales de referencia de mercado BlackCEX. No es API bancaria externa. No cambiar sin aprobación de producto. |

### Bugs conocidos abiertos

_Sin bugs abiertos de alta prioridad._

### Bugs cerrados

| ID | Descripción | Estado | Fecha |
|----|-------------|--------|-------|
| `BUG-NEXT-001` | Exchange widgets aceptaban montos negativos. Corregido en `use-fiat-exchange.ts`, `fiat-exchange-tab.tsx`, `buy-sell-crypto-tab.tsx`, `p2p-trading-tab.tsx`. `amount <= 0` → no calcula, no llama API, botón disabled. | ✅ CERRADO | 2026-05-01 |

---

## Prohibiciones absolutas

- ❌ Mocks, datos fake, fallbacks falsos, valores inventados (FX rates, balances, listas)
- ❌ 2+ componentes en el mismo `.tsx`
- ❌ Lógica de negocio dentro de `app/[feature]/page.tsx`
- ❌ Llamadas directas browser → gateway o browser → pricing-aggregator
- ❌ `any` en props o respuestas
- ❌ `localStorage` para tokens o datos de sesión
- ❌ Strings hardcodeados en lugar de traducciones (componentes nuevos)
- ❌ Carpetas nuevas si una existente cubre el caso
- ❌ Modificar diseño visual aprobado
- ❌ Usar `scrollbar-thin` / `scrollbar-dark` (no hay plugin Tailwind de scrollbar)
- ❌ Llamar "operativo" a un mock sin señalización clara
- ❌ Conectar datos privados de usuario en landing pública
- ❌ Hardcodear tasas de cambio/FX rates sin documentarlas como config aprobada
- ❌ Exponer `INTERNAL_AUTH_TOKEN` o `x-internal-auth` al browser

---

## Auditoría tras cada cambio

Después de cualquier cambio reportar:
1. Qué se cambió y por qué
2. Clasificación: bug / deuda / config / mock / limitación / mejora
3. Componentes nuevos creados (con ruta exacta)
4. Componentes reutilizados (en lugar de duplicar)
5. Hooks/services/types creados o tocados
6. Conexión real con qué endpoint del BFF
7. Qué quedó pendiente
8. Riesgos y validaciones requeridas
9. Verificación: `pnpm tsc --noEmit` limpio


---

## Stack y tooling

- **Framework:** Next.js 15 (App Router) + React 18 + TypeScript estricto
- **Gestor:** `pnpm` (NUNCA mezclar npm/yarn)
- **UI:** Tailwind 3 + shadcn/ui (`components/ui/`) + `lucide-react`
- **Estado/forms:** `react-hook-form` + `zod`
- **HTTP:** `axios` con cliente centralizado en `lib/axiosClient.ts`
- **Toasts/notificaciones:** `hooks/use-toast.ts` + `components/ui/toaster.tsx`
- **i18n:** carpeta `locales/` con un archivo por idioma (ver sección abajo)

---

## Regla absoluta: 1 archivo = 1 componente

**Cada `.tsx` exporta UN solo componente React.** Prohibido apilar 2-3 componentes en el mismo archivo, ni siquiera "helpers visuales pequeños". Si necesitas un sub-bloque (un row, una card interna, un header de modal), va en su propio archivo dentro de la misma carpeta de feature.

```
✅ components/p2p/buy-modal/p2p-buy-modal.tsx           (componente principal)
✅ components/p2p/buy-modal/p2p-buy-modal-header.tsx    (subcomponente)
✅ components/p2p/buy-modal/p2p-buy-modal-summary.tsx   (subcomponente)
❌ components/p2p/p2p-buy-modal.tsx con 3 componentes adentro
```

**Excepción única:** tipos/interfaces auxiliares del mismo componente pueden vivir en el mismo `.tsx` o en `[componente].types.ts` al lado.

---

## Estructura de carpetas obligatoria

```
app/                       Rutas (App Router). NUNCA lógica de negocio aquí.
  api/                     BFF routes (Next API). Único punto que habla con el gateway.
  [feature]/page.tsx       Server component delgado, importa el view correspondiente.

components/
  ui/                      shadcn/ui base. NO modificar manualmente.
  common/                  Compartidos cross-feature (Spinner, EmptyState, ErrorBoundary, etc.)
  Main/                    Layout principal del sitio (navbar, footer, hero, sections).
  p2p/                     Feature P2P. Subcarpetas por subfeature.
    market/
    orders/
    chat/
    modals/
    shared/                Componentes P2P reutilizables internos.

views/                     Vistas que componen una página (orquestan componentes).
                           Una página = un view. NO inline JSX gigante en page.tsx.

hooks/                     Hooks reutilizables (use-*.ts). Uno por archivo.
                           Hooks específicos de feature van en components/[feature]/hooks/.

services/                  Clientes HTTP por dominio (CryptoService, P2PService, etc.).
                           Cada service usa axiosClient y expone métodos tipados.

lib/                       Utilidades puras (utils.ts, formatters, validators, axiosClient).
                           Sin dependencias de React.

types/                     Modelos/contratos compartidos (DTOs, enums, interfaces).
                           Un dominio = un archivo (orders.ts, p2p.ts, currency.ts).

locales/                   Traducciones. Un archivo por idioma (es.json, en.json).
                           Estructura por feature: { p2p: { market: { title: ... } } }

styles/                    CSS global y tokens. NO componer estilos aquí, usar Tailwind.

public/                    Assets estáticos.
```

**Regla:** No crear carpetas nuevas si una existente cubre el caso. Si una feature crece, abrir subcarpeta dentro de su raíz (`components/p2p/chat/`, no `components/p2p-chat/`).

---

## Reglas de componentización y reutilización

1. **Detecta repetición ANTES de duplicar.** Si un patrón aparece 2+ veces (botón con icono + label, card con header + footer, fila de tabla con avatar + datos), extráelo a `components/common/` o `components/[feature]/shared/`.
2. **Composición sobre props gigantes.** Prefiere `<Card><CardHeader/><CardBody/></Card>` con `children` antes que un componente con 15 props booleanos.
3. **Smart vs Dumb:** los componentes en `components/` son presentacionales (reciben props). La lógica de fetch/estado vive en hooks (`hooks/use-*.ts`) o en views.
4. **Props tipadas siempre.** Nada de `any`. Si el dato viene de API, tiene que existir su tipo en `types/`.
5. **Estados explícitos:** loading, empty, error, success. Usar componentes de `components/common/` para esto (Spinner, EmptyState, ErrorState).
6. **Nombres consistentes:** kebab-case para archivos (`p2p-buy-modal.tsx`), PascalCase para el export (`P2PBuyModal`).

---

## Conexión con backend (BFF estricto)

```
Browser → fetch('/api/X/...') → app/api/X/route.ts (BFF) → api-gateway-user (:8081) → micro
```

- **Prohibido** llamar directo al gateway desde el browser. Toda llamada pasa por una API route en `app/api/`.
- **Prohibido** `localStorage.getItem('access_token')`. Auth con cookies HTTP-only.
- Los `services/` del frontend usan rutas relativas (`/api/p2p/...`), NUNCA `http://localhost:8081/...`.
- Los BFF routes inyectan `Authorization: Bearer` (desde cookie) y `X-Internal-Auth` (desde env server-side).

---

## Hooks: una responsabilidad cada uno

```
hooks/use-toast.ts            ✅ feedback al usuario
hooks/use-mobile.tsx          ✅ detectar viewport
hooks/use-p2p-orders.ts       ✅ fetch + estado de órdenes P2P
hooks/use-debounce.ts         ✅ utilidad reutilizable
```

- Cada hook expone un retorno claro y tipado: `{ data, isLoading, error, refetch }` o `{ value, setValue }`.
- Hooks de fetch consumen `services/` o llaman `fetch('/api/...')` directo. NUNCA acceden al gateway.
- Hooks específicos de una feature pueden vivir en `components/[feature]/hooks/use-*.ts`.

---

## Traducciones (i18n)

- Carpeta `locales/` con `es.json` y `en.json` (mínimo).
- Estructura jerárquica por feature: `{ p2p: { market: { buyButton: "Comprar" } } }`.
- Acceso vía hook `useTranslation()` (a crear si no existe). NUNCA strings hardcodeados en componentes nuevos.
- Si el componente es 100% visual (icono, número formateado), no necesita traducción.

---

## Notificaciones

Una sola fuente: `useToast()` desde `hooks/use-toast.ts`. Variantes: `default | destructive | success`.

```tsx
const { toast } = useToast();
toast({ variant: "success", title: "Orden creada", description: "..." });
```

Prohibido `alert()`, `console.log` para feedback al usuario, modales custom para notificar.

---

## Modelos / Tipos

- Todos los modelos en `types/[dominio].ts`. Un dominio = un archivo.
- Si un tipo lo usa una sola pantalla, va en `[componente].types.ts` al lado del componente.
- DTOs de request/response van con sufijo claro: `P2POrderRequest`, `P2POrderResponse`.
- Enums fuertes (no strings sueltos): `OrderStatus.PENDING` no `"pending"`.

---

## Diseño visual: APROBADO y CONGELADO

- **No tocar** botones, textos, iconos, colores, layout, espaciados, tipografías de páginas existentes.
- Si un botón existe sin `onClick` → solo se le agrega el handler.
- Si una lista muestra mocks → se reemplaza la fuente por API real, render idéntico.
- No agregar tooltips, badges, secciones, ni elementos visuales nuevos sin pedido explícito.
- No reorganizar el layout ni mover componentes de posición.

---

## Prohibiciones absolutas

- ❌ Mocks, datos fake, fallbacks falsos, valores inventados (FX rates, balances, listas)
- ❌ 2+ componentes en el mismo `.tsx`
- ❌ Lógica de negocio dentro de `app/[feature]/page.tsx`
- ❌ Llamadas directas browser → gateway
- ❌ `any` en props o respuestas
- ❌ `localStorage` para tokens
- ❌ Strings hardcodeados en lugar de traducciones (componentes nuevos)
- ❌ Carpetas nuevas si una existente cubre el caso
- ❌ Modificar diseño visual aprobado

---

## Auditoría tras cada cambio

Después de cualquier cambio reporta:
1. Qué se cambió y por qué
2. Componentes nuevos creados (con su ruta exacta)
3. Componentes reutilizados (en lugar de duplicar)
4. Hooks/services/types creados o tocados
5. Traducciones añadidas
6. Conexión real con qué endpoint del BFF
7. Qué quedó pendiente
8. Riesgos y validaciones requeridas
