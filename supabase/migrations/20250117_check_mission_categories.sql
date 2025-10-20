-- ============================================================================
-- VERIFICAÇÃO DE CATEGORIAS DE MISSÕES
-- ============================================================================

-- Verificar todas as categorias únicas no banco
SELECT DISTINCT category, COUNT(*) as count
FROM missions 
GROUP BY category
ORDER BY count DESC;

-- Verificar missões com steps definidos
SELECT 
    title,
    category,
    difficulty,
    jsonb_array_length(steps) as num_steps,
    jsonb_array_length(objectives) as num_objectives
FROM missions 
WHERE steps IS NOT NULL AND steps != '[]'::jsonb
ORDER BY category, title;

-- Verificar se há missões sem steps ou objectives
SELECT 
    COUNT(*) as total_missions,
    COUNT(CASE WHEN steps IS NULL OR steps = '[]'::jsonb THEN 1 END) as missions_without_steps,
    COUNT(CASE WHEN objectives IS NULL OR objectives = '[]'::jsonb THEN 1 END) as missions_without_objectives
FROM missions;
