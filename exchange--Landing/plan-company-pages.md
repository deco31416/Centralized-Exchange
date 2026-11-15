# Plan Company Pages - Deco Exchange

## Regla

- Cada pagina publica debe estar componentizada por modulo.
- Las paginas publicas venden y explican producto.
- Las paginas legales documentan condiciones, limites, riesgos y avisos.
- El footer no debe apuntar a anchors del home cuando el tema merece pagina propia.

## Creadas

- [x] `/roadmap`
  - Pagina publica del roadmap de producto.
  - Componentes en `components/company/roadmap`.
  - Footer actualizado desde `/#destacados` hacia `/roadmap`.

- [x] `/legals/roadmap`
  - Aviso legal del roadmap.
  - Aclara que el roadmap no es promesa contractual ni garantia de disponibilidad.
  - Agregado al centro legal.

- [x] `/unete-al-equipo`
  - Pagina publica para candidatos, colaboradores y areas de trabajo.
  - Componentes en `components/company/careers`.
  - Footer actualizado desde `/#comunidad` hacia `/unete-al-equipo`.

- [x] `/legals/unete-al-equipo`
  - Aviso legal para candidatos.
  - Incluye prevencion de fraude laboral y tratamiento de datos.
  - Agregado al centro legal.

## Pendientes Recomendadas

- [x] `/brand`
  - Reemplazar el uso comercial de `/legals/community` como "Guia de Marca".
  - Debe mostrar logos, usos permitidos, tono, colores, press kit y contacto.
  - Legal relacionado: `/legals/brand`.

- [x] `/business/crypto-processing`
  - Reemplazar el uso comercial de `/assets/crypto` como "Procesamiento Cripto".
  - Debe explicar checkout, pagos cripto, liquidacion, comercios, APIs y riesgo.
  - Legal relacionado: `/legals/crypto-processing`.

- [x] `/business/ecommerce-plugins`
  - Reemplazar el uso comercial de `/legals/widgets` como "E-Commerce plugins".
  - Debe mostrar plugins, widgets, integracion, sandbox, SDK y soporte tecnico.
  - Legal relacionado: `/legals/ecommerce-plugins`.

- [x] Footer actualizado
  - `Guia de Marca` apunta a `/brand`.
  - `Procesamiento Cripto` apunta a `/business/crypto-processing`.
  - `E-Commerce plugins` apunta a `/business/ecommerce-plugins`.

## Nota de Arquitectura

La carpeta `components/company` concentra paginas institucionales y comerciales de compania. Las rutas de `app` solo importan el componente principal para mantener separacion limpia entre routing y UI.
