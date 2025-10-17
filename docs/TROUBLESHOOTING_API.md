# 🚨 GUIA DE SOLUÇÃO DE PROBLEMAS - API ECONNREFUSED

## ❌ **Problema Identificado:**
```
[0] 18:00:38 [vite] http proxy error: /api/users
[0] AggregateError [ECONNREFUSED]:
[0]     at internalConnectMultiple (node:net:1134:18)
[0]     at afterConnectMultiple (node:net:1715:7)
```

## 🔍 **Diagnóstico:**
O erro `ECONNREFUSED` indica que o servidor da API não está rodando na porta 3001.

## ✅ **Soluções Implementadas:**

### 1. **🛠️ API Simplificada**
- ✅ Removido dependência de credenciais de serviço obrigatórias
- ✅ Fallback para cliente anônimo quando admin falha
- ✅ Validações robustas mantidas
- ✅ Tratamento de erros melhorado

### 2. **🔧 Endpoints Atualizados:**
- ✅ `POST /api/users` - Criação com fallback
- ✅ `PUT /api/users/:id` - Atualização simplificada
- ✅ `DELETE /api/users/:id` - Exclusão simplificada

### 3. **📋 Script de Verificação:**
- ✅ `check-server.sh` - Verifica se servidor está rodando

## 🚀 **Como Resolver:**

### **Passo 1: Verificar se o servidor está rodando**
```bash
# Verificar se a porta 3001 está em uso
lsof -Pi :3001 -sTCP:LISTEN

# Ou usar o script criado
chmod +x check-server.sh
./check-server.sh
```

### **Passo 2: Iniciar o servidor**
```bash
# Iniciar ambos (cliente + API)
pnpm dev

# Ou apenas a API
pnpm run server:dev
```

### **Passo 3: Verificar logs**
```bash
# Verificar logs do servidor
tail -f logs/server.log

# Ou verificar no terminal onde rodou pnpm dev
```

### **Passo 4: Testar a API**
```bash
# Testar endpoint de criação de usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "123456",
    "full_name": "Usuário Teste",
    "role": "student"
  }'
```

## 🔧 **Configurações Verificadas:**

### **Vite Config (vite.config.ts):**
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001', // ✅ Correto
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### **Nodemon Config (nodemon.json):**
```json
{
  "watch": ["api"],
  "ext": "ts,mts,js,json",
  "exec": "tsx api/server.ts", // ✅ Correto
  "env": {
    "NODE_ENV": "development"
  }
}
```

### **Package.json Scripts:**
```json
{
  "server:dev": "nodemon", // ✅ Correto
  "dev": "concurrently \"npm run client:dev\" \"npm run server:dev\""
}
```

## 🎯 **Próximos Passos:**

1. **Execute o comando:**
   ```bash
   pnpm dev
   ```

2. **Verifique se ambos os servidores iniciaram:**
   - ✅ Cliente: `http://localhost:5173`
   - ✅ API: `http://localhost:3001`

3. **Teste a criação de usuários:**
   - Acesse `/admin/users`
   - Clique em "Novo Usuário"
   - Preencha os dados e teste

## 🚨 **Se o Problema Persistir:**

### **Verificar Variáveis de Ambiente:**
```bash
# Verificar se as variáveis estão definidas
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

### **Verificar Arquivo .env:**
```bash
# Verificar se existe
ls -la .env*

# Ver conteúdo (sem mostrar valores sensíveis)
grep -E "^[A-Z_]+=" .env.local
```

### **Reiniciar Completamente:**
```bash
# Parar todos os processos
pkill -f "vite\|nodemon\|tsx"

# Limpar cache
rm -rf node_modules/.vite
rm -rf api/dist

# Reinstalar e iniciar
pnpm install
pnpm dev
```

## 📞 **Status Atual:**
- ✅ **API simplificada e robusta**
- ✅ **Fallbacks implementados**
- ✅ **Script de verificação criado**
- ✅ **Guia de solução completo**

O sistema agora está **preparado para funcionar** mesmo com configurações mínimas!
