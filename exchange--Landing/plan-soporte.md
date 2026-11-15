# Plan Soporte Deco - Deco Exchange

Documento de control tipo Jira para disenar, auditar y evolucionar el soporte global de Deco Exchange: chat, tickets, disputas, P2P, Red Deco, wallet, developers y operaciones.

Decision de producto: Soporte Deco es una capa transversal. No vive solo en Legales ni solo en Help Center. Debe estar disponible globalmente como widget flotante y debe poder abrirse desde paginas, flujos y componentes por evento.

---

## Estado Actual

| Item | Estado | Notas |
|---|---|---|
| Widget global | HECHO | Existe `components/support/deco-support-widget.tsx`. |
| Montaje global | HECHO | Se monta desde `app/layout.tsx`. |
| Help Center | HECHO | `Iniciar chat` y `Crear ticket de soporte` abren el widget. |
| Boton flotante | HECHO | Soporte queda abajo; subir queda arriba. |
| Panel responsive | HECHO | Usa `100dvh`, altura maxima y scroll interno. |
| Backend | POR HACER | Hoy es mock frontend. |
| QA visual | EN REVISION | Falta captura formal desktop/mobile y dark/light. |

---

## Auditoria Del Cambio Actual

### Componentes Tocadas

| Archivo | Cambio | Riesgo |
|---|---|---|
| `components/support/deco-support-widget.tsx` | Nuevo widget de soporte con home, chat y ticket mock. | Medio: componente global visible en toda la app. |
| `app/layout.tsx` | Monta `DecoSupportWidget` dentro de `AuthProvider`. | Medio: afecta todas las rutas. |
| `app/legals/help-center/page.tsx` | Cambia enlaces `#` por acciones que disparan `deco:support`. | Bajo: mejora enlaces muertos. |
| `components/ui/scroll-to-top.tsx` | Mueve boton de subir arriba del soporte. | Bajo: solo posicion visual. |
| `components/Main/layout/navbar/navbar.tsx` | Cambio previo: badge `Nivel 6 · Aliados`. | Bajo: no pertenece al soporte, pero sigue pendiente local. |

### Validaciones Realizadas

| Validacion | Estado | Resultado |
|---|---|---|
| TypeScript | HECHO | `pnpm exec tsc --noEmit --pretty false` paso. |
| Build | HECHO | `pnpm run build` paso despues de limpiar cache `.next`. |
| Hidratacion | EN REVISION | Se evito `Math.random()` en render inicial. El ID mock se genera solo al crear ticket. |
| Layout flotante | EN REVISION | Ajustado con `max-h-[calc(100dvh-7rem)]` y scroll interno. |

---

## Reglas De Producto

- Soporte debe estar disponible en todo el sitio.
- El boton de soporte queda debajo del boton de subir.
- El boton de subir queda encima y solo aparece cuando hay scroll suficiente.
- El panel no debe salirse del viewport.
- Chat, ticket y home deben usar scroll interno si falta espacio.
- Help Center no debe tener enlaces muertos para chat o ticket.
- El soporte debe servir para P2P, Red Deco, wallet, cuenta, operaciones y developers.
- Todo debe quedar componentizado antes de conectar backend.
- La UI actual es mock frontend; no debe prometer atencion real hasta conectar servicio.

---

## Arquitectura Frontend

### Componente Global

`DecoSupportWidget` maneja:

- Estado abierto/cerrado.
- Vista activa: `home`, `chat`, `ticket`.
- Evento global `deco:support`.
- Ticket mock con referencia `DECOSUP-YYYY-####`.
- Input de chat mock.
- Formulario de ticket mock.

### Evento Global

Patron actual:

```ts
window.dispatchEvent(new CustomEvent("deco:support", { detail: { view: "ticket" } }))
```

Vistas soportadas:

- `home`
- `chat`
- `ticket`

Uso esperado:

- Help Center abre `chat` o `ticket`.
- P2P podra abrir `ticket` desde disputas.
- Red Deco podra abrir `ticket` desde orden presencial.
- Wallet podra abrir `chat` desde movimientos o saldos.
- Developers podra abrir `ticket` desde API keys o integraciones.

---

## Roadmap Tipo Jira

