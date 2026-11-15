# Micro Audit — Balance Integrity (Pepsi Test)

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

Worker/Scheduler que ejecuta el **Pepsi Test** cada hora: compara Total Assets vs Total Liabilities para verificar solvencia del exchange.

## Tipo de servicio

**Worker (sin puerto HTTP)** — se ejecuta como cron scheduler.

## Funcionamiento

1. Cron `EVERY_HOUR` se dispara automáticamente
2. Calcula total de activos y pasivos desde el ledger
3. Compara ratio `assets / liabilities`
4. Si ratio < 1.0, dispara alarma de insolvencia (kill switch)

## Base de Datos

- **MongoDB**: conecta a `deco_ledger_core` (read-only via `ledger_conn`)

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `MONGODB_URI` | Conexión a MongoDB Atlas |

## Stack

- NestJS 10
- Mongoose 8
- `@nestjs/schedule` (cron jobs)

## Instalación

```bash
yarn install
yarn start:dev
```

## Relación con otros proyectos

Este esquema resume relaciones de alto nivel descritas en el repositorio. Las líneas punteadas indican integraciones incompletas o pendientes de validación; ninguna flecha certifica que el flujo esté desplegado o probado.

```mermaid
flowchart LR
  UP0["micro-wallet-ledger-core"] --> SERVICE["micro-audit-balance-integrity"]
  SOURCE["Extractos de ledger / evidencia local"] --> SERVICE["micro-audit-balance-integrity"]
  SERVICE["micro-audit-balance-integrity"] --> TARGET["Hallazgos de auditoría"]
```

**Documentación relacionada:** [micro-wallet-ledger-core](../exchange--micro-wallet-ledger-core/README.md).

**Capacidad:** no hay resultados de carga publicados para este componente. Consulta la sección de [capacidad y rendimiento](../README.md#capacity) del README raíz.

**Archivos del componente:** [`.env.example`](.env.example) · [`CHANGELOG.md`](CHANGELOG.md) · [mapa general](../README.md#service-docs).

<!-- DECO-RELATION-DIAGRAM -->
