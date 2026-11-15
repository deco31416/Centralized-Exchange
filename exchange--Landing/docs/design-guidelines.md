# Guia de diseno Deco Exchange

## Fuente visual aprobada

El diseno visual aprobado para nuevas pantallas debe tomar como referencia principal el home:

- `app/page.tsx`
- `components/Main/views/*`
- `components/Main/layout/navbar/*`
- `components/common/legals/*` para paginas regulatorias/documentales

Las pantallas privadas o de producto, como `bolsillito`, deben sentirse parte del mismo sistema visual del home: fondo limpio, cards sobrias, tipografia fuerte, controles redondeados y naranja como acento.

## Regla de color naranja

No usar bordes naranjas grandes o dominantes como marco principal de cards, paneles, steppers, listas o contenedores.

El naranja `#ff6c02` / `primary` se usa como acento:

- pequenos indicadores
- iconos
- texto de categoria
- lineas laterales discretas
- estados seleccionados sutiles
- botones primarios

Evitar:

- cards completas con borde naranja grueso
- multiples contenedores con outline naranja
- halos o fondos naranjas pesados
- interfaces donde el naranja compita con el contenido

## Componentizacion

Todo nuevo flujo debe quedar componentizado. Evitar paginas monoliticas con UI, datos y logica mezclados.

Cada modulo debe separar, cuando aplique:

- pagina/ruta
- componentes de UI
- hooks
- datos/configuracion
- helpers puros

## Criterio para dashboards y apps privadas

Los dashboards no deben parecer landing pages ni documentacion legal. Deben ser interfaces operativas: claras, compactas, escaneables y preparadas para uso repetido.

El home define el estilo visual; el dashboard adapta ese estilo a una experiencia funcional.
