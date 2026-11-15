#!/bin/bash

# Script para generar par de llaves RSA para STP (SPEI)
# Uso: ./generate-stp-keys.sh [dev|staging|prod] [alias-empresa]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
ENVIRONMENT=${1:-dev}
ALIAS=${2:-DECOEXCHANGE}
OUTPUT_DIR="certs/${ENVIRONMENT}"
VALIDITY_DAYS=730  # 2 años

echo -e "${GREEN}=== Generador de Llaves STP para SPEI ===${NC}"
echo ""
echo "Ambiente: ${ENVIRONMENT}"
echo "Alias: ${ALIAS}"
echo "Directorio de salida: ${OUTPUT_DIR}"
echo ""

# Crear directorio si no existe
mkdir -p "${OUTPUT_DIR}"

# Solicitar contraseña
echo -e "${YELLOW}Ingresa una contraseña segura para las llaves:${NC}"
read -s -p "Contraseña: " PASSWORD
echo ""
read -s -p "Confirmar contraseña: " PASSWORD_CONFIRM
echo ""

if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
    echo -e "${RED}Las contraseñas no coinciden${NC}"
    exit 1
fi

if [ ${#PASSWORD} -lt 12 ]; then
    echo -e "${RED}La contraseña debe tener al menos 12 caracteres${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Contraseña confirmada${NC}"
echo ""

# 1. Generar llave privada en formato JKS
echo -e "${YELLOW}Paso 1: Generando llave privada (JKS)...${NC}"
keytool -genkey -alias "${ALIAS}" \
    -keyalg RSA \
    -keystore "${OUTPUT_DIR}/stp-private.jks" \
    -keysize 2048 \
    -deststoretype jks \
    -validity ${VALIDITY_DAYS} \
    -storepass "${PASSWORD}" \
    -keypass "${PASSWORD}" \
    -dname "CN=${ALIAS}, OU=Finance, O=DECO EXCHANGE, L=Mexico City, ST=CDMX, C=MX"

echo -e "${GREEN}✓ Llave privada JKS generada${NC}"
echo ""

# 2. Convertir JKS a P12
echo -e "${YELLOW}Paso 2: Convirtiendo JKS a P12...${NC}"
keytool -importkeystore \
    -srckeystore "${OUTPUT_DIR}/stp-private.jks" \
    -destkeystore "${OUTPUT_DIR}/stp-private.p12" \
    -srcstoretype jks \
    -deststoretype pkcs12 \
    -srcstorepass "${PASSWORD}" \
    -deststorepass "${PASSWORD}" \
    -srcalias "${ALIAS}" \
    -destalias "${ALIAS}" \
    -srckeypass "${PASSWORD}" \
    -destkeypass "${PASSWORD}" \
    -noprompt

echo -e "${GREEN}✓ Llave P12 generada${NC}"
echo ""

# 3. Convertir P12 a PEM (sin cifrar para Node.js)
echo -e "${YELLOW}Paso 3: Convirtiendo P12 a PEM (formato Node.js)...${NC}"
openssl pkcs12 \
    -in "${OUTPUT_DIR}/stp-private.p12" \
    -out "${OUTPUT_DIR}/stp-private.pem" \
    -nodes \
    -passin pass:"${PASSWORD}"

echo -e "${GREEN}✓ Llave PEM generada${NC}"
echo ""

# 4. Generar llave pública (CER)
echo -e "${YELLOW}Paso 4: Generando llave pública (CER)...${NC}"
keytool -export \
    -alias "${ALIAS}" \
    -keystore "${OUTPUT_DIR}/stp-private.jks" \
    -rfc \
    -file "${OUTPUT_DIR}/stp-public.cer" \
    -storepass "${PASSWORD}"

echo -e "${GREEN}✓ Llave pública CER generada${NC}"
echo ""

# Establecer permisos seguros
echo -e "${YELLOW}Estableciendo permisos seguros...${NC}"
chmod 600 "${OUTPUT_DIR}/stp-private.jks"
chmod 600 "${OUTPUT_DIR}/stp-private.p12"
chmod 600 "${OUTPUT_DIR}/stp-private.pem"
chmod 644 "${OUTPUT_DIR}/stp-public.cer"

echo -e "${GREEN}✓ Permisos configurados${NC}"
echo ""

# Resumen
echo -e "${GREEN}=== ✓ Llaves generadas exitosamente ===${NC}"
echo ""
echo "Archivos generados:"
echo "  - ${OUTPUT_DIR}/stp-private.jks   (Llave privada JKS)"
echo "  - ${OUTPUT_DIR}/stp-private.p12   (Llave privada P12)"
echo "  - ${OUTPUT_DIR}/stp-private.pem   (Llave privada PEM - para Node.js)"
echo "  - ${OUTPUT_DIR}/stp-public.cer    (Llave pública - enviar a STP)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "  1. ❌ NO subir las llaves privadas (.jks, .p12, .pem) a Git"
echo "  2. ✅ Compartir SOLO stp-public.cer con STP vía Password Pusher"
echo "  3. ✅ Guardar la contraseña en un gestor de secretos"
echo "  4. ✅ Añadir estos valores a tu .env.${ENVIRONMENT}:"
echo ""
echo "SPEI_STP_PRIVATE_KEY_PATH=./${OUTPUT_DIR}/stp-private.pem"
echo "SPEI_STP_KEY_ALIAS=${ALIAS}"
echo "SPEI_STP_KEY_PASSPHRASE=${PASSWORD}"
echo ""
echo -e "${GREEN}Validez de las llaves: ${VALIDITY_DAYS} días ($(date -d "+${VALIDITY_DAYS} days" +%Y-%m-%d))${NC}"
echo ""
echo -e "${YELLOW}Siguiente paso: Enviar ${OUTPUT_DIR}/stp-public.cer a STP${NC}"
echo ""
