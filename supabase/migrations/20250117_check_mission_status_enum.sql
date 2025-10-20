-- Verificar valores do enum mission_status
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'mission_status'
);

-- Verificar dados atuais da tabela mission_progress
SELECT status, COUNT(*) as count
FROM mission_progress
GROUP BY status;
