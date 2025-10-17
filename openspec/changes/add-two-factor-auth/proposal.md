## Why
Fortalecer a segurança de contas e operações privilegiadas, exigindo um segundo fator de autenticação (2FA) para admins e para ações sensíveis. Reduz risco de fraude, tomada de conta e uso indevido.

## What Changes
- Introduzir 2FA por `OTP` via email (Resend/SendGrid), com opção de evoluir para `TOTP` posteriormente.
- Adicionar passo de desafio 2FA após credenciais válidas (login/password) quando `mfa_enabled = true`.
- Backend: criar endpoints/Edge Function para gerar/validar OTP e armazenar hash efêmero com TTL.
- Banco: nova tabela `auth_mfa_otp` (user_id, code_hash, expires_at, used_at, channel, attempt_count) e campos em `profiles` (`mfa_enabled boolean`, `mfa_channel text`).
- UI: componente de captura do código (`TwoFactorStep`) e fluxo de retorno a partir do contexto de auth.
- Regras: Admins exigem 2FA; Students opcional (a habilitar nas configurações do usuário).

## Impact
- Affected specs: `auth`
- Affected code: `src/contexts/AuthContext.tsx`, `src/pages/auth/Login.tsx`, `src/services/authService.ts`, `edge-functions/auth-otp`, SQL Supabase (nova tabela + políticas RLS), provider de email