#!/bin/bash

# Script para verificar se o servidor da API está funcionando
echo "🔍 Verificando se o servidor da API está rodando..."

# Verificar se a porta 3001 está em uso
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Servidor está rodando na porta 3001"
    
    # Testar se a API responde
    echo "🧪 Testando endpoint da API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/auth/login -X POST -H "Content-Type: application/json" -d '{}')
    
    if [ "$response" = "400" ] || [ "$response" = "200" ]; then
        echo "✅ API está respondendo (código: $response)"
    else
        echo "❌ API não está respondendo corretamente (código: $response)"
    fi
else
    echo "❌ Servidor não está rodando na porta 3001"
    echo "💡 Execute: pnpm dev"
fi

echo ""
echo "📋 Para iniciar o servidor:"
echo "   pnpm dev"
echo ""
echo "📋 Para verificar logs:"
echo "   tail -f logs/server.log"
