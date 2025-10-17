-- Verificar permissões atuais das tabelas
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Garantir permissões básicas para o role anon (usuários não logados)
GRANT SELECT ON badges TO anon;
GRANT SELECT ON missions TO anon;
GRANT SELECT ON level_configs TO anon;
GRANT SELECT ON courses TO anon;
GRANT SELECT ON course_modules TO anon;
GRANT SELECT ON module_lessons TO anon;
GRANT SELECT ON exams TO anon;

-- Garantir permissões completas para o role authenticated (usuários logados)
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON user_points TO authenticated;
GRANT ALL PRIVILEGES ON user_badges TO authenticated;
GRANT ALL PRIVILEGES ON user_courses TO authenticated;
GRANT ALL PRIVILEGES ON lesson_progress TO authenticated;
GRANT ALL PRIVILEGES ON mission_progress TO authenticated;
GRANT ALL PRIVILEGES ON points_history TO authenticated;
GRANT ALL PRIVILEGES ON gamification_activities TO authenticated;
GRANT ALL PRIVILEGES ON certificates TO authenticated;
GRANT ALL PRIVILEGES ON exam_attempts TO authenticated;

-- Permissões de leitura para tabelas de configuração
GRANT SELECT ON badges TO authenticated;
GRANT SELECT ON missions TO authenticated;
GRANT SELECT ON level_configs TO authenticated;
GRANT SELECT ON courses TO authenticated;
GRANT SELECT ON course_modules TO authenticated;
GRANT SELECT ON module_lessons TO authenticated;
GRANT SELECT ON exams TO authenticated;

-- Permissões especiais para instrutores criarem/editarem cursos
GRANT INSERT, UPDATE ON courses TO authenticated;
GRANT INSERT, UPDATE ON course_modules TO authenticated;
GRANT INSERT, UPDATE ON module_lessons TO authenticated;
GRANT INSERT, UPDATE ON exams TO authenticated;

-- Verificar permissões após aplicação
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;