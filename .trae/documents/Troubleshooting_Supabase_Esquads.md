# 🔧 Troubleshooting Guide - Supabase Integration
## Esquads Academy - Soluções para Problemas Comuns

**Data de Criação**: 2025-01-25  
**Versão**: 1.0  
**Sistema**: Windows 11  
**Projeto**: Esquads Academy  

---

## 🚨 1. PROBLEMAS MAIS COMUNS

### 1.1 AuthRetryableFetchError: fetch failed

**Sintomas:**
```
AuthRetryableFetchError: fetch failed
    at async _request (auth-helpers.js:123:12)
    at async signInWithPassword (GoTrueClient.js:456:12)
```

**Causas Possíveis:**
- URL do Supabase incorreta
- Chaves de API inválidas
- Problemas de conectividade
- Firewall bloqueando conexões

**Soluções:**

1. **Verificar Configuração:**
```powershell
# Verificar variáveis de ambiente
Get-Content .env.local | Select-String "SUPABASE"
```

2. **Testar Conectividade:**
```powershell
# Testar URL do Supabase
$url = "https://your-project.supabase.co"
Invoke-WebRequest -Uri "$url/rest/v1/" -Method HEAD
```

3. **Validar Chaves:**
```javascript
// Verificar formato das chaves
console.log('ANON KEY válida:', process.env.VITE_SUPABASE_ANON_KEY?.startsWith('eyJ'));
console.log('SERVICE KEY válida:', process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ'));
```

4. **Configurar Firewall:**
```powershell
# Permitir Node.js no firewall
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

### 1.2 RLS Policy Violation

**Sintomas:**
```
PostgrestError: new row violates row-level security policy
```

**Causas:**
- Políticas RLS muito restritivas
- Usuário não autenticado
- Permissões insuficientes

**Soluções:**

1. **Verificar Autenticação:**
```javascript
// Verificar se usuário está autenticado
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuário autenticado:', !!user);
```

2. **Revisar Políticas RLS:**
```sql
-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

3. **Política Temporária para Debug:**
```sql
-- APENAS PARA DEBUG - REMOVER EM PRODUÇÃO
CREATE POLICY "debug_policy" ON users FOR ALL USING (true);
```

### 1.3 Migration Failed

**Sintomas:**
```
Error: relation "table_name" already exists
Error: column "column_name" already exists
```

**Soluções:**

1. **Verificar Estado do Banco:**
```sql
-- Listar tabelas existentes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. **Aplicar Migração Condicional:**
```sql
-- Criar tabela apenas se não existir
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL
);
```

3. **Reset de Migração (CUIDADO!):**
```powershell
# Backup antes do reset
.\backup-database.ps1

# Reset das migrações
npx supabase db reset
```

### 1.4 Environment Variables Not Found

**Sintomas:**
```
Error: VITE_SUPABASE_URL is not defined
Error: VITE_SUPABASE_ANON_KEY is not defined
```

**Soluções:**

1. **Verificar Arquivo .env.local:**
```powershell
# Verificar se arquivo existe
Test-Path .env.local

# Verificar conteúdo
Get-Content .env.local
```

2. **Recriar Arquivo de Ambiente:**
```powershell
# Usar script de setup
.\setup-esquads-supabase.ps1 -SupabaseUrl "..." -SupabaseAnonKey "..." -SupabaseServiceKey "..."
```

3. **Verificar Carregamento no Vite:**
```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('SUPABASE_URL:', env.VITE_SUPABASE_URL ? 'Definida' : 'Não definida');
  
  return {
    // configuração...
  };
});
```

---

## 🔍 2. DIAGNÓSTICO AVANÇADO

### 2.1 Script de Diagnóstico Completo

```powershell
# diagnose-advanced.ps1
Write-Host "🔍 Diagnóstico Avançado - Esquads Academy" -ForegroundColor Green

