# Red Deco, Aliado Deco y Puntos Deco

Guia de nombres para evitar confundir la red fisica de efectivo/remesas con las recompensas del usuario.

## Regla Principal

| Nombre | Significado | Ruta canonica | Uso correcto |
|---|---|---|---|
| Red Deco | Red fisica de aliados para depositar, retirar y enviar remesas. | `/bolsillito/red-deco` | Usuario final busca aliados cercanos. |
| Aliado Deco | Programa para operar como aliado/cajero/comercio/empresa y ganar comisiones. | `/earn/aliado-deco` | Operador solicita activacion y atiende ordenes. |
| Puntos Deco / Deco Points | Recompensas, puntos acumulables y beneficios por actividad. | `/earn/deco-points` | Usuario acumula/canjea beneficios. |

## No Hacer

- No usar `Puntos Deco` para la red fisica.
- No usar `Punto Deco` como nombre comercial del aliado.
- No usar `Deco Points` para cajeros, comercios, efectivo o remesas.
- No mezclar recompensas con operaciones presenciales.

## Si Hacer

- En Bolsillito usar `Red Deco`.
- En Ganar para operadores usar `Aliado Deco`.
- En Ganar para recompensas usar `Puntos Deco` o `Deco Points`.
- En cards operativas usar la palabra `aliado` cuando se hable de la persona/comercio/empresa que atiende.
- En rutas nuevas usar `/bolsillito/red-deco` y `/earn/aliado-deco`.

## Rutas Legacy

Estas rutas pueden existir solo como compatibilidad:

- `/bolsillito/puntos-deco`
- `/earn/punto-deco`

No deben aparecer en navbar, footer, docs comerciales ni nuevos enlaces internos.

## Copy Aprobado

Red Deco:

`Deposita, retira y envia dinero con aliados verificados cerca de ti.`

Aliado Deco:

`Gana comisiones atendiendo depositos, retiros y remesas desde tu comercio o cuenta verificada.`

Puntos Deco / Deco Points:

`Acumula puntos por actividad elegible y canjea beneficios dentro de Deco.`

## Nota Para Microservicios

Los nombres internos tipo `Point`, `PointOrder`, `PointRoute` o `PointOperator` pueden usarse como entidades tecnicas si el backend ya las necesita. No son marca visible al usuario.

La marca visible debe ser:

- `Red Deco` para usuario final.
- `Aliado Deco` para operador.
- `Puntos Deco / Deco Points` para recompensas.
