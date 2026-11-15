# Micro Withdrawal Orchestrator

<!-- DECO-RELEASE-BADGES -->
[![Prototipo inicial](https://img.shields.io/badge/etapa-prototipo%20inicial-orange.svg)](../README.md#alcance-y-estado) [![No apto para producción](https://img.shields.io/badge/producci%C3%B3n-no%20apta-red.svg)](../README.md#limitaciones-conocidas) [![Mapa del sistema](https://img.shields.io/badge/arquitectura-mapa%20global-blue.svg)](../README.md#arquitectura)
<!-- /DECO-RELEASE-BADGES -->

<!-- DECO-NON-PRODUCTION-NOTICE -->
> **Advertencia:** prototipo en fase inicial, no apto para producción. No conectes este servicio a fondos, cuentas bancarias, wallets, datos de clientes ni credenciales reales. Las capacidades descritas son referencias al código y no pruebas de aceptación; las rutas, controles y dependencias requieren validación independiente.
<!-- /DECO-NON-PRODUCTION-NOTICE -->


[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
**Licencia: pendiente de confirmar para este subproyecto.**
[![version](https://img.shields.io/badge/version-0.0.2-blue)](#)

**Puerto**: 7015

Microservicio que orquesta el proceso completo de retiros (withdrawals), aplicando políticas de autorización antes de procesar cada operación.

## Módulos

| Módulo | Descripción |
|--------|-------------|
| `policy/` | `auth-policy.service.ts` — Validación de políticas de retiro |
| `withdrawals/` | Servicio principal, esquema MongoDB, módulo |

## Endpoints

### Withdrawals
- `POST /withdrawals` — Solicitar retiro
- `GET /withdrawals/:id` — Consultar estado de retiro

### Health
- `GET /health` — Health check

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servicio | `7015` |
| `MONGODB_URI` | Conexión a MongoDB Atlas | — |
| `INTERNAL_AUTH_TOKEN` | Token de autenticación interna | — |

## Stack

- NestJS 10, Mongoose 8
- Axios, uuid

## Instalación

```bash
yarn install
yarn start:dev
```

## Relación con otros proyectos

Este esquema resume relaciones de alto nivel descritas en el repositorio. Las líneas punteadas indican integraciones incompletas o pendientes de validación; ninguna flecha certifica que el flujo esté desplegado o probado.

```mermaid
flowchart LR
  SOURCE["Solicitud de retiro"] --> SERVICE["micro-withdrawal-orchestrator"]
  SERVICE["micro-withdrawal-orchestrator"] -. "por validar" .-> PENDING0["micro-wallet-ledger-core"]
  SERVICE["micro-withdrawal-orchestrator"] -. "por validar" .-> PENDING1["micro-custody-crypto"]
  SERVICE["micro-withdrawal-orchestrator"] --> TARGET["501 Not Implemented; no se mueven fondos"]
```

**Documentación relacionada:** [micro-wallet-ledger-core](../exchange--micro-wallet-ledger-core/README.md) · [micro-custody-crypto](../exchange--micro-custody-crypto/README.md).

**Capacidad:** no hay resultados de carga publicados para este componente. Consulta la sección de [capacidad y rendimiento](../README.md#capacity) del README raíz.

**Archivos del componente:** [`.env.example`](.env.example) · [`CHANGELOG.md`](CHANGELOG.md) · [mapa general](../README.md#service-docs).

<!-- DECO-RELATION-DIAGRAM -->
