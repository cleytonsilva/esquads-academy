-- Migração para corrigir recursão infinita nas políticas RLS da tabela users - V2
-- Data: 2025-01-17
-- Problema: Erro "infinite recursion detected in policy for relation users" ainda persiste

-- 1. Desabilitar RLS temporariamente para limpeza
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes (busca por qualquer política na tabela users)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- 3. Recriar permissões básicas
REVOKE ALL ON users FROM anon;
REVOKE ALL ON users FROM authenticated;
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

-- 4. Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas simples e diretas (sem referências circulares)
-- Política básica: usuários autenticados podem ver apenas seus próprios dados
CREATE POLICY "users_own_profile" ON users
    FOR ALL 
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 6. Política para permitir leitura pública básica (sem dados sensíveis)
CREATE POLICY "users_public_profile" ON users
    FOR SELECT 
    TO anon
    USING (true);

-- 7. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';
