# micro-DECOPAY-core

<!-- DECO-RELEASE-BADGES -->
[![Prototipo inicial](https://img.shields.io/badge/etapa-prototipo%20inicial-orange.svg)](../README.md#alcance-y-estado) [![No apto para producción](https://img.shields.io/badge/producci%C3%B3n-no%20apta-red.svg)](../README.md#limitaciones-conocidas) [![Mapa del sistema](https://img.shields.io/badge/arquitectura-mapa%20global-blue.svg)](../README.md#arquitectura)
<!-- /DECO-RELEASE-BADGES -->

<!-- DECO-NON-PRODUCTION-NOTICE -->
> **Advertencia:** prototipo en fase inicial, no apto para producción. No conectes este servicio a fondos, cuentas bancarias, wallets, datos de clientes ni credenciales reales. Las capacidades descritas son referencias al código y no pruebas de aceptación; las rutas, controles y dependencias requieren validación independiente.
<!-- /DECO-NON-PRODUCTION-NOTICE -->


> **DECO EXCHANGE** — Handles DECOPAY merchant payment requests and QR-based payments

## Overview

| Property | Value |
|----------|-------|
| **Port** | 9017 |
| **Prefix** | `api/v1` |
| **Framework** | NestJS |
| **Package Manager** | yarn |

## Endpoints

- `POST /api/v1/DECOPAY/requests — Create payment request`
- `GET /api/v1/DECOPAY/requests — List payment requests`
- `GET /api/v1/DECOPAY/requests/:id — Get request details`
- `POST /api/v1/DECOPAY/pay/request-otp — Request OTP for payment`
- `POST /api/v1/DECOPAY/pay — Execute payment`
- `PATCH /api/v1/DECOPAY/cancel — Cancel payment request`
- `GET /api/v1/health — Health check`

## Dependencies (service-to-service)

wallet-ledger (:9001), signature-keys (:3007), notifications (:7004), internal-transfers (:3006)

## Infrastructure

MongoDB Atlas + Redis Railway (ballast) for Bull queues.

## Environment Variables

Configured via `.env.local` (primary) with `.env` as fallback.

Key variables:
- `PORT` — Service port (default: 9017)
- `MONGODB_URI` — MongoDB Atlas connection string
- `REDIS_URL` — Redis Railway (ballast) connection string
- `INTERNAL_AUTH_TOKEN` — Service-to-service authentication token
- `API_PREFIX` — API route prefix (default: `api/v1`)
- `NODE_ENV` — Environment (`development` / `production`)

## Development

```bash
# Install dependencies
yarn install

# Start in development mode (watch)
yarn start:dev

# Build for production
yarn build

# Start production
yarn start:prod
```

## Architecture

This service is part of the DECO EXCHANGE microservices ecosystem.
Communication flow: `dashboard → api-gateway-user (:8081) → micro-DECOPAY-core (:9017)`

All inter-service calls include `X-Internal-Auth` header for authentication.

## Relación con otros proyectos

Este esquema resume relaciones de alto nivel descritas en el repositorio. Las líneas punteadas indican integraciones incompletas o pendientes de validación; ninguna flecha certifica que el flujo esté desplegado o probado.

```mermaid
flowchart LR
  UP0["api-gateway-user"] --> SERVICE["micro-decopay-core"]
  SERVICE["micro-decopay-core"] --> DOWN1["micro-wallet-ledger-core"]
  SERVICE["micro-decopay-core"] --> DOWN2["micro-internal-transfers"]
  SERVICE["micro-decopay-core"] --> DOWN3["micro-signature-keys"]
```

**Documentación relacionada:** [api-gateway-user](../exchange--api-gateway-user/README.md) · [micro-wallet-ledger-core](../exchange--micro-wallet-ledger-core/README.md) · [micro-internal-transfers](../exchange--micro-internal-transfers/README.md) · [micro-signature-keys](../exchange--micro-signature-keys/README.md).

**Capacidad:** no hay resultados de carga publicados para este componente. Consulta la sección de [capacidad y rendimiento](../README.md#capacity) del README raíz.

**Archivos del componente:** [`.env.example`](.env.example) · [`CHANGELOG.md`](CHANGELOG.md) · [mapa general](../README.md#service-docs).

<!-- DECO-RELATION-DIAGRAM -->
