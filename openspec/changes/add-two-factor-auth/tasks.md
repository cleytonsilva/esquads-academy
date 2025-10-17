## 1. Implementação
- [ ] 1.1 Criar tabela `auth_mfa_otp` no Supabase
  - Campos: `id uuid`, `user_id uuid`, `code_hash text`, `expires_at timestamptz`, `used_at timestamptz`, `channel text` (default `email`), `attempt_count int` (default 0)
  - Índices: `user_id`, `expires_at`, `used_at`
  - RLS: permitir leitura/escrita apenas pelo usuário dono e função de serviço
- [ ] 1.2 Alterar `profiles`: adicionar `mfa_enabled boolean` (default false) e `mfa_channel text` (default `email`)
- [ ] 1.3 Edge Function `auth-otp` (handlers: `POST /otp/send`, `POST /otp/verify`)
  - Gerar OTP 6 dígitos, armazenar `code_hash`, `expires_at = now()+5m`, enviar email
  - Verificar OTP: comparar hash, checar TTL, incrementar `attempt_count`, marcar `used_at`, invalidar demais
  - Rate limiting básico por `user_id` e `ip`
- [ ] 1.4 Integração de email (Resend/SendGrid)
  - Template transacional: "Seu código de segurança"
  - Conteúdo inclui código, validade, e alertas de segurança
- [ ] 1.5 Frontend
  - Adicionar `TwoFactorStep` (input OTP, reenvio, feedback de erro)
  - Integrar no fluxo de login dentro de `AuthContext` e página `Login`
  - Persistência opcional "lembrar dispositivo por 30 dias" (cookie/kv)
- [ ] 1.6 Testes
  - Unit: geração/verificação OTP, rate limit, expiração
  - Integração: fluxo login admin com desafio 2FA, student sem 2FA
- [ ] 1.7 Observabilidade
  - Eventos: `auth.otp_sent`, `auth.otp_verified`, `auth.otp_failed`
  - Métricas: taxa de falha, tempo de verificação, reenvios

## 2. Migração
- [ ] 2.1 Ativar 2FA por padrão para `admin`
- [ ] 2.2 Permitir `student` optar por 2FA nas configurações
- [ ] 2.3 Criar tarefa de backfill inicial (`mfa_enabled` para admins existentes)

## 3. Segurança
- [ ] 3.1 Armazenar apenas `code_hash` (SHA-256) – nunca o código em claro
- [ ] 3.2 TTL do OTP = 5 minutos; máximo 5 tentativas
- [ ] 3.3 Reenvio bloqueado por 30s; logs para auditoria
- [ ] 3.4 Revisar políticas RLS e privilégios de função de serviço