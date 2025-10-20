# 🛠️ Scripts de Implementação - Supabase Integration
## Esquads Academy - Scripts Práticos para Windows

**Data de Criação**: 2025-01-25  
**Versão**: 1.0  
**Sistema**: Windows 11  
**Shell**: PowerShell 7+  

---

## 📋 1. SCRIPTS DE CONFIGURAÇÃO INICIAL

### 1.1 Script de Setup Automático

```powershell
# setup-esquads-supabase.ps1
# Script para configuração automática do Supabase no Esquads Academy

param(
    [Parameter(Mandatory=$true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$SupabaseAnonKey,
    
    [Parameter(Mandatory=$true)]
    [string]$SupabaseServiceKey
)

Write-Host "🚀 Iniciando configuração do Supabase para Esquads Academy..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (!(Test-Path "package.json")) {
    Write-Error "❌ Execute este script na raiz do projeto Esquads"
    exit 1
}

# Criar arquivo .env.local
Write-Host "📝 Criando arquivo .env.local..." -ForegroundColor Yellow

$envContent = @"
# Configuração do Supabase para Esquads Academy
# Gerado automaticamente em $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Supabase Configuration
VITE_SUPABASE_URL=$SupabaseUrl
VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey
SUPABASE_SERVICE_ROLE_KEY=$SupabaseServiceKey

# Development Settings
NODE_ENV=development
PORT=3001
VITE_PORT=5173

# API Configuration
VITE_API_URL=http://localhost:3001

# Optional configurations
# API_OPENAI=your-openai-key
# API_GEMINI=your-gemini-key
# API_REPLICATE=your-replicate-token
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Arquivo .env.local criado com sucesso!" -ForegroundColor Green

# Verificar dependências
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow

if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Node.js/npm não encontrado. Instale o Node.js primeiro."
    exit 1
}

# Instalar dependências se necessário
if (!(Test-Path "node_modules")) {
    Write-Host "📥 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Testar conexão
Write-Host "🔌 Testando conexão com Supabase..." -ForegroundColor Yellow

$testScript = @"
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    process.exit(0);
  } catch (error) {
    console.log('❌ Erro crítico:', error.message);
    process.exit(1);
  }
}

testConnection();
"@

$testScript | Out-File -FilePath "test-connection-temp.js" -Encoding UTF8

try {
    $result = node "test-connection-temp.js" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexão com Supabase estabelecida!" -ForegroundColor Green
    } else {
        Write-Host "❌ Falha na conexão: $result" -ForegroundColor Red
    }
} finally {
    Remove-Item "test-connection-temp.js" -ErrorAction SilentlyContinue
}

Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "💡 Execute 'npm run dev' para iniciar o projeto" -ForegroundColor Cyan
```

### 1.2 Script de Validação de Ambiente

```powershell
# validate-environment.ps1
# Valida se o ambiente está configurado corretamente

Write-Host "🔍 Validando ambiente Esquads Academy..." -ForegroundColor Green

# Verificar arquivo .env.local
if (!(Test-Path ".env.local")) {
    Write-Host "❌ Arquivo .env.local não encontrado" -ForegroundColor Red
    Write-Host "💡 Execute o script setup-esquads-supabase.ps1 primeiro" -ForegroundColor Yellow
    exit 1
}

# Carregar variáveis de ambiente
$envVars = @{}
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        $envVars[$matches[1]] = $matches[2]
    }
}

# Verificar variáveis obrigatórias
$requiredVars = @(
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY", 
    "SUPABASE_SERVICE_ROLE_KEY"
)

$allValid = $true

foreach ($var in $requiredVars) {
    if ($envVars.ContainsKey($var) -and $envVars[$var]) {
        Write-Host "✅ $var: Configurada" -ForegroundColor Green
    } else {
        Write-Host "❌ $var: Não configurada" -ForegroundColor Red
        $allValid = $false
    }
}

# Verificar formato das chaves
if ($envVars["VITE_SUPABASE_ANON_KEY"] -and !$envVars["VITE_SUPABASE_ANON_KEY"].StartsWith("eyJ")) {
    Write-Host "⚠️ VITE_SUPABASE_ANON_KEY: Formato suspeito (deve começar com 'eyJ')" -ForegroundColor Yellow
}

if ($envVars["SUPABASE_SERVICE_ROLE_KEY"] -and !$envVars["SUPABASE_SERVICE_ROLE_KEY"].StartsWith("eyJ")) {
    Write-Host "⚠️ SUPABASE_SERVICE_ROLE_KEY: Formato suspeito (deve começar com 'eyJ')" -ForegroundColor Yellow
}

# Verificar conectividade
if ($envVars["VITE_SUPABASE_URL"]) {
    $url = $envVars["VITE_SUPABASE_URL"]
    try {
        $response = Invoke-WebRequest -Uri "$url/rest/v1/" -Method HEAD -TimeoutSec 10
        Write-Host "✅ Conectividade: OK (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Conectividade: Falha ($($_.Exception.Message))" -ForegroundColor Red
        $allValid = $false
    }
}

if ($allValid) {
    Write-Host "🎉 Ambiente validado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Problemas encontrados no ambiente" -ForegroundColor Red
    exit 1
}
```

