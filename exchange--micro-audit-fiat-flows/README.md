# Micro Audit — Fiat Flows

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

Worker/Scheduler que audita depósitos fiat pendientes comparando estado en el ledger vs proveedores bancarios (Stripe/Bank API).

## Tipo de servicio

**Worker (sin puerto HTTP)** — se ejecuta como cron scheduler.

## Funcionamiento

1. Cron `EVERY_MINUTE` revisa depósitos fiat pendientes
2. Compara estado en el ledger con el estado reportado por el proveedor bancario
3. Si un depósito está `settled` en el banco pero `pending` en el ledger por >1h, dispara alarma

## Bases de Datos

- **MongoDB `deco_audit_fiat`**: base propia para registros de auditoría
- **MongoDB `deco_ledger_core`**: lectura de transacciones (read-only via `ledger_conn`)

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
  UP0["micro-custody-fiat"] --> SERVICE["micro-audit-fiat-flows"]
  UP1["micro-payments-core"] --> SERVICE["micro-audit-fiat-flows"]
  SOURCE["Eventos fiat / ledger configurados"] --> SERVICE["micro-audit-fiat-flows"]
  SERVICE["micro-audit-fiat-flows"] --> TARGET["Hallazgos de auditoría"]
```

**Documentación relacionada:** [micro-custody-fiat](../exchange--micro-custody-fiat/README.md) · [micro-payments-core](../exchange--micro-payments-core/README.md).

**Capacidad:** no hay resultados de carga publicados para este componente. Consulta la sección de [capacidad y rendimiento](../README.md#capacity) del README raíz.

**Archivos del componente:** [`.env.example`](.env.example) · [`CHANGELOG.md`](CHANGELOG.md) · [mapa general](../README.md#service-docs).

<!-- DECO-RELATION-DIAGRAM -->
