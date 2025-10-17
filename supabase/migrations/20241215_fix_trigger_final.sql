-- =====================================================
-- CORREÇÃO FINAL: Recriar trigger com logs e tratamento de erro
-- =====================================================

-- 1. Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Criar função melhorada com tratamento de erro e logs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log do início da execução
  RAISE NOTICE 'TRIGGER EXECUTADO: handle_new_user para usuário %', NEW.id;
  
  BEGIN
    -- Tentar inserir o usuário na tabela public.users
    INSERT INTO public.users (
      id, 
      full_name, 
      role, 
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'SUCESSO: Usuário % inserido em public.users', NEW.id;
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'AVISO: Usuário % já existe em public.users', NEW.id;
    WHEN OTHERS THEN
      RAISE NOTICE 'ERRO no trigger: % - %', SQLSTATE, SQLERRM;
      -- NÃO vamos fazer RAISE para não quebrar o processo de auth
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar se foi criado
SELECT 
  'TRIGGER RECRIADO' as status,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 5. Reabilitar RLS com política mais permissiva
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Remover todas as políticas existentes
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- 7. Criar políticas mais permissivas
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT 
  WITH CHECK (true); -- Permitir qualquer inserção

CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT 
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 8. Verificar políticas criadas
SELECT 
  'POLÍTICAS CRIADAS' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';