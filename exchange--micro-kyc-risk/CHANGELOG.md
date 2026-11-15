# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


## 0.3.0 - 2026-06-23

- Se agrega persistencia MongoDB para casos KYC/Risk, reglas y perfiles de riesgo.
- Se agregan schemas Mongoose para `kyc_risk_cases`, `kyc_risk_rules` y `user_risk_profiles`.
- Se conserva el contrato HTTP usado por Gateway Admin y Admin Panel.

## 0.2.0 - 2026-06-23

- Se agrega motor inicial de riesgo de usuario con semáforo verde, naranja y rojo.
- Se agregan perfiles de riesgo, señales por fuente y matriz operativa.
- Se conectan endpoints para evaluación de riesgo desde Gateway Admin.

## 0.1.0 - 2026-06-23

- Se crea el microservicio inicial `exchange--micro-kyc-risk`.
- Se agregan endpoints base de health, overview, casos y reglas.
- Se documenta el alcance inicial para KYC, AML y Risk.