# Verificar Node.js e npm
Write-Host "`n📦 VERIFICANDO DEPENDÊNCIAS:" -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado" -ForegroundColor Red
}

# Verificar arquivos de configuração
Write-Host "`n📁 VERIFICANDO ARQUIVOS:" -ForegroundColor Cyan
$files = @(".env.local", "package.json", "vite.config.js", "supabase/config.toml")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

# Verificar conectividade de rede
Write-Host "`n🌐 VERIFICANDO CONECTIVIDADE:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://supabase.com" -Method HEAD -TimeoutSec 5
    Write-Host "✅ Conectividade com Supabase.com: OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Conectividade com Supabase.com: Falha" -ForegroundColor Red
}

# Verificar portas
Write-Host "`n🔌 VERIFICANDO PORTAS:" -ForegroundColor Cyan
$ports = @(3001, 5173, 54321, 54322, 54323)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ Porta $port: Aberta" -ForegroundColor Green
    } else {
        Write-Host "⚪ Porta $port: Fechada" -ForegroundColor Yellow
    }
}

# Verificar processos Node.js
Write-Host "`n⚙️ VERIFICANDO PROCESSOS:" -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✅ Processos Node.js ativos: $($nodeProcesses.Count)" -ForegroundColor Green
    $nodeProcesses | ForEach-Object { 
        Write-Host "  PID: $($_.Id) | CPU: $($_.CPU)" -ForegroundColor Yellow 
    }
} else {
    Write-Host "⚪ Nenhum processo Node.js ativo" -ForegroundColor Yellow
}
```

### 2.2 Teste de Conectividade Detalhado

```javascript
// test-connectivity-detailed.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function detailedConnectivityTest() {
    console.log('🔍 Teste Detalhado de Conectividade\n');

    // Verificar variáveis de ambiente
    console.log('📋 Variáveis de Ambiente:');
    console.log(`  VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? '✅ Definida' : '❌ Não definida'}`);
    console.log(`  VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida'}`);
    console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida'}\n`);

    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
        console.log('❌ Variáveis de ambiente não configuradas');
        return;
    }

    // Teste de conectividade básica
    console.log('🌐 Teste de Conectividade Básica:');
    try {
        const response = await fetch(process.env.VITE_SUPABASE_URL + '/rest/v1/', {
            method: 'HEAD',
            headers: {
                'apikey': process.env.VITE_SUPABASE_ANON_KEY
            }
        });
        console.log(`  Status: ${response.status} ${response.statusText}`);
        console.log(`  Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);
    } catch (error) {
        console.log(`  ❌ Erro: ${error.message}`);
    }

    // Teste do cliente Supabase
    console.log('\n🔧 Teste do Cliente Supabase:');
    try {
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_ANON_KEY
        );

        // Teste de query simples
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (error) {
            console.log(`  ❌ Erro na query: ${error.message}`);
            console.log(`  Código: ${error.code}`);
            console.log(`  Detalhes: ${error.details}`);
        } else {
            console.log('  ✅ Query executada com sucesso');
        }

    } catch (error) {
        console.log(`  ❌ Erro no cliente: ${error.message}`);
    }

    // Teste de autenticação
    console.log('\n🔐 Teste de Autenticação:');
    try {
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.log(`  ❌ Erro na sessão: ${error.message}`);
        } else {
            console.log(`  ✅ Sessão: ${data.session ? 'Ativa' : 'Inativa'}`);
        }

    } catch (error) {
        console.log(`  ❌ Erro na autenticação: ${error.message}`);
    }

    // Teste de latência
    console.log('\n⚡ Teste de Latência:');
    const latencyTests = [];
    for (let i = 0; i < 5; i++) {
        const start = Date.now();
        try {
            await fetch(process.env.VITE_SUPABASE_URL + '/rest/v1/', {
                method: 'HEAD',
                headers: { 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
            });
            const latency = Date.now() - start;
            latencyTests.push(latency);
            console.log(`  Teste ${i + 1}: ${latency}ms`);
        } catch (error) {
            console.log(`  Teste ${i + 1}: Falha`);
        }
    }

    if (latencyTests.length > 0) {
        const avgLatency = latencyTests.reduce((a, b) => a + b, 0) / latencyTests.length;
        console.log(`  📊 Latência média: ${avgLatency.toFixed(2)}ms`);
    }
}

detailedConnectivityTest().catch(console.error);
```

---

## 🛠️ 3. SOLUÇÕES ESPECÍFICAS

### 3.1 Problemas de Autenticação

**Problema: Usuário não consegue fazer login**

```javascript
// debug-auth.js
async function debugAuth() {
    const supabase = createClient(url, key);
    
    // Verificar configuração de auth
    console.log('Auth settings:', supabase.auth.settings);
    
    // Tentar login com debug
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
    });
    
    if (error) {
        console.log('Auth error details:', {
            message: error.message,
            status: error.status,
            statusCode: error.statusCode
        });
    }
}
```

**Solução para erro "Invalid login credentials":**

1. Verificar se o usuário existe:
```sql
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'user@example.com';
```

2. Resetar senha:
```javascript
const { error } = await supabase.auth.resetPasswordForEmail('user@example.com');
```

### 3.2 Problemas de Performance

**Problema: Queries lentas**

1. **Adicionar índices:**
```sql
-- Índices para tabelas principais
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
```

2. **Otimizar queries:**
```javascript
// ❌ Query ineficiente
const { data } = await supabase
    .from('users')
    .select('*, missions(*), achievements(*)');

// ✅ Query otimizada
const { data } = await supabase
    .from('users')
    .select(`
        id, email, full_name,
        missions!inner(id, title, status),
        achievements!inner(id, name, earned_at)
    `)
    .limit(50);
```

### 3.3 Problemas de RLS

**Problema: RLS muito restritivo**

1. **Debug de políticas:**
```sql
-- Verificar políticas ativas
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Verificar contexto de autenticação
SELECT auth.uid(), auth.role();
```

2. **Política de debug temporária:**
```sql
-- APENAS PARA DEBUG
CREATE POLICY "debug_all_access" ON users 
FOR ALL USING (true) WITH CHECK (true);

-- REMOVER APÓS DEBUG
DROP POLICY "debug_all_access" ON users;
```

### 3.4 Problemas de CORS

**Problema: CORS errors no frontend**

1. **Configurar CORS no Supabase:**
```sql
-- Verificar configuração CORS
SELECT * FROM pg_settings WHERE name LIKE '%cors%';
```

2. **Configurar no Vite:**
```javascript
// vite.config.js
export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: process.env.VITE_SUPABASE_URL,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});
```

---

## 📋 4. FAQ - PERGUNTAS FREQUENTES

### Q1: Como verificar se o Supabase está funcionando?

**R:** Execute o script de diagnóstico:
```powershell
.\validate-environment.ps1
.\test-esquads-integration.ps1
```

### Q2: Posso usar o projeto sem Supabase?

**R:** Sim, o projeto tem um modo de desenvolvimento que funciona sem Supabase. Configure `NODE_ENV=development` no `.env.local`.

### Q3: Como fazer backup dos dados?

**R:** Use o script de backup:
```powershell
.\backup-database.ps1
```

### Q4: Como resetar completamente o ambiente?

**R:** Use o script de reset (CUIDADO!):
```powershell
.\reset-esquads.ps1 -Confirm
```

### Q5: Como aplicar apenas uma migração específica?

**R:** Use o Supabase CLI:
```powershell
npx supabase db push --file "supabase/migrations/specific_migration.sql"
```

### Q6: Como verificar logs de erro?

**R:** Verifique os logs do navegador e do servidor:
```powershell
# Logs do servidor (se existirem)
Get-Content logs/*.log | Select-String "ERROR"

# No navegador: F12 > Console
```

### Q7: Como configurar variáveis de ambiente para produção?

**R:** Crie um arquivo `.env.production`:
```bash
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
NODE_ENV=production
```

### Q8: Como monitorar performance?

**R:** Use o script de monitoramento:
```powershell
.\monitor-performance.ps1
```

---

## 🚨 5. PROBLEMAS CRÍTICOS E SOLUÇÕES

### 5.1 Banco de Dados Corrompido

**Sintomas:**
- Erros de integridade referencial
- Tabelas inacessíveis
- Dados inconsistentes

**Solução:**
```powershell
# 1. Backup imediato
.\backup-database.ps1

# 2. Verificar integridade
.\cleanup-database.ps1

# 3. Se necessário, reset completo
.\reset-esquads.ps1 -Confirm
.\apply-migrations.ps1
```

### 5.2 Chaves de API Comprometidas

**Sintomas:**
- Acessos não autorizados
- Uso excessivo de recursos
- Alertas de segurança

**Solução:**
1. **Revogar chaves no Supabase Dashboard**
2. **Gerar novas chaves**
3. **Atualizar configuração:**
```powershell
.\setup-esquads-supabase.ps1 -SupabaseUrl "..." -SupabaseAnonKey "NEW_KEY" -SupabaseServiceKey "NEW_SERVICE_KEY"
```

### 5.3 Falha Total de Conectividade

**Sintomas:**
- Nenhuma conexão com Supabase
- Timeouts constantes
- Erros de rede

**Diagnóstico:**
```powershell
# Verificar conectividade de rede
Test-NetConnection supabase.com -Port 443

# Verificar DNS
nslookup your-project.supabase.co

# Verificar firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Node*"}
```

**Solução:**
1. **Verificar status do Supabase:** https://status.supabase.com
2. **Configurar proxy se necessário**
3. **Verificar configurações de firewall corporativo**

---

## 📞 6. SUPORTE E RECURSOS

### 6.1 Logs e Debugging

**Habilitar logs detalhados:**
```javascript
// No cliente Supabase
const supabase = createClient(url, key, {
    auth: {
        debug: true
    }
});

// Logs customizados
console.log('Supabase client initialized:', {
    url: process.env.VITE_SUPABASE_URL,
    hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    timestamp: new Date().toISOString()
});
```

### 6.2 Recursos Úteis

- **Documentação Supabase:** https://supabase.com/docs
- **Status do Serviço:** https://status.supabase.com
- **Comunidade:** https://github.com/supabase/supabase/discussions
- **Discord:** https://discord.supabase.com

### 6.3 Comandos de Emergência

```powershell
# Parar todos os processos Node.js
Get-Process -Name "node" | Stop-Process -Force

# Limpar cache npm
npm cache clean --force

# Reinstalar dependências
Remove-Item node_modules -Recurse -Force
npm install

# Reset completo do projeto
git clean -fdx
git reset --hard HEAD
npm install
```

---

## ✅ 7. CHECKLIST DE RESOLUÇÃO

### Antes de Reportar um Problema:

- [ ] Executei `.\validate-environment.ps1`
- [ ] Verifiquei os logs de erro
- [ ] Testei com `.\test-esquads-integration.ps1`
- [ ] Verifiquei a conectividade de rede
- [ ] Consultei este guia de troubleshooting
- [ ] Tentei reiniciar o servidor de desenvolvimento

### Informações para Suporte:

- [ ] Versão do Node.js: `node --version`
- [ ] Versão do npm: `npm --version`
- [ ] Sistema operacional e versão
- [ ] Mensagem de erro completa
- [ ] Passos para reproduzir o problema
- [ ] Logs relevantes
- [ ] Configuração do ambiente (sem chaves sensíveis)

---

**Status**: ✅ Guia Completo de Troubleshooting  
**Última Atualização**: 2025-01-25  
**Compatibilidade**: Windows 10/11, Esquads Academy v2+  
**Suporte**: Consulte a documentação em `docs/` para mais informações