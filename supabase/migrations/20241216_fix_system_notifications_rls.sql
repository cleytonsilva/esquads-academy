-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA SYSTEM_NOTIFICATIONS
-- Data: 2024-12-16
-- Objetivo: Permitir acesso adequado às notificações do sistema
-- =====================================================

-- 1. REMOVER POLÍTICAS EXISTENTES
-- =====================================================

DROP POLICY IF EXISTS "system_notifications_select_own" ON public.system_notifications;
DROP POLICY IF EXISTS "system_notifications_insert_admin" ON public.system_notifications;
DROP POLICY IF EXISTS "system_notifications_update_own" ON public.system_notifications;
DROP POLICY IF EXISTS "system_notifications_delete_admin" ON public.system_notifications;

-- 2. CRIAR POLÍTICAS MAIS PERMISSIVAS
-- =====================================================

-- Política para SELECT - usuários podem ver suas próprias notificações
CREATE POLICY "system_notifications_select_own" ON public.system_notifications
    FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para INSERT - apenas sistema e admins podem inserir
CREATE POLICY "system_notifications_insert_system" ON public.system_notifications
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        ) OR
        auth.uid() IS NULL -- Permite inserção via triggers/funções
    );

-- Política para UPDATE - usuários podem marcar suas notificações como lidas
CREATE POLICY "system_notifications_update_own" ON public.system_notifications
    FOR UPDATE 
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para DELETE - apenas admins podem deletar
CREATE POLICY "system_notifications_delete_admin" ON public.system_notifications
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 3. GARANTIR QUE RLS ESTÁ ATIVO
-- =====================================================

ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se as políticas foram criadas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'system_notifications' 
    AND schemaname = 'public';
    
    IF policy_count >= 4 THEN
        RAISE NOTICE 'Políticas RLS para system_notifications criadas com sucesso. Total: %', policy_count;
    ELSE
        RAISE WARNING 'Algumas políticas podem não ter sido criadas. Total encontrado: %', policy_count;
    END IF;
END $$;