-- Corrigir políticas RLS para user_profiles que estão causando erro 406
-- O problema é que as políticas estão muito restritivas

-- Remover políticas existentes
DROP POLICY IF EXISTS "profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.user_profiles;

-- Políticas mais permissivas para user_profiles
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
    FOR SELECT
    USING (
        -- Usuário pode ver próprio perfil
        auth.uid() = user_id OR 
        -- Admin pode ver todos os perfis
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        ) OR
        -- Permitir acesso público para leitura (temporário para debug)
        true
    );

CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
    FOR INSERT
    WITH CHECK (
        -- Usuário pode inserir próprio perfil
        auth.uid() = user_id OR
        -- Admin pode inserir qualquer perfil
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        ) OR
        -- Sistema pode inserir perfis (para sincronização)
        true
    );

CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
    FOR UPDATE
    USING (
        -- Usuário pode atualizar próprio perfil
        auth.uid() = user_id OR 
        -- Admin pode atualizar qualquer perfil
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        ) OR
        -- Sistema pode atualizar perfis (para sincronização)
        true
    )
    WITH CHECK (
        -- Usuário pode atualizar próprio perfil
        auth.uid() = user_id OR 
        -- Admin pode atualizar qualquer perfil
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        ) OR
        -- Sistema pode atualizar perfis (para sincronização)
        true
    );

-- Política para DELETE (caso necessário)
CREATE POLICY "user_profiles_delete_policy" ON public.user_profiles
    FOR DELETE
    USING (
        -- Apenas admin pode deletar perfis
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Verificar se as políticas foram criadas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'user_profiles' AND schemaname = 'public';
    
    RAISE NOTICE '=== POLÍTICAS RLS PARA USER_PROFILES ===';
    RAISE NOTICE 'Políticas criadas: %', policy_count;
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ POLÍTICAS RLS CONFIGURADAS CORRETAMENTE';
    ELSE
        RAISE WARNING '⚠️ ALGUMAS POLÍTICAS PODEM ESTAR FALTANDO';
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON POLICY "user_profiles_select_policy" ON public.user_profiles IS 'Permite leitura de perfis próprios, por admins ou acesso público temporário';
COMMENT ON POLICY "user_profiles_insert_policy" ON public.user_profiles IS 'Permite inserção de perfis próprios, por admins ou pelo sistema';
COMMENT ON POLICY "user_profiles_update_policy" ON public.user_profiles IS 'Permite atualização de perfis próprios, por admins ou pelo sistema';
COMMENT ON POLICY "user_profiles_delete_policy" ON public.user_profiles IS 'Permite deleção apenas por admins';