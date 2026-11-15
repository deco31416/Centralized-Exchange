# Micro Notifications (Admin)

<!-- DECO-RELEASE-BADGES -->
[![Prototipo inicial](https://img.shields.io/badge/etapa-prototipo%20inicial-orange.svg)](../README.md#alcance-y-estado) [![No apto para producción](https://img.shields.io/badge/producci%C3%B3n-no%20apta-red.svg)](../README.md#limitaciones-conocidas) [![Mapa del sistema](https://img.shields.io/badge/arquitectura-mapa%20global-blue.svg)](../README.md#arquitectura)
<!-- /DECO-RELEASE-BADGES -->

<!-- DECO-NON-PRODUCTION-NOTICE -->
> **Advertencia:** prototipo en fase inicial, no apto para producción. No conectes este servicio a fondos, cuentas bancarias, wallets, datos de clientes ni credenciales reales. Las capacidades descritas son referencias al código y no pruebas de aceptación; las rutas, controles y dependencias requieren validación independiente.
<!-- /DECO-NON-PRODUCTION-NOTICE -->


[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![version](https://img.shields.io/badge/version-0.0.3-blue)](#)

Microservicio de notificaciones para administradores.

## Puertos

- API: `http://localhost:7003`
- Base path: `/api/v1`
- Swagger: `/api/docs`

## Arranque local

```bash
cd Exchange--micro-notifications-admin
yarn install
yarn start:dev
```

## Scripts

- `yarn start:dev` — desarrollo (watch)
- `yarn build` / `yarn start:prod` — producción
- `yarn test` — tests

## Recursos

- [Documentación de NestJS](https://docs.nestjs.com) para consultar el framework.
- [Mapa general de Deco Exchange](../README.md) y sus límites de prototipo.
- Antes de integrar proveedores de correo o SMS, configura credenciales sandbox en `.env` local y valida webhooks y permisos.

## License

Este subproyecto incluye su propio archivo `LICENSE`; la licencia del repositorio completo debe revisarse junto con las de los demás servicios.

## Relación con otros proyectos

Este esquema resume relaciones de alto nivel descritas en el repositorio. Las líneas punteadas indican integraciones incompletas o pendientes de validación; ninguna flecha certifica que el flujo esté desplegado o probado.

```mermaid
flowchart LR
  UP0["api-gateway-admin"] --> SERVICE["micro-notifications-admin"]
  SERVICE["micro-notifications-admin"] --> TARGET["Proveedores de correo / SMS configurados"]
```

**Documentación relacionada:** [api-gateway-admin](../exchange--api-gateway-admin/README.md).

**Capacidad:** no hay resultados de carga publicados para este componente. Consulta la sección de [capacidad y rendimiento](../README.md#capacity) del README raíz.

**Archivos del componente:** [`.env.example`](.env.example) · [`CHANGELOG.md`](CHANGELOG.md) · [mapa general](../README.md#service-docs).

<!-- DECO-RELATION-DIAGRAM -->
