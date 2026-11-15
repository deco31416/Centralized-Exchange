# Changelog

Los cambios notables del paquete **Deco Exchange** se registran aquí. Este changelog resume el conjunto de proyectos de esta primera publicación; cada carpeta `exchange--*` puede tener su propio historial y versión independiente.

## Preparación para la primera publicación — prototipo/MVP inicial (2026-11-15)

### Añadido

- Publicación de las bases iniciales de Deco Exchange como conjunto de proyectos separados para frontend, gateways y microservicios.
- README raíz con alcance, aviso de no apto para producción y diagramas Mermaid de la arquitectura e integraciones conocidas.
- Guía raíz de contribución con recomendaciones para secretos, cambios financieros, contratos entre servicios y validación por proyecto.
- `.gitignore` raíz para excluir configuración local, secretos, certificados, dependencias, artefactos generados, logs y dumps, preservando plantillas de entorno de ejemplo.
- Índice raíz enlazado a los README de los 38 proyectos, con una explicación de la decisión de microservicios y un mapa Mermaid de alto nivel.
- Badges de etapa, advertencias de no producción y diagramas Mermaid de relaciones agregados a los README de cada proyecto.
- `.gitignore`, `CHANGELOG.md` y `.env.example` uniformados por carpeta; se completaron los archivos que faltaban y las plantillas usan marcadores no funcionales para credenciales.
- Se documentó que la capacidad de usuarios concurrentes, TPS y latencias no está medida; se retiraron estimaciones de rendimiento sin pruebas reproducibles.
- Se añadieron el contexto de negocio como hipótesis del prototipo, una matriz de madurez de flujos, un diagrama conceptual de límites de confianza y una ruta breve para evaluar código representativo.
- Se describieron Outbox/Inbox e idempotencia sin atribuir garantías `At-Least-Once` o exactamente una vez que no se han validado de extremo a extremo.
- Se hizo más explícita la separación entre este prototipo y el desarrollo vigente, y se aclaró el alcance de la licencia raíz frente a los términos propios de cada subproyecto.

### Alcance

- Esta entrega representa una etapa temprana/prototipo, no la plataforma vigente que Deco31416 mantiene actualmente.
- Las integraciones representadas pueden estar incompletas o requerir validación; los flujos con dinero real no están aprobados para producción.
- Los retiros del orquestador permanecen deshabilitados y el repositorio no publica cifras de capacidad certificadas.

### Pendiente

- Consolidar licencias y derechos de redistribución para el paquete completo y sus dependencias.
- Completar y revisar las integraciones fiat/cripto y los controles operativos antes de plantear cualquier uso productivo.
