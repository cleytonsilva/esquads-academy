# Integrações do Sistema Esquads

## 📋 Visão Geral
Este documento registra todas as integrações e configurações do sistema Esquads conforme as regras estabelecidas.

**Última Atualização**: 2025-01-15  
**Responsável**: Sistema de IA  

---

## 🔗 Integrações Ativas

### 1. Supabase (Principal)
**Tipo**: Backend as a Service  
**Status**: ✅ Ativo  
**Versão**: Latest  

#### Configurações:
- **URL**: Configurado via `VITE_SUPABASE_URL`
- **Anon Key**: Configurado via `VITE_SUPABASE_ANON_KEY`
- **Service Role**: Configurado via `SUPABASE_SERVICE_ROLE_KEY`

#### Funcionalidades Utilizadas:
- ✅ Autenticação (Auth)
- ✅ Banco de Dados (PostgreSQL)
- ✅ Row Level Security (RLS)
- ✅ Triggers e Funções
- ✅ Real-time (se necessário)

#### Tabelas Principais:
- `auth.users` - Usuários do sistema de autenticação
- `public.users` - Dados dos usuários da aplicação
  - `mfa_enabled` (boolean) - Status do MFA
  - `mfa_channel` (text) - Canal preferido ('email')
- `public.auth_mfa_otp` - Códigos OTP temporários
  - `code_hash` - Hash seguro do código OTP
  - `expires_at` - Expiração automática (10 min)
  - `attempt_count` - Controle de tentativas
  - RLS habilitado para segurança
- `public.achievements` - Sistema de conquistas
- `public.user_achievements` - Conquistas dos usuários
- `public.certificate_templates` - Templates de certificados
- `public.learning_paths` - Trilhas de aprendizado
- `public.badges` - Sistema de badges (estendido)
- `public.user_profiles` - Perfis estendidos (opcional)
- `public.user_points` - Sistema de pontuação

#### Funcionalidades de Segurança:
- ✅ **MFA/OTP**: Sistema completo de autenticação de dois fatores
  - Códigos OTP temporários via email
  - Expiração automática em 10 minutos
  - Controle de tentativas (máx. 3)
  - Ativação automática para usuários admin
- ✅ **RLS Policies**: Políticas de segurança em todas as tabelas
- ✅ **Campos MFA**: `mfa_enabled` e `mfa_channel` na tabela users
- ✅ **Tabela OTP**: `auth_mfa_otp` com hash seguro dos códigos

#### Funcionalidades de Gamificação:
- ✅ **Sistema de Conquistas**: Achievements com pontuação
- ✅ **Badges Estendidos**: Vinculação com cursos e categorias
- ✅ **Certificados**: Templates personalizáveis
- ✅ **Trilhas de Aprendizado**: Progressão estruturada
- ✅ **Sistema de Pontos**: Gamificação completa

### 2. Vite (Build Tool)
**Tipo**: Build Tool e Dev Server  
**Status**: ✅ Ativo  
**Versão**: Latest  

### 3. React (Frontend Framework)
**Tipo**: Framework Frontend  
**Status**: ✅ Ativo  
**Versão**: 18.x  

### 4. Tailwind CSS (Estilização)
**Tipo**: Framework CSS  
**Status**: ✅ Ativo  
**Versão**: Latest  

### 5. shadcn/ui (Componentes UI)
**Tipo**: Biblioteca de Componentes  
**Status**: ✅ Ativo  
**Versão**: Latest  

---

## 🔧 APIs e Endpoints

### 1. Supabase REST API
**Base URL**: `{SUPABASE_URL}/rest/v1/`  
**Autenticação**: Bearer Token (JWT)  

### 2. Supabase Auth API
**Base URL**: `{SUPABASE_URL}/auth/v1/`  

---

## 🔐 Variáveis de Ambiente

### Arquivo: `.env`
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development Settings
NODE_ENV=development
PORT=3001
VITE_PORT=5173

# API Configuration
VITE_API_URL=http://localhost:3001
REPLICATE_API_TOKEN=your-replicate-token
```

---

## 🛠️ Componentes Aprovados (MCPs)

### 1. @21st-dev/magic ✅
### 2. shadcn ✅
### 3. Sequential Thinking ✅
### 4. Postgrest ✅

---

## 🔄 Sincronização e Triggers

### 1. Trigger Automático
**Função**: `handle_new_user()`  
**Trigger**: `on_auth_user_created`  
**Tabela**: `auth.users`  
**Ação**: INSERT/UPDATE  

### 2. UserSyncService
**Arquivo**: `src/services/userSyncService.ts`  
**Tipo**: Serviço de Sincronização Manual  

---

## 🔒 Segurança e Compliance

### 1. Row Level Security (RLS)
**Status**: ✅ Ativo em todas as tabelas  

### 2. Autenticação
**Método**: JWT via Supabase Auth  

---

## 📝 Changelog de Integrações

### 2025-10-16
- **Corrigido**: Página `/admin/users` funcionando corretamente
- **Validado**: Componentes Select do Radix UI funcionando
- **Implementado**: Sistema de autenticação mock para desenvolvimento
- **Testado**: Filtros de usuários (Departamento, Função, Status)
- **Documentado**: Funcionalidades completas em `ADMIN_USERS_FUNCIONALIDADES.md`

### 2025-01-15
- **Adicionado**: Sistema MFA/OTP completo
- **Adicionado**: Migração `20251015_add_mfa_otp.sql` aplicada
- **Adicionado**: Tabela `auth_mfa_otp` com RLS policies
- **Modificado**: Tabela `users` com campos `mfa_enabled` e `mfa_channel`
- **Configurado**: Ativação automática de MFA para usuários admin
- **Adicionado**: Sistema completo de gamificação (8 migrações de outubro 2025)
- **Adicionado**: Tabelas `achievements`, `user_achievements`, `certificate_templates`, `learning_paths`
- **Modificado**: Tabela `badges` com campos `course_id`, `category`, `share_text`
- **Modificado**: Tabela `courses` com campo `certificate_template_id`

### 2024-01-15 - v1.0
#### Adicionado:
- ✅ Integração completa com Supabase
- ✅ Sistema de autenticação funcional
- ✅ Trigger automático para sincronização
- ✅ Políticas RLS corrigidas
- ✅ UserSyncService refatorado

#### Corrigido:
- ✅ Problemas de sincronização entre tabelas
- ✅ Recursão infinita nas políticas RLS
- ✅ Inconsistências na estrutura de dados

---

**Status Geral**: ✅ FUNCIONANDO