#!/bin/bash
# Script para iniciar los 3 microservicios en orden (Linux/macOS)

set -e

deco_ROOT="$(dirname "$(dirname "$0")")/.."
echo "📂 DECOX workspace: $deco_ROOT"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "\n${CYAN}🚀 Iniciando servicios...${NC}\n"

# Servicio 1: wallet-ledger-core
echo -e "${GREEN}▶️  Iniciando wallet-ledger-core (puerto 3003)...${NC}"
cd "$deco_ROOT/Exchange--micro-wallet-ledger-core"
gnome-terminal -- bash -c "cd '$PWD' && echo '🔧 wallet-ledger-core - Puerto 3003' && yarn start:dev; exec bash" 2>/dev/null || \
  osascript -e "tell app \"Terminal\" to do script \"cd '$PWD' && echo '🔧 wallet-ledger-core - Puerto 3003' && yarn start:dev\"" 2>/dev/null || \
  echo "⚠️  No se pudo abrir terminal automáticamente. Ejecuta manualmente: cd $PWD && yarn start:dev"
sleep 2

# Servicio 2: payments-core
echo -e "${BLUE}▶️  Iniciando payments-core (puerto 3002)...${NC}"
cd "$deco_ROOT/Exchange--micro-payments-core"
gnome-terminal -- bash -c "cd '$PWD' && echo '🔧 payments-core - Puerto 3002' && yarn start:dev; exec bash" 2>/dev/null || \
  osascript -e "tell app \"Terminal\" to do script \"cd '$PWD' && echo '🔧 payments-core - Puerto 3002' && yarn start:dev\"" 2>/dev/null || \
  echo "⚠️  No se pudo abrir terminal automáticamente. Ejecuta manualmente: cd $PWD && yarn start:dev"
sleep 2

# Servicio 3: custody-fiat
echo -e "${MAGENTA}▶️  Iniciando custody-fiat (puerto 3001)...${NC}"
cd "$deco_ROOT/Exchange--micro-custody-fiat"
gnome-terminal -- bash -c "cd '$PWD' && echo '🔧 custody-fiat - Puerto 3001' && yarn start:dev; exec bash" 2>/dev/null || \
  osascript -e "tell app \"Terminal\" to do script \"cd '$PWD' && echo '🔧 custody-fiat - Puerto 3001' && yarn start:dev\"" 2>/dev/null || \
  echo "⚠️  No se pudo abrir terminal automáticamente. Ejecuta manualmente: cd $PWD && yarn start:dev"

echo -e "\n${GREEN}✨ Todos los servicios iniciando!${NC}"
echo -e "\n${CYAN}📋 Servicios:${NC}"
echo -e "  ${GREEN}- wallet-ledger-core: http://localhost:3003${NC}"
echo -e "  ${BLUE}- payments-core: http://localhost:3002${NC}"
echo -e "  ${MAGENTA}- custody-fiat: http://localhost:3001${NC}"

echo -e "\n${CYAN}💡 Para ejecutar smoke tests:${NC}"
echo -e "   cd Exchange--micro-custody-fiat"
echo -e "   yarn test:smoke"
echo -e "   yarn test:webhooks"