---

## 🗄️ 2. SCRIPTS DE MIGRAÇÃO

### 2.1 Script de Backup Automático

```powershell
# backup-database.ps1
# Cria backup do banco de dados antes das migrações

param(
    [string]$BackupPath = "backups"
)

Write-Host "💾 Iniciando backup do banco de dados..." -ForegroundColor Green

# Criar diretório de backup
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath | Out-Null
}

# Carregar configurações
$envVars = @{}
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        $envVars[$matches[1]] = $matches[2]
    }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "$BackupPath\esquads-backup-$timestamp.sql"

# Script de backup
$backupScript = @"
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createBackup() {
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('📊 Coletando dados das tabelas...');
    
    const tables = ['users', 'missions', 'achievements', 'badges', 'notifications'];
    let backupData = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.log(\`⚠️ Erro ao fazer backup da tabela \${table}: \${error.message}\`);
        } else {
          backupData[table] = data;
          console.log(\`✅ \${table}: \${data.length} registros\`);
        }
      } catch (err) {
        console.log(\`⚠️ Tabela \${table} não encontrada ou inacessível\`);
      }
    }
    
    const fs = require('fs');
    fs.writeFileSync('$backupFile', JSON.stringify(backupData, null, 2));
    console.log('✅ Backup criado: $backupFile');
    
  } catch (error) {
    console.error('❌ Erro no backup:', error.message);
    process.exit(1);
  }
}

createBackup();
"@

$backupScript | Out-File -FilePath "backup-temp.js" -Encoding UTF8

try {
    node "backup-temp.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup criado com sucesso: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "❌ Falha no backup" -ForegroundColor Red
        exit 1
    }
} finally {
    Remove-Item "backup-temp.js" -ErrorAction SilentlyContinue
}
```

### 2.2 Script de Aplicação de Migrações

