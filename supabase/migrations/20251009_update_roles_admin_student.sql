-- Ensure only 'admin' and 'student' roles are allowed and align data
BEGIN;

-- user_profiles.role: constrain to admin/student and default to 'student'
ALTER TABLE IF EXISTS public.user_profiles 
  ADD COLUMN IF NOT EXISTS role TEXT;

-- Backfill/null-fix: map any other roles to 'student'
UPDATE public.user_profiles 
SET role = 'student' 
WHERE role IS NULL OR role NOT IN ('admin','student');

-- Add check constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'user_profiles_role_check_admin_student'
  ) THEN
    ALTER TABLE public.user_profiles 
      ADD CONSTRAINT user_profiles_role_check_admin_student 
      CHECK (role IN ('admin','student'));
  END IF;
END $$;

COMMIT;

