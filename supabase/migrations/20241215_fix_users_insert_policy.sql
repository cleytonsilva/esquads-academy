-- Verificar políticas atuais da tabela users
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- Remover política restritiva se existir
DROP POLICY IF EXISTS "usuarios_proprios_dados" ON users;

-- Criar política que permite inserção durante o registro
CREATE POLICY "users_insert_policy" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Criar política que permite leitura dos próprios dados
CREATE POLICY "users_select_policy" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Criar política que permite atualização dos próprios dados
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Criar política que permite exclusão dos próprios dados
CREATE POLICY "users_delete_policy" ON users
  FOR DELETE 
  USING (auth.uid() = id);