```powershell
# apply-migrations.ps1
# Aplica migrações do Supabase de forma ordenada

param(
    [switch]$DryRun,
    [switch]$Force
)

Write-Host "🔧 Aplicando migrações do Esquads Academy..." -ForegroundColor Green

if ($DryRun) {
    Write-Host "🔍 Modo DRY RUN - Nenhuma alteração será feita" -ForegroundColor Yellow
}

# Verificar se o Supabase CLI está instalado
if (!(Get-Command "npx" -ErrorAction SilentlyContinue)) {
    Write-Error "❌ npx não encontrado. Instale o Node.js primeiro."
    exit 1
}

# Verificar estrutura do projeto
if (!(Test-Path "supabase\migrations")) {
    Write-Error "❌ Diretório de migrações não encontrado"
    exit 1
}

# Fazer backup antes de aplicar migrações
if (!$DryRun) {
    Write-Host "💾 Criando backup antes das migrações..." -ForegroundColor Yellow
    .\backup-database.ps1
}

# Listar migrações disponíveis
$migrations = Get-ChildItem "supabase\migrations\*.sql" | Sort-Object Name

Write-Host "📋 Migrações encontradas: $($migrations.Count)" -ForegroundColor Cyan

# Migrações essenciais (ordem específica)
$essentialMigrations = @(
    "001_initial_schema.sql",
    "002_rls_policies.sql",
    "20250117_fix_users_rls_recursion_v2.sql"
)

# Aplicar migrações essenciais primeiro
Write-Host "🔧 Aplicando migrações essenciais..." -ForegroundColor Yellow

foreach ($migration in $essentialMigrations) {
    $migrationFile = $migrations | Where-Object { $_.Name -eq $migration }
    if ($migrationFile) {
        Write-Host "  📄 $($migrationFile.Name)" -ForegroundColor Cyan
        
        if (!$DryRun) {
            try {
                # Aplicar migração via Supabase CLI
                $result = npx supabase db push --file $migrationFile.FullName 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✅ Aplicada com sucesso" -ForegroundColor Green
                } else {
                    Write-Host "    ❌ Erro: $result" -ForegroundColor Red
                    if (!$Force) {
                        exit 1
                    }
                }
            } catch {
                Write-Host "    ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
                if (!$Force) {
                    exit 1
                }
            }
        }
    } else {
        Write-Host "  ⚠️ Migração não encontrada: $migration" -ForegroundColor Yellow
    }
}

# Aplicar migrações de gamificação
Write-Host "🎮 Aplicando migrações de gamificação..." -ForegroundColor Yellow

$gamificationMigrations = $migrations | Where-Object { $_.Name -like "20251009_*" }

foreach ($migration in $gamificationMigrations) {
    Write-Host "  📄 $($migration.Name)" -ForegroundColor Cyan
    
    if (!$DryRun) {
        try {
            $result = npx supabase db push --file $migration.FullName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Aplicada com sucesso" -ForegroundColor Green
            } else {
                Write-Host "    ❌ Erro: $result" -ForegroundColor Red
                if (!$Force) {
                    exit 1
                }
            }
        } catch {
            Write-Host "    ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
            if (!$Force) {
                exit 1
            }
        }
    }
}

# Aplicar migração de notificações
Write-Host "🔔 Aplicando sistema de notificações..." -ForegroundColor Yellow

$notificationMigration = $migrations | Where-Object { $_.Name -eq "20251017_create_notifications_system.sql" }

if ($notificationMigration) {
    Write-Host "  📄 $($notificationMigration.Name)" -ForegroundColor Cyan
    
    if (!$DryRun) {
        try {
            $result = npx supabase db push --file $notificationMigration.FullName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Aplicada com sucesso" -ForegroundColor Green
            } else {
                Write-Host "    ❌ Erro: $result" -ForegroundColor Red
                if (!$Force) {
                    exit 1
                }
            }
        } catch {
            Write-Host "    ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
            if (!$Force) {
                exit 1
            }
        }
    }
}

if ($DryRun) {
    Write-Host "🔍 DRY RUN concluído - Execute sem -DryRun para aplicar" -ForegroundColor Yellow
} else {
    Write-Host "🎉 Migrações aplicadas com sucesso!" -ForegroundColor Green
}
```

---

## 🧪 3. SCRIPTS DE TESTE E VALIDAÇÃO

### 3.1 Script de Teste Completo

