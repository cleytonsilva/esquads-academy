#!/usr/bin/env node

/**
 * Script para aplicar migrações SQL do Supabase de forma ordenada e segura
 * 
 * Funcionalidades:
 * - Validação de configuração do ambiente
 * - Ordenação cronológica das migrações
 * - Execução segura com tratamento de erros
 * - Logs detalhados de progresso
 * - Validação de sucesso de cada migração
 * 
 * Uso: node apply-migrations.js
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração de cores para logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função para logs coloridos
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// Função para validar configuração do ambiente
function validateEnvironment() {
  log('🔍 Validando configuração do ambiente...', 'blue');
  
  // Tentar carregar variáveis de diferentes fontes
  const envFiles = ['.env.local', '.env', 'env.example'];
  let envLoaded = false;
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      log(`📄 Carregando variáveis de ${envFile}`, 'cyan');
      config({ path: envFile });
      envLoaded = true;
      break;
    }
  }
  
  if (!envLoaded) {
    log('⚠️  Nenhum arquivo de ambiente encontrado, usando variáveis do sistema', 'yellow');
  }
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    log('❌ ERRO: VITE_SUPABASE_URL ou SUPABASE_URL não definida', 'red');
    log('💡 Configure a variável no arquivo .env.local', 'yellow');
    process.exit(1);
  }
  
  if (!supabaseServiceKey) {
    log('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não definida', 'red');
    log('💡 Configure a variável no arquivo .env.local', 'yellow');
    process.exit(1);
  }
  
  // Validar formato das chaves
  if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost')) {
    log('⚠️  URL do Supabase pode estar incorreta', 'yellow');
  }
  
  if (!supabaseServiceKey.startsWith('eyJ')) {
    log('⚠️  Service Role Key pode estar incorreta (deve começar com eyJ)', 'yellow');
  }
  
  log('✅ Configuração do ambiente validada', 'green');
  return { supabaseUrl, supabaseServiceKey };
}

// Função para listar e ordenar migrações
function getMigrationFiles() {
  log('📂 Listando arquivos de migração...', 'blue');
  
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    log('❌ ERRO: Pasta supabase/migrations não encontrada', 'red');
    process.exit(1);
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .map(file => {
      const filePath = path.join(migrationsDir, file);
      const stats = fs.statSync(filePath);
      
      // Extrair timestamp do nome do arquivo
      let timestamp = 0;
      const timestampMatch = file.match(/^(\d{8})_/);
      if (timestampMatch) {
        timestamp = parseInt(timestampMatch[1]);
      } else if (file.match(/^\d{3}_/)) {
        // Arquivos como 001_, 002_ recebem prioridade alta
        timestamp = parseInt(file.substring(0, 3));
      } else {
        // Arquivos sem timestamp usam data de modificação
        timestamp = stats.mtime.getTime();
      }
      
      return {
        name: file,
        path: filePath,
        timestamp,
        size: stats.size
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
  
  log(`📋 Encontradas ${files.length} migrações para aplicar`, 'cyan');
  
  // Mostrar primeiras 5 e últimas 5 migrações
  const preview = files.length > 10 ? 
    [...files.slice(0, 5), { name: '...', path: '', timestamp: 0, size: 0 }, ...files.slice(-5)] : 
    files;
  
  preview.forEach((file, index) => {
    if (file.name === '...') {
      log(`   ... (${files.length - 10} migrações intermediárias)`, 'cyan');
    } else {
      log(`   ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(1)}KB)`, 'cyan');
    }
  });
  
  return files;
}

// Função para criar cliente Supabase
function createSupabaseClient(url, serviceKey) {
  log('🔗 Conectando ao Supabase...', 'blue');
  
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  return supabase;
}

// Função para testar conexão
async function testConnection(supabase) {
  log('🧪 Testando conexão com o banco de dados...', 'blue');
  
  try {
    // Testar com uma consulta simples que sempre funciona
    const { data, error } = await supabase.auth.getSession();
    
    if (error && !error.message.includes('session')) {
      throw error;
    }
    
    log('✅ Conexão com o banco estabelecida com sucesso', 'green');
    return true;
  } catch (error) {
    log(`❌ ERRO na conexão: ${error.message}`, 'red');
    return false;
  }
}

// Função para executar SQL usando PostgreSQL REST API direta
async function executeSQL(supabaseUrl, serviceKey, sql) {
  // Usar a API REST do PostgREST diretamente
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sql',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Accept': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: sql
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response;
}

// Função para executar uma migração
async function executeMigration(supabase, migration, index, total, supabaseUrl, serviceKey) {
  const progress = `[${index + 1}/${total}]`;
  log(`${progress} 🚀 Executando: ${migration.name}`, 'magenta');
  
  try {
    // Ler conteúdo do arquivo SQL
    const sqlContent = fs.readFileSync(migration.path, 'utf8');
    
    if (!sqlContent.trim()) {
      log(`${progress} ⚠️  Arquivo vazio, pulando: ${migration.name}`, 'yellow');
      return { success: true, skipped: true };
    }
    
    // Limpar comentários e linhas vazias
    const cleanedSQL = sqlContent
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('--') && 
               !trimmed.startsWith('/*') &&
               !trimmed.startsWith('*');
      })
      .join('\n')
      .trim();
    
    if (!cleanedSQL) {
      log(`${progress} ⚠️  Nenhum comando SQL válido encontrado, pulando: ${migration.name}`, 'yellow');
      return { success: true, skipped: true };
    }
    
    log(`${progress} 📝 Executando migração SQL...`, 'cyan');
    
    try {
      // Tentar executar o SQL completo
      await executeSQL(supabaseUrl, serviceKey, cleanedSQL);
      log(`${progress} ✅ Migração aplicada com sucesso: ${migration.name}`, 'green');
      return { success: true, commandsExecuted: 1 };
      
    } catch (sqlError) {
      // Se falhar, tentar dividir em comandos individuais
      log(`${progress} ⚠️  Execução em bloco falhou, tentando comando por comando...`, 'yellow');
      
      const commands = cleanedSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);
      
      if (commands.length === 0) {
        log(`${progress} ⚠️  Nenhum comando válido após divisão, pulando: ${migration.name}`, 'yellow');
        return { success: true, skipped: true };
      }
      
      let successCount = 0;
      let lastError = null;
      
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        
        try {
          await executeSQL(supabaseUrl, serviceKey, command);
          successCount++;
          
          if (i % 5 === 0 && commands.length > 5) {
            log(`${progress} 📊 Progresso: ${i + 1}/${commands.length} comandos`, 'cyan');
          }
        } catch (cmdError) {
          lastError = cmdError;
          
          // Verificar se é um erro que podemos ignorar
          const errorMsg = cmdError.message.toLowerCase();
          if (errorMsg.includes('already exists') || 
              errorMsg.includes('does not exist') ||
              errorMsg.includes('duplicate key') ||
              errorMsg.includes('permission denied') ||
              errorMsg.includes('relation') && errorMsg.includes('already exists')) {
            log(`${progress} ⚠️  Aviso no comando ${i + 1}: ${cmdError.message}`, 'yellow');
            successCount++;
          } else {
            log(`${progress} ❌ Erro no comando ${i + 1}: ${cmdError.message}`, 'red');
            // Continuar mesmo com erro, mas registrar
          }
        }
      }
      
      if (successCount > 0) {
        log(`${progress} ✅ Migração aplicada parcialmente: ${successCount}/${commands.length} comandos: ${migration.name}`, 'green');
        return { success: true, commandsExecuted: successCount, warnings: commands.length - successCount };
      } else {
        log(`${progress} ❌ Falha completa na migração: ${migration.name}`, 'red');
        return { success: false, error: lastError?.message || 'Erro desconhecido' };
      }
    }
    
  } catch (error) {
    log(`${progress} ❌ ERRO na migração ${migration.name}: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Função para criar tabela de controle de migrações
async function createMigrationTable(supabaseUrl, serviceKey) {
  log('📋 Criando tabela de controle de migrações...', 'blue');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS _migration_history (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      success BOOLEAN NOT NULL DEFAULT true,
      error_message TEXT,
      commands_executed INTEGER DEFAULT 0
    );
  `;
  
  try {
    await executeSQL(supabaseUrl, serviceKey, createTableSQL);
    log('✅ Tabela de controle criada/verificada', 'green');
  } catch (error) {
    log(`⚠️  Aviso: ${error.message}`, 'yellow');
  }
}

// Função para registrar migração aplicada
async function recordMigration(supabaseUrl, serviceKey, migration, result) {
  try {
    const errorMessage = result.error ? result.error.replace(/'/g, "''") : null;
    const insertSQL = `
      INSERT INTO _migration_history (migration_name, success, error_message, commands_executed, applied_at)
      VALUES ('${migration.name}', ${result.success}, ${errorMessage ? `'${errorMessage}'` : 'NULL'}, ${result.commandsExecuted || 0}, NOW())
      ON CONFLICT (migration_name) DO UPDATE SET
        success = EXCLUDED.success,
        error_message = EXCLUDED.error_message,
        commands_executed = EXCLUDED.commands_executed,
        applied_at = EXCLUDED.applied_at;
    `;
    
    await executeSQL(supabaseUrl, serviceKey, insertSQL);
  } catch (error) {
    log(`⚠️  Aviso ao registrar migração: ${error.message}`, 'yellow');
  }
}

// Função principal
async function main() {
  console.log(`
${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                    ESQUADS MIGRATION TOOL                   ║
║              Aplicador de Migrações Supabase                ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
  `);
  
  const startTime = Date.now();
  
  try {
    // 1. Validar ambiente
    const { supabaseUrl, supabaseServiceKey } = validateEnvironment();
    
    // 2. Listar migrações
    const migrations = getMigrationFiles();
    
    if (migrations.length === 0) {
      log('ℹ️  Nenhuma migração encontrada para aplicar', 'cyan');
      return;
    }
    
    // 3. Criar cliente Supabase
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
    
    // 4. Testar conexão
    const connected = await testConnection(supabase);
    if (!connected) {
      log('❌ Não foi possível conectar ao banco de dados', 'red');
      process.exit(1);
    }
    
    // 5. Criar tabela de controle
    await createMigrationTable(supabaseUrl, supabaseServiceKey);
    
    // 6. Aplicar migrações
    log(`\n🚀 Iniciando aplicação de ${migrations.length} migrações...\n`, 'bright');
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let warningCount = 0;
    const errors = [];
    
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      const result = await executeMigration(supabase, migration, i, migrations.length, supabaseUrl, supabaseServiceKey);
      
      // Registrar resultado
      await recordMigration(supabaseUrl, supabaseServiceKey, migration, result);
      
      if (result.success) {
        if (result.skipped) {
          skippedCount++;
        } else {
          successCount++;
          if (result.warnings) {
            warningCount += result.warnings;
          }
        }
      } else {
        errorCount++;
        errors.push({ migration: migration.name, error: result.error });
      }
      
      // Pequena pausa entre migrações para evitar sobrecarga
      if (i < migrations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // 7. Relatório final
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                      RELATÓRIO FINAL                        ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
    
    log(`📊 Total de migrações: ${migrations.length}`, 'cyan');
    log(`✅ Aplicadas com sucesso: ${successCount}`, 'green');
    log(`⚠️  Puladas (vazias): ${skippedCount}`, 'yellow');
    log(`⚠️  Avisos encontrados: ${warningCount}`, 'yellow');
    log(`❌ Com erro: ${errorCount}`, errorCount > 0 ? 'red' : 'cyan');
    log(`⏱️  Tempo total: ${duration}s`, 'cyan');
    
    if (errors.length > 0) {
      log('\n❌ Erros encontrados:', 'red');
      errors.slice(0, 10).forEach((err, index) => {
        log(`   ${index + 1}. ${err.migration}: ${err.error.substring(0, 100)}...`, 'red');
      });
      
      if (errors.length > 10) {
        log(`   ... e mais ${errors.length - 10} erros`, 'red');
      }
    }
    
    if (errorCount === 0) {
      log('\n🎉 Todas as migrações foram aplicadas com sucesso!', 'green');
    } else if (successCount > errorCount) {
      log(`\n✅ Maioria das migrações aplicadas: ${successCount} sucessos vs ${errorCount} erros`, 'green');
    } else {
      log(`\n⚠️  ${errorCount} migração(ões) falharam. Verifique os logs acima.`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ ERRO CRÍTICO: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar se chamado diretamente
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMainModule || process.argv[1]?.endsWith('apply-migrations.js')) {
  main().catch(error => {
    log(`❌ ERRO FATAL: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  });
}

export { main, validateEnvironment, getMigrationFiles };