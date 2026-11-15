# Guía de contribución

Gracias por tu interés en contribuir a **Deco Exchange**. Este repositorio contiene una primera versión de prototipo/MVP y sus integraciones no están certificadas para producción. Las contribuciones deben mantener esa distinción clara y no presentar componentes incompletos como listos para operar dinero real.

## Antes de empezar

1. Lee el [README](README.md), especialmente el aviso de seguridad, alcance y arquitectura.
2. Identifica el proyecto afectado (`exchange--*`) y revisa su `README.md`, `package.json`, `.env.example` y `CHANGELOG.md`.
3. Comprueba la licencia del componente antes de modificarlo o redistribuirlo. Si la licencia o los derechos no están claros, consulta a Deco31416 en [deco31416.com](https://deco31416.com).
4. Para cambios grandes o contratos entre servicios, abre primero una propuesta que describa el problema, el servicio propietario del dato y el impacto en los consumidores.

## Reglas de seguridad

- No uses ni subas credenciales reales, tokens, claves, certificados, semillas de wallet, dumps de bases de datos, datos personales o logs de clientes.
- Usa únicamente valores falsos y cuentas sandbox. No conectes esta versión a fondos ni a proveedores de producción.
- No confíes en headers que provengan directamente del navegador para identidad, autorización o autenticación entre servicios.
- Mantén los secretos en configuración local ignorada por Git o en un gestor de secretos. Nunca los pongas en `.env.example`, documentación, capturas o historial.
- Los cambios a ledger, custodia, depósitos, retiros, webhooks, precios, fees, KYC/riesgo y límites requieren especial cuidado: documenta los escenarios de fallo, duplicados, reintentos, reversos y auditoría.
- No cambies contratos compartidos, autenticación interna o nombres/rutas de gateway sin describir el impacto en todos los consumidores afectados.
- Si detectas una vulnerabilidad o una credencial expuesta, no la publiques en un issue. Contacta a Deco31416 desde [deco31416.com](https://deco31416.com) y revoca/rota de inmediato cualquier secreto comprometido.

## Desarrollo

Los subproyectos pueden usar gestores y versiones distintos. **No asumas un único gestor de paquetes para todo el paquete.** Antes de instalar o actualizar dependencias:

1. Entra a la carpeta del servicio que vas a cambiar.
2. Sigue su README, `packageManager`, scripts y lockfile existentes.
3. No mezcles npm, pnpm, Yarn o Bun en un mismo servicio ni generes lockfiles adicionales.
4. No subas `node_modules`, `.next`, `dist`, `build`, `.pnp.*` local ni resultados generados, salvo que el proyecto explique expresamente por qué un artefacto forma parte del código fuente.

Ejecuta los checks definidos por el servicio afectado (lint, typecheck, pruebas y/o build). Si no existen, indícalo en la propuesta; no afirmes que una integración está probada solo porque compila.

## Cambios y documentación

- Mantén cada cambio acotado al proyecto responsable del comportamiento.
- Para cantidades de dinero, conserva la precisión que exige el contrato y evita conversiones de punto flotante cuando se contabilicen montos.
- Los eventos y operaciones financieras deben poder rastrearse y manejar duplicados/reintentos de forma explícita.
- Actualiza el README del servicio y/o este README raíz cuando cambie una ruta, dependencia, variable de entorno, diagrama, limitación o procedimiento de ejecución.
- Añade una entrada al `CHANGELOG.md` raíz para cambios relevantes del conjunto y al changelog del servicio afectado cuando corresponda.
- Los diagramas deben distinguir conexiones implementadas de las planeadas o pendientes.

## Pull requests

Incluye en la descripción:

- Qué problema resuelve y por qué.
- Qué carpetas/servicios cambia y quién consume sus contratos.
- Variables de entorno nuevas o modificadas (solo nombres y ejemplos falsos).
- Migraciones, efectos en datos, idempotencia, rollback y escenarios de fallo, si aplican.
- Checks ejecutados y resultados; identifica expresamente lo que no se pudo probar.
- Cambios de documentación y capturas sanitizadas, si ayudan a revisar la propuesta.

Mantén los commits claros y específicos, por ejemplo:

```text
docs: documentar integracion de custody fiat
fix: conservar idempotencia al reintentar webhooks
feat: agregar consulta de activos al gateway
```

## Revisión

Una contribución puede recibir solicitudes de cambios antes de integrarse. La aprobación de una pull request no convierte este prototipo en un sistema apto para producción ni en una autorización para manejar dinero real.
