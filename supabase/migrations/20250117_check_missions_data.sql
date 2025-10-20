-- Verificar dados de missões
SELECT 
  id,
  title,
  category,
  difficulty,
  type,
  is_active,
  objectives,
  steps,
  created_at
FROM missions 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se há missões com objetivos
SELECT 
  COUNT(*) as total_missions,
  COUNT(CASE WHEN objectives IS NOT NULL AND jsonb_array_length(objectives) > 0 THEN 1 END) as missions_with_objectives,
  COUNT(CASE WHEN steps IS NOT NULL AND jsonb_array_length(steps) > 0 THEN 1 END) as missions_with_steps
FROM missions 
WHERE is_active = true;

-- Verificar categorias disponíveis
SELECT 
  category,
  COUNT(*) as count
FROM missions 
WHERE is_active = true
GROUP BY category
ORDER BY count DESC;
