#!/bin/bash
# ========================================
# SAI - Sistema de Alerta Inteligente
# Atalho para abrir o sistema no navegador
# Duplo-clique neste arquivo para iniciar
# ========================================
URL="https://projeto-ao-vivo.preview.emergentagent.com"

echo ""
echo "  ================================================"
echo "   SAI - Sistema de Alerta Inteligente - SJBV"
echo "   Abrindo painel de Comando de Crise..."
echo "  ================================================"
echo ""

# Detecta o SO e abre o navegador padrão
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL"        # Linux
elif command -v open >/dev/null 2>&1; then
    open "$URL"            # macOS
elif command -v start >/dev/null 2>&1; then
    start "$URL"           # Git Bash no Windows
else
    echo "Nao foi possivel abrir o navegador automaticamente."
    echo "Acesse manualmente: $URL"
fi

sleep 2