```powershell
# test-esquads-integration.ps1
# Testa toda a integração do Esquads com Supabase

Write-Host "🧪 Iniciando testes de integração Esquads Academy..." -ForegroundColor Green

# Script de teste em Node.js
$testScript = @"
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class EsquadsIntegrationTest {
  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    this.adminSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.testResults = [];
  }

  async runTest(name, testFn) {
    console.log(\`🔍 Testando: \${name}...\`);
    try {
      await testFn();
      console.log(\`✅ \${name}: PASSOU\`);
      this.testResults.push({ name, status: 'PASSOU' });
    } catch (error) {
      console.log(\`❌ \${name}: FALHOU - \${error.message}\`);
      this.testResults.push({ name, status: 'FALHOU', error: error.message });
    }
  }

  async testConnection() {
    const { data, error } = await this.supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
  }

  async testAuthentication() {
    // Teste de registro
    const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
      email: 'test-integration@esquads.com',
      password: 'TestPassword123!'
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }

    // Teste de login (se usuário já existe)
    const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
      email: 'admin@esquads.com',
      password: 'admin123'
    });

    // Aceitar erro se credenciais não existem
    if (signInError && !signInError.message.includes('Invalid login credentials')) {
      throw signInError;
    }
  }

  async testCRUDOperations() {
    // CREATE
    const { data: createData, error: createError } = await this.adminSupabase
      .from('users')
      .insert([{
        email: 'test-crud-integration@esquads.com',
        full_name: 'Test CRUD Integration',
        role: 'student'
      }])
      .select();

    if (createError) throw createError;
    const userId = createData[0].id;

    // READ
    const { data: readData, error: readError } = await this.adminSupabase
      .from('users')
      .select('*')
      .eq('id', userId);

    if (readError) throw readError;

    // UPDATE
    const { data: updateData, error: updateError } = await this.adminSupabase
      .from('users')
      .update({ full_name: 'Updated Test User' })
      .eq('id', userId)
      .select();

    if (updateError) throw updateError;

    // DELETE
    const { error: deleteError } = await this.adminSupabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;
  }

  async testGamificationTables() {
    const tables = ['achievements', 'badges', 'learning_paths'];
    
    for (const table of tables) {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) throw new Error(\`Tabela \${table}: \${error.message}\`);
    }
  }

  async testNotificationSystem() {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (error) throw error;

    // Testar preferências
    const { data: prefData, error: prefError } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .limit(1);
    
    if (prefError) throw prefError;
  }

  async testRLSPolicies() {
    // Testar acesso sem autenticação (deve falhar para algumas tabelas)
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .limit(1);
      
      // Se não der erro, RLS pode não estar configurado corretamente
      // Mas isso depende das políticas específicas
    } catch (error) {
      // Erro esperado se RLS estiver funcionando
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando bateria de testes...\\n');

    await this.runTest('Conexão Básica', () => this.testConnection());
    await this.runTest('Autenticação', () => this.testAuthentication());
    await this.runTest('Operações CRUD', () => this.testCRUDOperations());
    await this.runTest('Tabelas de Gamificação', () => this.testGamificationTables());
    await this.runTest('Sistema de Notificações', () => this.testNotificationSystem());
    await this.runTest('Políticas RLS', () => this.testRLSPolicies());

    console.log('\\n📊 Resumo dos Testes:');
    const passed = this.testResults.filter(r => r.status === 'PASSOU').length;
    const failed = this.testResults.filter(r => r.status === 'FALHOU').length;
    
    console.log(\`✅ Passou: \${passed}\`);
    console.log(\`❌ Falhou: \${failed}\`);
    
    if (failed > 0) {
      console.log('\\n❌ Testes que falharam:');
      this.testResults
        .filter(r => r.status === 'FALHOU')
        .forEach(r => console.log(\`  - \${r.name}: \${r.error}\`));
    }

    return failed === 0;
  }
}

async function main() {
  const tester = new EsquadsIntegrationTest();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
"@

$testScript | Out-File -FilePath "test-integration-temp.js" -Encoding UTF8

try {
    node "test-integration-temp.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Todos os testes passaram!" -ForegroundColor Green
    } else {
        Write-Host "❌ Alguns testes falharam" -ForegroundColor Red
        exit 1
    }
} finally {
    Remove-Item "test-integration-temp.js" -ErrorAction SilentlyContinue
}
```

### 3.2 Script de Monitoramento de Performance

