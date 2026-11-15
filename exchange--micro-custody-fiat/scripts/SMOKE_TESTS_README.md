# Smoke Tests End-to-End

Script automatizado para validar el flujo completo de depósitos FIAT desde custody-fiat hasta acreditación en wallet-ledger-core.

## Pre-requisitos

### 1. Servicios corriendo

Iniciar los 3 microservicios en terminales separadas:

```bash
# Terminal 1 - wallet-ledger-core (puerto 3003)
cd Exchange--micro-wallet-ledger-core
yarn start:dev

# Terminal 2 - payments-core (puerto 3002)
cd Exchange--micro-payments-core
yarn start:dev

# Terminal 3 - custody-fiat (puerto 3001)
cd Exchange--micro-custody-fiat
yarn start:dev
```

### 2. Base de datos

MongoDB debe estar corriendo:

```bash
# Opción 1: Docker
docker run -d -p 27017:27017 --name mongo mongo:7

# Opción 2: MongoDB local
mongod --dbpath /path/to/data
```

### 3. Variables de entorno

Asegurar que cada servicio tiene configurado su `.env`:

**custody-fiat**:
```env
MONGODB_URI=mongodb://localhost:27017/deco_micro_custody_fiat
PAYMENTS_CORE_URL=http://localhost:3002/api/v1
INTERNAL_AUTH_TOKEN=xxxxx--xxxxx
SPEI_STP_SECRET=xxxxx--xxxxx
```

**payments-core**:
```env
WALLET_LEDGER_CORE_URL=http://localhost:3003/api/v1
INTERNAL_AUTH_TOKEN=xxxxx--xxxxx
```

**wallet-ledger-core**:
```env
MONGODB_URI=mongodb://localhost:27017/deco_micro_wallet_ledger_core
INTERNAL_AUTH_TOKEN=xxxxx--xxxxx
```

`xxxxx--xxxxx` es solo un marcador. Antes de ejecutar el flujo, configura valores aleatorios fuera del repositorio. Los servicios que validan entre sí deben recibir el mismo token de entorno; genera valores separados para entornos distintos. El script falla si faltan las variables de autenticación o firma.

## Ejecutar Tests

Desde el directorio de custody-fiat:

```bash
yarn test:smoke
```

O directamente:

```bash
node scripts/smoke-test-e2e.js
```

## Qué valida el script

### Test 1: Health Checks
Verifica que los 3 servicios estén disponibles mediante `GET /health`

### Test 2: Emisión de evento
Simula un depósito FIAT con webhook real:
- Llama a `POST /api/v1/webhooks/stp` (endpoint unificado) en custody-fiat
- custody-fiat normaliza y guarda el evento en outbox
- Outbox relay publica hacia payments-core con retries + circuit breaker

### Test 3: Verificación Outbox
Consulta MongoDB para verificar que el evento fue guardado en la colección `outbox_events` y que termina con `status=published`.

### Test 4: Acreditación en Ledger
Verifica que el balance del usuario fue acreditado correctamente:
- Llama a `GET /wallets/{userId}/balances` en ledger-core
- Verifica que el balance en la moneda especificada sea >= al monto depositado

## Ejemplo de salida exitosa

```
🚀 Iniciando Smoke Tests End-to-End
============================================================

📋 Test 1: Verificando servicios...
✅ custody-fiat está disponible
✅ payments-core está disponible
✅ wallet-ledger-core está disponible

📋 Test 2: Simulando transferencia stp...
ℹ️  Usuario: user_test_1704988800000, Monto: 50000 MXN (minor units)
✅ Evento emitido correctamente
ℹ️  Transfer ID: abc-123-def
ℹ️  Correlation ID: xyz-789-uvw
✅ payments-core procesó el evento

📋 Test 3: Verificando outbox...
✅ Evento encontrado en outbox
ℹ️  Event: FIAT_TRANSFER_DETECTED
ℹ️  Status: published

📋 Test 4: Verificando balance en ledger...
✅ Balance obtenido correctamente
ℹ️  Balance MXN: 50000 (available), 50000 (total)
✅ Balance acreditado correctamente (>= 50000)

============================================================
📊 Resumen de Tests
============================================================
✅ Tests exitosos: 4
ℹ️  Duración: 3.45s

✨ Todos los tests pasaron correctamente!
```

## Configuración avanzada

### Variables de entorno personalizadas

```bash
# Cambiar URLs de servicios
export CUSTODY_FIAT_URL=http://localhost:4001/api/v1
export PAYMENTS_CORE_URL=http://localhost:4002/api/v1
export LEDGER_CORE_URL=http://localhost:4003/api/v1

# Cambiar MongoDB
export MONGODB_URI=mongodb://xxxxx--xxxxx:xxxxx--xxxxx@host:27017/dbname

# Cambiar token de autenticación
export INTERNAL_AUTH_TOKEN=my-custom-token

# Ejecutar tests
yarn test:smoke
```

## Troubleshooting

### Error: "Servicio X no responde"
- Verificar que el servicio está corriendo: `curl http://localhost:300X/health`
- Revisar logs del servicio en la terminal correspondiente
- Verificar puertos en `.env` de cada servicio

### Error: "No se pudo verificar outbox"
- Verificar que MongoDB está corriendo: `mongosh`
- Verificar URI en `.env` de custody-fiat
- Verificar que `WEBHOOKS_INGEST_TRANSPORT=inline` (no requiere Redis)

### Warning: "Balance no acreditado"
- Verificar que payments-core se conectó correctamente a ledger-core
- Revisar logs de payments-core: buscar `POST /internal/ledger/fiat-deposit-confirmed`
- Verificar que `WALLET_LEDGER_CORE_URL` está configurado correctamente
- Verificar que `INTERNAL_AUTH_TOKEN` coincide en ambos servicios

### Error: "Usuario no tiene wallet creado"
- Normal en primera ejecución
- El script crea un usuario nuevo cada vez con timestamp único
- Si persiste, verificar que ledger-core crea wallets automáticamente al recibir el evento

## Próximos pasos

Para tests más robustos:
1. **Tests de carga**: Simular múltiples transferencias concurrentes
2. **Tests de fallo**: Apagar un servicio y verificar circuit breaker
3. **Tests de reconciliación**: Crear drift manual y verificar que se detecta
4. **Tests multi-provider**: Ejecutar para SPEI, Mercado Pago y Stripe
5. **CI/CD**: Integrar este script en pipeline de GitHub Actions

## Integración CI/CD

Ejemplo para GitHub Actions:

```yaml
name: Smoke Tests

on: [push, pull_request]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd Exchange--micro-wallet-ledger-core && yarn install
          cd ../Exchange--micro-payments-core && yarn install
          cd ../Exchange--micro-custody-fiat && yarn install
      
      - name: Start services
        run: |
          cd Exchange--micro-wallet-ledger-core && yarn start &
          cd ../Exchange--micro-payments-core && yarn start &
          cd ../Exchange--micro-custody-fiat && yarn start &
          sleep 10
      
      - name: Run smoke tests
        run: cd Exchange--micro-custody-fiat && yarn test:smoke
```
