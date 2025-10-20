-- Inserir dados de teste para o sistema social
-- Primeiro, vamos garantir que temos alguns usuários de teste

-- Inserir posts sociais de exemplo
INSERT INTO social_posts (user_id, title, content, post_type, tags, likes_count, comments_count) VALUES
  (
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'Dúvida sobre JavaScript',
    'Pessoal, alguém pode me ajudar com closures em JavaScript? Estou com dificuldade para entender o conceito.',
    'question',
    ARRAY['javascript', 'programacao', 'duvida'],
    5,
    3
  ),
  (
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'Conquista desbloqueada! 🎉',
    'Acabei de completar o curso de React! Foi uma jornada incrível e aprendi muito.',
    'achievement',
    ARRAY['react', 'conquista', 'frontend'],
    12,
    7
  ),
  (
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'Grupo de estudos Python',
    'Estou organizando um grupo de estudos para Python. Quem tem interesse em participar?',
    'discussion',
    ARRAY['python', 'grupo-estudo', 'colaboracao'],
    8,
    15
  );

-- Inserir comentários nos posts
INSERT INTO social_comments (post_id, user_id, content, likes_count) VALUES
  (
    (SELECT id FROM social_posts WHERE title = 'Dúvida sobre JavaScript' LIMIT 1),
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'Closures são funções que têm acesso ao escopo da função externa mesmo após ela ter retornado. É um conceito fundamental!',
    2
  ),
  (
    (SELECT id FROM social_posts WHERE title = 'Conquista desbloqueada! 🎉' LIMIT 1),
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'Parabéns! React é uma tecnologia incrível. Qual foi a parte mais desafiadora?',
    1
  );

-- Inserir grupos de estudo
INSERT INTO study_groups (name, description, creator_id, group_type, max_members, is_private) VALUES
  (
    'Python para Iniciantes',
    'Grupo focado em ensinar Python do básico ao intermediário. Reuniões semanais e projetos práticos.',
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'study_group',
    15,
    false
  ),
  (
    'JavaScript Avançado',
    'Para quem já tem conhecimento básico e quer se aprofundar em conceitos avançados como async/await, promises, etc.',
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'study_group',
    10,
    false
  ),
  (
    'Preparação para Entrevistas',
    'Grupo para praticar algoritmos e estruturas de dados para entrevistas técnicas.',
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'study_group',
    20,
    false
  );

-- Inserir dados no leaderboard social
INSERT INTO social_leaderboard (user_id, period, social_points, posts_count, comments_count, likes_received, rank_position, period_start, period_end) VALUES
  (
    (SELECT id FROM users WHERE role = 'student' LIMIT 1),
    'weekly',
    247,
    5,
    12,
    23,
    1,
    date_trunc('week', now()),
    date_trunc('week', now()) + interval '1 week'
  );

-- Garantir permissões para as tabelas sociais
GRANT SELECT, INSERT, UPDATE, DELETE ON social_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON study_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON private_messages TO authenticated;
GRANT SELECT ON social_leaderboard TO authenticated;
GRANT SELECT ON social_leaderboard TO anon;

-- Permitir acesso básico para usuários não autenticados (apenas leitura de posts públicos)
GRANT SELECT ON social_posts TO anon;
GRANT SELECT ON social_comments TO anon;
GRANT SELECT ON study_groups TO anon;