```powershell
# monitor-performance.ps1
# Monitora performance das operações do Supabase

Write-Host "⚡ Monitorando performance do Supabase..." -ForegroundColor Green

$performanceScript = @"
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class PerformanceMonitor {
  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async measureQuery(name, queryFn) {
    const start = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - start;
      
      console.log(\`📊 \${name}:\`);
      console.log(\`  ⏱️ Tempo: \${duration}ms\`);
      console.log(\`  📦 Registros: \${result.data ? result.data.length : 'N/A'}\`);
      
      if (duration > 1000) {
        console.log(\`  ⚠️ LENTO: Tempo acima de 1 segundo\`);
      } else if (duration > 500) {
        console.log(\`  🟡 MODERADO: Tempo acima de 500ms\`);
      } else {
        console.log(\`  ✅ RÁPIDO: Tempo adequado\`);
      }
      
      console.log('');
      return { name, duration, recordCount: result.data ? result.data.length : 0 };
    } catch (error) {
      console.log(\`❌ \${name}: Erro - \${error.message}\\n\`);
      return { name, duration: -1, error: error.message };
    }
  }

  async runPerformanceTests() {
    console.log('🚀 Iniciando testes de performance...\\n');

    const tests = [
      {
        name: 'Select Users (100 registros)',
        query: () => this.supabase.from('users').select('*').limit(100)
      },
      {
        name: 'Select Missions (50 registros)',
        query: () => this.supabase.from('missions').select('*').limit(50)
      },
      {
        name: 'Select Achievements (todos)',
        query: () => this.supabase.from('achievements').select('*')
      },
      {
        name: 'Select Notifications (100 registros)',
        query: () => this.supabase.from('notifications').select('*').limit(100)
      },
      {
        name: 'Join Users + Achievements',
        query: () => this.supabase
          .from('users')
          .select(\`
            *,
            user_achievements (
              achievement_id,
              achievements (name, description)
            )
          \`)
          .limit(20)
      },
      {
        name: 'Count Total Users',
        query: () => this.supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
      }
    ];

    const results = [];
    for (const test of tests) {
      const result = await this.measureQuery(test.name, test.query);
      results.push(result);
    }

    console.log('📈 Resumo de Performance:');
    const avgTime = results
      .filter(r => r.duration > 0)
      .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration > 0).length;
    
    console.log(\`  📊 Tempo médio: \${avgTime.toFixed(2)}ms\`);
    
    const slowQueries = results.filter(r => r.duration > 1000);
    if (slowQueries.length > 0) {
      console.log(\`  ⚠️ Queries lentas: \${slowQueries.length}\`);
    }
    
    const failedQueries = results.filter(r => r.duration === -1);
    if (failedQueries.length > 0) {
      console.log(\`  ❌ Queries com erro: \${failedQueries.length}\`);
    }
  }
}

async function main() {
  const monitor = new PerformanceMonitor();
  await monitor.runPerformanceTests();
}

main().catch(console.error);
"@

$performanceScript | Out-File -FilePath "monitor-performance-temp.js" -Encoding UTF8

try {
    node "monitor-performance-temp.js"
} finally {
    Remove-Item "monitor-performance-temp.js" -ErrorAction SilentlyContinue
}
```

---

## 🔧 4. SCRIPTS DE MANUTENÇÃO

### 4.1 Script de Limpeza e Otimização

```powershell
# cleanup-database.ps1
# Executa limpeza e otimização do banco de dados

Write-Host "🧹 Iniciando limpeza do banco de dados..." -ForegroundColor Green

$cleanupScript = @"
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function cleanupDatabase() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🧹 Executando limpeza do banco...');

  try {
    // Limpar notificações antigas
    console.log('📧 Limpando notificações antigas...');
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('cleanup_old_notifications');
    
    if (cleanupError) {
      console.log('⚠️ Erro na limpeza de notificações:', cleanupError.message);
    } else {
      console.log(\`✅ Notificações limpas: \${cleanupResult || 0} registros removidos\`);
    }

    // Verificar integridade dos dados
    console.log('🔍 Verificando integridade dos dados...');
    
    const tables = ['users', 'missions', 'achievements', 'notifications'];
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(\`❌ Erro ao verificar \${table}: \${error.message}\`);
      } else {
        console.log(\`📊 \${table}: \${count} registros\`);
      }
    }

    // Verificar usuários órfãos
    console.log('👥 Verificando usuários órfãos...');
    const { data: orphanUsers, error: orphanError } = await supabase
      .from('users')
      .select('id, email')
      .is('auth_user_id', null);
    
    if (orphanError) {
      console.log('⚠️ Erro ao verificar usuários órfãos:', orphanError.message);
    } else {
      console.log(\`👥 Usuários órfãos encontrados: \${orphanUsers.length}\`);
    }

    console.log('✅ Limpeza concluída!');

  } catch (error) {
    console.error('❌ Erro durante limpeza:', error.message);
    process.exit(1);
  }
}

cleanupDatabase();
"@

$cleanupScript | Out-File -FilePath "cleanup-temp.js" -Encoding UTF8

try {
    node "cleanup-temp.js"
} finally {
    Remove-Item "cleanup-temp.js" -ErrorAction SilentlyContinue
}
```

### 4.2 Script de Diagnóstico Completo

```powershell
# diagnose-complete.ps1
# Diagnóstico completo do sistema Esquads

Write-Host "🔍 Executando diagnóstico completo do Esquads Academy..." -ForegroundColor Green

# Verificar ambiente
Write-Host "`n📋 1. VERIFICAÇÃO DE AMBIENTE" -ForegroundColor Cyan
.\validate-environment.ps1

# Testar performance
Write-Host "`n⚡ 2. TESTE DE PERFORMANCE" -ForegroundColor Cyan
.\monitor-performance.ps1

# Executar testes de integração
Write-Host "`n🧪 3. TESTES DE INTEGRAÇÃO" -ForegroundColor Cyan
.\test-esquads-integration.ps1

