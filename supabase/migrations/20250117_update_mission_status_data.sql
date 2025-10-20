-- Atualizar dados existentes para usar novos valores do enum
UPDATE mission_progress 
SET status = 'not_started' 
WHERE status = 'active';

-- Verificar resultado
SELECT status, COUNT(*) as count
FROM mission_progress
GROUP BY status;
