# Guia de Contribucion - Deco Exchange Landing

Gracias por contribuir a Deco Exchange Landing. Este frontend se trabaja como una experiencia **dashboard landing**: cada pagina debe vender, explicar y operar visualmente sin perder claridad legal ni estructura de producto.

## Reglas de oro

- Usa **pnpm siempre**.
- No uses `npm`, `yarn` ni generes lockfiles alternos.
- Todo debe quedar componentizado por modulo.
- Las rutas de `app/` deben ser delgadas: importan el componente principal y metadata.
- No mezcles documentos legales con paginas comerciales. Legal informa condiciones; producto explica experiencia.
- El home, legales, Bolsillito, Mercados, Company Pages y Status son referencias visuales aprobadas.

## Flujo de trabajo

1. Crea o actualiza componentes en el modulo correspondiente:
   - `components/company/*` para paginas institucionales y B2B.
   - `components/status/*` para status page.
   - `components/common/legals/*` para documentos legales compartidos.
   - `components/markets/*`, `components/earn/*`, `components/rendimiento/*` para productos existentes.
2. Conecta la ruta en `app/`.
3. Actualiza footer/navbar/legales si la pagina debe ser descubierta.
4. Actualiza plan o documentacion si cambia arquitectura o criterio de producto.
5. Ejecuta validaciones antes de commit.

## Comandos obligatorios

```bash
pnpm exec tsc --noEmit --pretty false
pnpm run build
git diff --check
```

Si Next falla con errores intermitentes de modulos en `.next`, limpia solo cache generada y vuelve a intentar:

```bash
Remove-Item -LiteralPath .next -Recurse -Force
pnpm run build
```

## Estilo frontend

- Naranja `#ff6c02` como acento, no como borde dominante.
- Cards con radio contenido y jerarquia clara.
- Copys cortos, operativos y sin promesas financieras.
- Evita tabs cuando cada producto merece una URL propia.
- Para rutas publicas, muestra informacion util sin login; reserva datos sensibles para flujos autenticados.
- En mobile, evita textos largos dentro de badges, botones o metricas compactas.

## Seguridad

- No expongas secretos en cliente.
- No confies en headers enviados por browser para identidad.
- No agregues endpoints BFF de escritura sin origin guard, sesion y reglas de permisos.
- Respeta cookies HttpOnly y consentimiento de cookies.
- Mantén soporte y formularios con trazabilidad cuando pidan datos sensibles.

## Documentacion

Actualiza al menos uno de estos cuando aplique:

- `README.md`
- `CHANGELOG.md`
- Planes tipo Jira (`plan-*.md`)
- Documentos en `docs/`

## Commits

Usa mensajes claros y por alcance:

```bash
git commit -m "feat: agregar status page deco"
git commit -m "docs: actualizar roadmap y guia de contribucion"
git commit -m "fix: ajustar grafica legal referencial"
```

## Checklist antes de subir

- [ ] La UI esta componentizada.
- [ ] No hay cambios no relacionados.
- [ ] `pnpm exec tsc --noEmit --pretty false` pasa.
- [ ] `pnpm run build` pasa.
- [ ] `git diff --check` no reporta errores.
- [ ] README/CHANGELOG/version estan actualizados cuando aplica.