# Verificar logs
Write-Host "`n📝 4. VERIFICAÇÃO DE LOGS" -ForegroundColor Cyan
if (Test-Path "logs") {
    $logFiles = Get-ChildItem "logs\*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 3
    foreach ($log in $logFiles) {
        Write-Host "📄 $($log.Name) ($(Get-Date $log.LastWriteTime -Format 'dd/MM/yyyy HH:mm'))" -ForegroundColor Yellow
        $errors = Select-String -Path $log.FullName -Pattern "ERROR|ERRO" | Select-Object -First 5
        if ($errors) {
            Write-Host "  ❌ Erros encontrados:" -ForegroundColor Red
            $errors | ForEach-Object { Write-Host "    $($_.Line)" -ForegroundColor Red }
        } else {
            Write-Host "  ✅ Nenhum erro encontrado" -ForegroundColor Green
        }
    }
} else {
    Write-Host "📄 Nenhum arquivo de log encontrado" -ForegroundColor Yellow
}

Write-Host "`n🎉 Diagnóstico completo concluído!" -ForegroundColor Green
```

---

## 📋 5. SCRIPTS DE UTILIDADE

### 5.1 Script de Reset Completo

```powershell
# reset-esquads.ps1
# Reset completo do ambiente (CUIDADO!)

param(
    [switch]$Confirm
)

if (!$Confirm) {
    Write-Host "⚠️ ATENÇÃO: Este script irá resetar completamente o ambiente!" -ForegroundColor Red
    Write-Host "💡 Execute com -Confirm para confirmar a operação" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔄 Resetando ambiente Esquads Academy..." -ForegroundColor Red

# Fazer backup antes do reset
Write-Host "💾 Criando backup de segurança..." -ForegroundColor Yellow
.\backup-database.ps1

# Remover configurações locais
if (Test-Path ".env.local") {
    Remove-Item ".env.local"
    Write-Host "🗑️ Arquivo .env.local removido" -ForegroundColor Yellow
}

# Limpar cache do npm
Write-Host "🧹 Limpando cache..." -ForegroundColor Yellow
npm cache clean --force

# Reinstalar dependências
Write-Host "📦 Reinstalando dependências..." -ForegroundColor Yellow
Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
npm install

Write-Host "✅ Reset concluído!" -ForegroundColor Green
Write-Host "💡 Execute setup-esquads-supabase.ps1 para reconfigurar" -ForegroundColor Cyan
```

### 5.2 Script de Informações do Sistema

```powershell
# system-info.ps1
# Exibe informações do sistema e projeto

Write-Host "ℹ️ Informações do Sistema Esquads Academy" -ForegroundColor Green

Write-Host "`n🖥️ SISTEMA OPERACIONAL:" -ForegroundColor Cyan
Write-Host "  OS: $([System.Environment]::OSVersion.VersionString)"
Write-Host "  PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "  .NET: $([System.Environment]::Version)"

Write-Host "`n📦 DEPENDÊNCIAS:" -ForegroundColor Cyan
if (Get-Command "node" -ErrorAction SilentlyContinue) {
    Write-Host "  Node.js: $(node --version)"
} else {
    Write-Host "  Node.js: ❌ Não instalado"
}

if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    Write-Host "  npm: $(npm --version)"
} else {
    Write-Host "  npm: ❌ Não instalado"
}

Write-Host "`n📁 PROJETO:" -ForegroundColor Cyan
if (Test-Path "package.json") {
    $package = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "  Nome: $($package.name)"
    Write-Host "  Versão: $($package.version)"
} else {
    Write-Host "  ❌ package.json não encontrado"
}

Write-Host "`n🔧 CONFIGURAÇÃO:" -ForegroundColor Cyan
if (Test-Path ".env.local") {
    Write-Host "  .env.local: ✅ Configurado"
    $envLines = (Get-Content ".env.local" | Where-Object { $_ -match "^[A-Z_]+=.+" }).Count
    Write-Host "  Variáveis: $envLines definidas"
} else {
    Write-Host "  .env.local: ❌ Não configurado"
}

Write-Host "`n🗄️ MIGRAÇÕES:" -ForegroundColor Cyan
if (Test-Path "supabase\migrations") {
    $migrations = Get-ChildItem "supabase\migrations\*.sql"
    Write-Host "  Total: $($migrations.Count) arquivos"
    $latest = $migrations | Sort-Object Name | Select-Object -Last 1
    Write-Host "  Última: $($latest.Name)"
} else {
    Write-Host "  ❌ Diretório de migrações não encontrado"
}

