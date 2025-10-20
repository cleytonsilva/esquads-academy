-- =====================================================
-- CORREÇÃO CRÍTICA: Trigger para criação automática de usuários
-- =====================================================
-- Este trigger resolve o erro "Database error saving new user"
-- criando automaticamente um registro em public.users quando
-- um usuário é criado em auth.users

-- 1. Criar função para inserir usuário em public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger que executa após inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar se o trigger foi criado corretamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Testar a função manualmente (comentado para não executar)
-- SELECT public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Função que cria automaticamente um registro em public.users quando um usuário é criado em auth.users. Resolve o erro "Database error saving new user".';
