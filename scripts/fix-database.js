/**
 * Script para aplicar correções no banco de dados Supabase
 * Executa as migrações necessárias para corrigir erros 404
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configurações do Supabase (substitua pelos valores reais)
const supabaseUrl = 'https://anyjcglrdkfkfdylcwxo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

if (!supabaseServiceKey || supabaseServiceKey === 'your-service-role-key') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada!')
  console.error('Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Criar cliente com chave de serviço (acesso administrativo)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyDatabaseFixes() {
  try {
    console.log('🚀 Iniciando aplicação de correções no banco de dados...')
    
    // Ler o arquivo SQL
    const sqlFile = path.join(process.cwd(), 'fix_database_tables.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    console.log('📄 Arquivo SQL carregado:', sqlFile)
    
    // Executar o SQL
    console.log('⚡ Executando SQL...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      
      // Tentar executar comandos SQL individuais
      console.log('🔄 Tentando executar comandos individuais...')
      await executeIndividualCommands()
    } else {
      console.log('✅ SQL executado com sucesso!')
      console.log('📊 Resultado:', data)
    }
    
    // Verificar se as tabelas foram criadas
    await verifyTables()
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    process.exit(1)
  }
}

async function executeIndividualCommands() {
  const commands = [
    // Criar tabela missions
    `CREATE TABLE IF NOT EXISTS missions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty_level TEXT NOT NULL,
      xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
      duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
      tools TEXT[] DEFAULT '{}',
      prerequisites TEXT[] DEFAULT '{}',
      badge_on_completion UUID,
      is_premium BOOLEAN DEFAULT FALSE,
      is_locked BOOLEAN DEFAULT FALSE,
      image_url TEXT,
      objectives JSONB DEFAULT '[]'::jsonb,
      terminal_commands JSONB DEFAULT '[]'::jsonb,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    
    // Criar tabela user_missions
    `CREATE TABLE IF NOT EXISTS user_missions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'NOT_STARTED',
      score NUMERIC(5,2) DEFAULT 0 CHECK (score >= 0 AND score <= 100),
      time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
      xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
      best_score NUMERIC(5,2) DEFAULT 0 CHECK (best_score >= 0 AND best_score <= 100),
      objectives_completed TEXT[] DEFAULT '{}',
      commands_executed JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, mission_id)
    )`,
    
    // Criar tabela notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      payload JSONB DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'unread',
      grouped_count INTEGER DEFAULT 1,
      parent_group_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
      content_hash TEXT,
      expires_at TIMESTAMP WITH TIME ZONE,
      read_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`
  ]
  
  for (const command of commands) {
    try {
      console.log('⚡ Executando comando SQL...')
      const { error } = await supabase.rpc('exec_sql', { sql: command })
      
      if (error) {
        console.error('❌ Erro no comando:', error)
      } else {
        console.log('✅ Comando executado com sucesso!')
      }
    } catch (error) {
      console.error('❌ Erro ao executar comando:', error)
    }
  }
}

async function verifyTables() {
  console.log('🔍 Verificando se as tabelas foram criadas...')
  
  const tables = ['missions', 'user_missions', 'notifications']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Tabela ${table} não encontrada:`, error.message)
      } else {
        console.log(`✅ Tabela ${table} encontrada!`)
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar tabela ${table}:`, error)
    }
  }
}

// Executar o script
applyDatabaseFixes()
  .then(() => {
    console.log('🎉 Script concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
