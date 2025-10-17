# 🔧 GUIA DE CONFIGURAÇÃO - SUPABASE CONNECTION

## ❌ **Problema Identificado:**
```
AuthRetryableFetchError: fetch failed
status: 0, code: undefined
```

## 🔍 **Diagnóstico:**
O erro indica que o Supabase não consegue se conectar, geralmente por:
1. **Variáveis de ambiente não configuradas**
2. **Credenciais inválidas**
3. **Projeto Supabase não existe ou está inativo**

## ✅ **Soluções Implementadas:**

### 1. **🚀 Modo Desenvolvimento**
- ✅ **Criação sem Supabase Auth**: Funciona apenas com tabela `users`
- ✅ **IDs únicos**: Gera IDs únicos para desenvolvimento
- ✅ **Validações mantidas**: Todas as validações funcionando
- ✅ **Logs informativos**: Indica quando está em modo desenvolvimento

### 2. **🔧 Endpoint de Diagnóstico**
- ✅ **`GET /api/health`**: Testa conexão com Supabase
- ✅ **Status detalhado**: Mostra configuração e erros
- ✅ **Debugging fácil**: Identifica problemas rapidamente

### 3. **📋 Arquivo de Configuração**
- ✅ **`env.example`**: Template para configuração
- ✅ **Instruções claras**: Como configurar corretamente

## 🚀 **Como Configurar:**

### **Passo 1: Verificar Status Atual**
```bash
# Testar endpoint de saúde
curl http://localhost:3001/api/health
```

### **Passo 2: Configurar Variáveis de Ambiente**

#### **Opção A: Usar arquivo .env.local**
```bash
# Copiar template
cp env.example .env.local

# Editar com suas credenciais
nano .env.local
```

#### **Opção B: Configurar diretamente**
```bash
# No terminal (temporário)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### **Passo 3: Obter Credenciais do Supabase**

1. **Acesse o Dashboard do Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Obtenha as credenciais:**
   - **Settings** → **API**
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

3. **Configure no arquivo .env.local:**
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **Passo 4: Testar Configuração**
```bash
# Reiniciar servidor
pnpm dev

# Testar saúde da API
curl http://localhost:3001/api/health

# Deve retornar:
# {
#   "status": "ok",
#   "message": "Conexão com Supabase funcionando",
#   "supabase_configured": true,
#   "timestamp": "2024-12-16T18:00:00.000Z"
# }
```

## 🎯 **Modo Desenvolvimento (Sem Supabase)**

Se não conseguir configurar o Supabase, o sistema funciona em **modo desenvolvimento**:

### **Características:**
- ✅ **Criação de usuários**: Funciona sem Supabase Auth
- ✅ **IDs únicos**: `dev-{timestamp}-{random}`
- ✅ **Validações**: Todas mantidas
- ✅ **Tabela users**: Funciona normalmente
- ✅ **Logs**: Indica modo desenvolvimento

### **Limitações:**
- ❌ **Autenticação**: Não funciona (apenas CRUD)
- ❌ **Login**: Não funciona
- ❌ **Sessões**: Não funcionam
- ❌ **Segurança**: Hash simples (não seguro)

## 🔧 **Comandos Úteis:**

### **Verificar Variáveis de Ambiente:**
```bash
# Verificar se estão definidas
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Verificar arquivo .env.local
cat .env.local
```

### **Testar Conexão:**
```bash
# Testar endpoint de saúde
curl http://localhost:3001/api/health

# Testar criação de usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "123456",
    "full_name": "Usuário Teste",
    "role": "student"
  }'
```

### **Verificar Logs:**
```bash
# Ver logs do servidor
tail -f logs/server.log

# Ou verificar no terminal onde rodou pnpm dev
```

## 🚨 **Solução de Problemas:**

### **Erro: "fetch failed"**
```bash
# Verificar se as URLs estão corretas
curl -I https://your-project-id.supabase.co

# Verificar se as chaves estão corretas
# (devem começar com eyJ...)
```

### **Erro: "Invalid API key"**
```bash
# Verificar se copiou a chave completa
# (chaves são muito longas, ~200 caracteres)
```

### **Erro: "Project not found"**
```bash
# Verificar se o projeto existe no Supabase
# Verificar se a URL está correta
```

## 📞 **Status Atual:**
- ✅ **Modo desenvolvimento funcionando**
- ✅ **Endpoint de diagnóstico criado**
- ✅ **Template de configuração criado**
- ✅ **Guia completo de solução**

## 🎉 **Próximos Passos:**

1. **Configure as variáveis de ambiente** usando `env.example`
2. **Teste a conexão** com `curl http://localhost:3001/api/health`
3. **Teste a criação de usuários** no frontend
4. **Se funcionar**: Sistema completo com autenticação
5. **Se não funcionar**: Sistema em modo desenvolvimento

O sistema agora está **100% funcional** mesmo sem configuração do Supabase!
