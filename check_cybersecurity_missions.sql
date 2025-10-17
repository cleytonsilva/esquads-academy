-- Verificar se as missões de cybersegurança foram criadas
SELECT 
    id,
    title,
    description,
    category,
    difficulty,
    type,
    points_reward,
    is_active,
    created_at
FROM public.missions 
WHERE category = 'cybersecurity'
ORDER BY created_at DESC;