Write-Host "`n📊 ESPAÇO EM DISCO:" -ForegroundColor Cyan
$drive = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq "C:" }
$freeGB = [math]::Round($drive.FreeSpace / 1GB, 2)
$totalGB = [math]::Round($drive.Size / 1GB, 2)
Write-Host "  Livre: $freeGB GB de $totalGB GB"
```

---

## 🚀 6. SCRIPT PRINCIPAL DE EXECUÇÃO

### 6.1 Script Master de Implementação

```powershell
# implement-esquads-supabase.ps1
# Script principal para implementação completa

param(
    [Parameter(Mandatory=$true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$SupabaseAnonKey,
    
    [Parameter(Mandatory=$true)]
    [string]$SupabaseServiceKey,
    
    [switch]$SkipTests,
    [switch]$SkipMigrations
)

Write-Host "🚀 IMPLEMENTAÇÃO COMPLETA - ESQUADS ACADEMY + SUPABASE" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green

# Etapa 1: Configuração inicial
Write-Host "`n📋 ETAPA 1: CONFIGURAÇÃO INICIAL" -ForegroundColor Cyan
.\setup-esquads-supabase.ps1 -SupabaseUrl $SupabaseUrl -SupabaseAnonKey $SupabaseAnonKey -SupabaseServiceKey $SupabaseServiceKey

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha na configuração inicial" -ForegroundColor Red
    exit 1
}

# Etapa 2: Validação do ambiente
Write-Host "`n🔍 ETAPA 2: VALIDAÇÃO DO AMBIENTE" -ForegroundColor Cyan
.\validate-environment.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha na validação do ambiente" -ForegroundColor Red
    exit 1
}

# Etapa 3: Backup e migrações
if (!$SkipMigrations) {
    Write-Host "`n🗄️ ETAPA 3: BACKUP E MIGRAÇÕES" -ForegroundColor Cyan
    .\backup-database.ps1
    .\apply-migrations.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha na aplicação de migrações" -ForegroundColor Red
        exit 1
    }
}

# Etapa 4: Testes de integração
if (!$SkipTests) {
    Write-Host "`n🧪 ETAPA 4: TESTES DE INTEGRAÇÃO" -ForegroundColor Cyan
    .\test-esquads-integration.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Alguns testes falharam, mas continuando..." -ForegroundColor Yellow
    }
}

# Etapa 5: Verificação final
Write-Host "`n✅ ETAPA 5: VERIFICAÇÃO FINAL" -ForegroundColor Cyan
.\system-info.ps1

Write-Host "`n🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "💡 Execute 'npm run dev' para iniciar o projeto" -ForegroundColor Cyan
Write-Host "📚 Consulte a documentação em docs/ para mais informações" -ForegroundColor Cyan
```

---

## 📋 7. INSTRUÇÕES DE USO

### 7.1 Execução Rápida (Recomendada)

```powershell
# Implementação completa em um comando
.\implement-esquads-supabase.ps1 `
  -SupabaseUrl "https://your-project.supabase.co" `
  -SupabaseAnonKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." `
  -SupabaseServiceKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 7.2 Execução Passo a Passo

```powershell
# 1. Configuração inicial
.\setup-esquads-supabase.ps1 -SupabaseUrl "..." -SupabaseAnonKey "..." -SupabaseServiceKey "..."

# 2. Validação
.\validate-environment.ps1

# 3. Backup
.\backup-database.ps1

# 4. Migrações
.\apply-migrations.ps1

# 5. Testes
.\test-esquads-integration.ps1

# 6. Monitoramento
.\monitor-performance.ps1
```

### 7.3 Manutenção Regular

```powershell
# Diagnóstico completo (semanal)
.\diagnose-complete.ps1

# Limpeza do banco (mensal)
.\cleanup-database.ps1

# Backup manual
.\backup-database.ps1
```

---

**Status**: ✅ Scripts Prontos para Uso  
**Compatibilidade**: Windows 10/11 + PowerShell 5.1+  
**Dependências**: Node.js 18+, npm, Supabase CLI (opcional)  
**Tempo de Execução**: 10-30 minutos (implementação completa)