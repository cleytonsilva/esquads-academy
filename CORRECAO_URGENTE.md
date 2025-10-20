# 🚨 CORREÇÃO URGENTE - Erros 404 no Banco de Dados

## Problema Identificado
- ❌ Tabela `user_missions` não existe (erro 404)
- ❌ Coluna `status` na tabela `notifications` não existe
- ❌ Sistema de missões não funciona

## Solução Rápida

### Opção 1: Supabase Dashboard (Recomendado)
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Clique em **SQL Editor**
4. Copie e cole o conteúdo do arquivo `URGENT_DATABASE_FIX.sql`
5. Clique em **Run** para executar

### Opção 2: Supabase CLI
```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Aplicar migrações
supabase db push

# Ou executar SQL específico
supabase db reset
```

### Opção 3: Script Node.js
```bash
# Configurar variável de ambiente
export SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-serviço"

# Executar script
node scripts/fix-database.js
```

## O que será corrigido
✅ Tabela `missions` criada  
✅ Tabela `user_missions` criada  
✅ Tabela `notifications` com coluna `status`  
✅ RLS (Row Level Security) configurado  
✅ Índices para performance  
✅ Dados de teste inseridos  
✅ Triggers para `updated_at`  

## Verificação
Após aplicar as correções, verifique se:
- ✅ `/student/missions` carrega sem erro 404
- ✅ Notificações funcionam sem erro de coluna
- ✅ Sistema de missões está operacional

## Arquivos Criados
- `URGENT_DATABASE_FIX.sql` - SQL para executar no Dashboard
- `scripts/fix-database.js` - Script Node.js alternativo
- `fix_database_tables.sql` - SQL completo com comentários
- `supabase/config.toml` - Configuração do Supabase CLI

## Próximos Passos
1. Aplicar as correções no banco
2. Testar o sistema de missões
3. Implementar painel Admin
4. Adicionar mais missões de exemplo