| ID | Tarea | Estado | Prioridad | Criterio de terminado |
|---|---|---|---|---|
| SUP-001 | Crear widget global | HECHO | Alta | Existe componente aislado y montado globalmente. |
| SUP-002 | Conectar Help Center | HECHO | Alta | Chat y ticket abren el widget sin enlaces muertos. |
| SUP-003 | Ordenar botones flotantes | HECHO | Media | Subir arriba, soporte abajo. |
| SUP-004 | Corregir panel perdido en viewport | HECHO | Alta | Panel usa `100dvh`, max-height y scroll interno. |
| SUP-005 | QA visual desktop | POR HACER | Alta | Validar home, chat, ticket, footer y paginas largas. |
| SUP-006 | QA visual mobile | POR HACER | Alta | Validar 360px/390px, teclado, scroll y botones. |
| SUP-007 | QA dark/light | POR HACER | Alta | Validar contraste y estados en ambos temas. |
| SUP-008 | Conectar P2P | POR HACER | Alta | Disputa P2P abre soporte con contexto de orden. |
| SUP-009 | Conectar Red Deco | POR HACER | Alta | Orden de aliado abre soporte con contexto de operacion. |
| SUP-010 | Conectar Wallet/Bolsillito | POR HACER | Alta | Movimiento o recarga abre ticket con contexto. |
| SUP-011 | Conectar Developers | POR HACER | Media | API/Integracion abre ticket tecnico. |
| SUP-012 | Backend de tickets | POR HACER | Alta | Crear ticket real con usuario, producto, orden y adjuntos. |
| SUP-013 | Backend de chat | POR HACER | Alta | Mensajes persistentes y trazables. |
| SUP-014 | Adjuntos seguros | POR HACER | Alta | Upload validado, expiracion, virus scan y permisos. |
| SUP-015 | Panel admin/soporte | POR HACER | Alta | Cola de casos, asignacion, estado y SLA. |

---

## Contrato Futuro Backend

### Crear Ticket

Payload sugerido:

```ts
type CreateSupportTicketPayload = {
  topic: string
  subject: string
  description: string
  source: "help-center" | "p2p" | "red-deco" | "wallet" | "developers" | "market" | "global"
  userId?: string
  orderId?: string
  asset?: string
  amount?: string
  country?: string
  attachments?: string[]
}
```

Respuesta sugerida:

```ts
type CreateSupportTicketResponse = {
  ticketId: string
  status: "open" | "pending" | "assigned"
  createdAt: string
  nextStep: string
}
```

### Chat

Payload sugerido:

```ts
type SupportMessagePayload = {
  conversationId?: string
  message: string
  source: string
  userId?: string
  ticketId?: string
  metadata?: Record<string, string>
}
```

---

## Seguridad Y Compliance

| Riesgo | Mitigacion requerida |
|---|---|
| Adjuntos con documentos sensibles | Upload privado, expiracion, permisos y consentimiento. |
| Disputas P2P con informacion personal | Mostrar solo lo necesario segun estado y rol. |
| Soporte sin login | Permitir consulta general; operaciones privadas requieren login. |
| Evidencia falsa o alterada | Hash, timestamp y auditoria de archivos. |
| Phishing por chat | Mensajes oficiales, advertencias y no pedir semillas/claves. |
| Datos fiscales o KYC | Separar formularios seguros de mensajes libres. |

---

## Criterios De QA Visual

- El widget no tapa botones criticos del sitio.
- En paginas largas, soporte y subir no se superponen.
- En mobile, el panel no se sale por arriba ni por abajo.
- En chat, el input siempre queda visible.
- En ticket, el formulario se puede completar con scroll interno.
- El header del widget mantiene contraste en light/dark.
- Los iconos no rompen el estilo aprobado del home.
- No debe existir scroll horizontal.

---

## Pendiente Para Cierre 10/10

1. Probar visualmente `/legals/help-center` en desktop y mobile.
2. Probar una pagina larga con footer para validar botones flotantes.
3. Probar dark/light del widget.
4. Definir eventos con contexto para P2P, Red Deco y Wallet.
5. Conectar tickets reales cuando exista backend/gateway.
6. Documentar en README/CHANGELOG cuando se apruebe visualmente.

