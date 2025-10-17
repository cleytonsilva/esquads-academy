-- Add MFA (OTP) support: user flags and OTP table with RLS
BEGIN;

-- Add MFA fields to users table if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'mfa_enabled'
  ) THEN
    ALTER TABLE public.users ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'mfa_channel'
  ) THEN
    ALTER TABLE public.users ADD COLUMN mfa_channel TEXT DEFAULT 'email';
  END IF;
END $$;

-- OTP store table
CREATE TABLE IF NOT EXISTS public.auth_mfa_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  channel TEXT NOT NULL DEFAULT 'email',
  attempt_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_mfa_otp_user_id ON public.auth_mfa_otp(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_mfa_otp_expires_at ON public.auth_mfa_otp(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_mfa_otp_used_at ON public.auth_mfa_otp(used_at);

-- RLS
ALTER TABLE public.auth_mfa_otp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "otp_owner_ins" ON public.auth_mfa_otp;
CREATE POLICY "otp_owner_ins" ON public.auth_mfa_otp
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "otp_owner_sel" ON public.auth_mfa_otp;
CREATE POLICY "otp_owner_sel" ON public.auth_mfa_otp
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "otp_owner_upd" ON public.auth_mfa_otp;
CREATE POLICY "otp_owner_upd" ON public.auth_mfa_otp
  FOR UPDATE USING (auth.uid() = user_id);

-- Require 2FA by default for admins
UPDATE public.users
SET mfa_enabled = TRUE
WHERE role = 'admin' AND (mfa_enabled IS NULL OR mfa_enabled = FALSE);

COMMIT;

