-- Migration: Add cybersecurity category to missions
-- Description: Updates the category check constraint to include cybersecurity

-- Drop the existing check constraint
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_category_check;

-- Add the new check constraint with cybersecurity category
ALTER TABLE public.missions ADD CONSTRAINT missions_category_check 
CHECK (category = ANY (ARRAY['general'::text, 'programming'::text, 'design'::text, 'business'::text, 'marketing'::text, 'cybersecurity'::text]));

-- Also update the type constraint to include terminal type
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_type_check;

ALTER TABLE public.missions ADD CONSTRAINT missions_type_check 
CHECK (type = ANY (ARRAY['course_completion'::text, 'lesson_completion'::text, 'points_earned'::text, 'streak'::text, 'quiz_score'::text, 'time_spent'::text, 'terminal'::text]));

-- Update difficulty constraint to include intermediate, advanced, expert
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_difficulty_check;

ALTER TABLE public.missions ADD CONSTRAINT missions_difficulty_check 
CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text, 'intermediate'::text, 'advanced'::text, 'expert'::text]))