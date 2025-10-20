-- Adicionar novos valores ao enum mission_status
ALTER TYPE mission_status ADD VALUE IF NOT EXISTS 'not_started';
ALTER TYPE mission_status ADD VALUE IF NOT EXISTS 'in_progress';
