-- Corrigir políticas RLS das tabelas sociais
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Corrige e otimiza as políticas RLS para social_post_likes e social_comments

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('social_post_likes', 'social_comments')
ORDER BY tablename, policyname;

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "social_post_likes_select_policy" ON social_post_likes;
DROP POLICY IF EXISTS "social_post_likes_insert_policy" ON social_post_likes;
DROP POLICY IF EXISTS "social_post_likes_update_policy" ON social_post_likes;
DROP POLICY IF EXISTS "social_post_likes_delete_policy" ON social_post_likes;

DROP POLICY IF EXISTS "social_comments_select_policy" ON social_comments;
DROP POLICY IF EXISTS "social_comments_insert_policy" ON social_comments;
DROP POLICY IF EXISTS "social_comments_update_policy" ON social_comments;
DROP POLICY IF EXISTS "social_comments_delete_policy" ON social_comments;

-- Políticas para social_post_likes
-- SELECT: Todos podem ver os likes
CREATE POLICY "social_post_likes_select_policy" ON social_post_likes
    FOR SELECT USING (true);

-- INSERT: Usuários autenticados podem dar like
CREATE POLICY "social_post_likes_insert_policy" ON social_post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem remover apenas seus próprios likes
CREATE POLICY "social_post_likes_delete_policy" ON social_post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para social_comments
-- SELECT: Todos podem ver os comentários
CREATE POLICY "social_comments_select_policy" ON social_comments
    FOR SELECT USING (true);

-- INSERT: Usuários autenticados podem comentar
CREATE POLICY "social_comments_insert_policy" ON social_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem editar apenas seus próprios comentários
CREATE POLICY "social_comments_update_policy" ON social_comments
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar apenas seus próprios comentários
CREATE POLICY "social_comments_delete_policy" ON social_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Garantir que RLS está habilitado
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_social_post_likes_post_user ON social_post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_user ON social_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_parent ON social_comments(parent_comment_id);

-- Log da correção
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'database_migration',
    'Corrigidas políticas RLS das tabelas sociais',
    jsonb_build_object(
        'tables', ARRAY['social_post_likes', 'social_comments'],
        'migration_file', '20250117_fix_social_rls_policies.sql',
        'policies_created', 6,
        'timestamp', NOW()
    ),
    NOW()
);

-- Verificar se as políticas foram criadas corretamente
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE tablename IN ('social_post_likes', 'social_comments')
ORDER BY tablename, policyname;
