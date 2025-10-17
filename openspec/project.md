# Contexto do Projeto – Esquads Academy Platform

## Propósito
A Esquads Academy Platform é uma plataforma de e-learning gamificada que integra um painel administrativo completo e uma área do estudante com mecânicas de jogo (pontos, badges, missões, leaderboard). O objetivo é aumentar retenção e engajamento por meio de conteúdo estruturado, recursos sociais e automações com IA.

## Tech Stack
- Frontend: `React 18` + `TypeScript` + `Vite` + `Tailwind CSS` + `shadcn/ui`
- Estado: `Zustand` + Contexts React
- Backend: `Supabase` (PostgreSQL, Auth, Storage, Edge Functions, Realtime, RLS)
- Integrações IA: `OpenAI/Claude` (via Edge Functions)
- Emails: `SendGrid`/`Resend`
- Testes: `Vitest` + `React Testing Library`
- Build/Dev: `pnpm`, `vite`, `nodemon` (API local)

## Convenções do Projeto

### Estilo de Código
- TypeScript com tipagem explícita em serviços, hooks e componentes
- Componentes React em `PascalCase`; utilitários e hooks em `camelCase`
- Arquivos por domínio em `src/{contexts|services|hooks|pages|components}`
- ESLint configurado em `eslint.config.js`
- Tailwind com tokens utilitários e classes semânticas

### Padrões de Arquitetura
- Separação clara entre capacidades (auth, cursos, gamificação, certificados, missões, analytics)
- Serviços isolados em `src/services` com chamadas ao Supabase
- Hooks encapsulam acesso a serviços e tratamento de estado/erros
- Layouts por papel: `AdminLayout`, `StudentLayout`
- Middleware de navegação para regras de acesso por role
- Edge Functions para processamento IA e integrações externas

### Estratégia de Testes
- Unit testes em serviços críticos (auth, certificados, recomendações)
- Testes de hooks com `React Testing Library`
- Integração: fluxos de login, navegação por role, emissão de certificados
- Priorizar cenários definidos em specs OpenSpec (Requirements + Scenarios)

### Fluxo de Git (referência)
- Branches: `main` (estável), `feature/<change-id>` para mudanças
- Commits curtos com prefixo de escopo: `feat(auth): ...`, `fix(courses): ...`
- PR com link para `openspec/changes/<change-id>` e referência aos specs

## Contexto de Domínio
- Papéis: `admin`, `student` com redirecionamento pós-login
- Módulos principais (PRD): cursos, missões IA, gamificação (pontos/badges), relatórios/analytics, certificados, simulador de exames
- Fluxo estudante: dashboard → cursos/missões → progresso → conquistas
- Fluxo admin: dashboard → gestão de cursos/usuários → gamificação → relatórios → IA

## Restrições Importantes
- RLS (Row Level Security) rígida em tabelas de domínio
- Segurança: autenticação robusta, necessidade de MFA/2FA (em roadmap)
- Performance: índices e cache (vide `utils/cache` e índices SQL)
- Não desmontar estrutura atual; evoluir por deltas de specs com OpenSpec

## Dependências Externas
- Supabase: banco, auth, storage, realtime
- OpenAI/Claude: geração de conteúdo/assistência IA (via Edge Functions)
- SendGrid/Resend: envio de emails (OTP, certificados)

## Mapa de Capacidades (para OpenSpec)
- `auth` – autenticação, roles, MFA/2FA (a adicionar)
- `courses` – gestão de cursos, módulos e lições
- `gamification` – pontos, badges, leaderboards
- `certificates` – emissão e validação de certificados
- `missions` – missões com chatbot IA
- `analytics` – métricas e relatórios

## Convenções OpenSpec
- Change IDs: `add-`, `update-`, `remove-`, `refactor-` (kebab-case, verbo na frente)
- Deltas sempre com `## ADDED|MODIFIED|REMOVED` e pelo menos um `#### Scenario:`
- Validar mudanças com `openspec validate <change-id> --strict`

## Referências de Documentos
- PRD: `.trae/documents/PRD_Esquads_Academy_Platform.md`
- Arquitetura: `.trae/documents/Arquitetura_Tecnica_Esquads_Academy.md`
- Plano técnico: `.trae/documents/Plano_Implementacao_Tecnica_Esquads.md`
