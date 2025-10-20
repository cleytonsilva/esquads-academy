## 🧠 Documento Consolidado — PRD + Plano de Correções

Este documento une o PRD  com o plano técnico de correções incrementais, visando a consolidação da visão estratégica, lógica funcional, e prioridades técnicas da **Esquads Academy Platform**. Tudo foi cruzado com base no repositório atual [github.com/cleytonsilva/esquads-academy](https://github.com/cleytonsilva/esquads-academy).

---

## 🎯 Objetivo

Construir uma plataforma de aprendizado gamificado, focada em segurança da informação, onde o aluno evolui por missões práticas, simulados e desafios. A progressão do usuário é rastreada por XP, badges, reputação e conquistas — **sem que a lógica de gamificação seja visível como uma rota isolada.**

---

## 🧱 Estrutura de Rotas

* `/student/*`: Interface do estudante com dashboard, cursos, progresso e feedbacks.

  * `/student/dashboard`
  * `/student/courses`
  * `/student/missions`
  * `/student/certificates`
* `/admin/*`: Interface do administrador com gerenciamento de conteúdo.

  * `/admin/dashboard`
  * `/admin/users`
  * `/admin/courses`
  * `/admin/simulations`
* ⚠️ Rota `/student/gamification` foi **removida**.

---

## 🔐 Controle de Acesso (RLS + Middleware)

* Middleware `ProtectedRoute` define acesso por `role`
* Supabase com políticas RLS ativas:

  * Estudantes só veem seus próprios dados
  * Admins com acesso geral
* Redirecionamento automático pós-login baseado em role

---

## 🎮 Gamificação (invisível no menu)

**Serviço: `GamificationService`** (lógica separada e reativa):

* XP ganho por ações:

  * Missão iniciada, completada, reprovada
  * Questão respondida
  * Dica usada (XP negativo)
* Reputação ajustada automaticamente por acertos e consistência
* Badges desbloqueadas automaticamente (com raridade)
* Ranking atualizado semanalmente (XP + Reputação)
* Eventos armazenados em `xp_events` e `reputation_events`
* Lógica cacheada e otimizada

---

## 🧪 Missões e Simulados

### Missões (Desafios Práticos)

* Baseadas em containers com terminal embutido (xterm.js)
* Avaliadas por script automático (validador de comandos)
* Componente `<MissionTerminal>`:

  * WebSocket para execução
  * Chat de dicas via IA (HintAgent)
  * Progresso salvo a cada execução

### Simulados (Quizzes adaptativos)

* Questões com feedback instantâneo
* IA para geração e sugestão de questões
* Banco versionado por dificuldade e tipo (Blue Team, Red Team, Cloud, etc)

---

## 📜 Certificados

* Gerados por curso ou trilha completa
* Hash SHA-256 único + QR Code de validação
* Página pública de verificação
* Template PDF com marca d'água e proteção antifalsificação

---

## 🧩 Badges

* Categorizadas por tipo e raridade
* Cada badge vale XP e/ou reputação
* Exibidas no dashboard e perfil do aluno
* Componente `BadgeGallery` com filtros e tooltips
* Compartilháveis em redes sociais

---

## 🧮 Progresso do Estudante (Student Summary)

Serviço `ProgressService` com retorno unificado:

```ts
interface StudentSummary {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  reputation: number;
  totalBadges: number;
  badgesByRarity: Record<string, number>;
  activeMissions: number;
  completedMissions: number;
  ranking: {
    position: number;
    season: string;
  };
  recentAchievements: Badge[];
}
```

---

## 🧠 IA Embutida (Módulos Agentes)

* `HintAgent`: Gera dicas por nível (sutil, direta, solução)
* `FeedbackAgent`: Retorna análise pós-simulado
* `CourseGeneratorAgent`: Gera novas trilhas e missões por perfil

---

## 📊 Dashboards

### Estudante

* XP, Reputação e Nível
* Progresso por missão/trilha
* Recomendações inteligentes
* Conquistas recentes

### Admin

* KPIs principais
* Gráficos de engajamento
* Ranking de dificuldade
* Exportação CSV
* Alertas automáticos

---

## 🛡️ Segurança

* Sandbox para missões em terminal
* Autenticação via Supabase
* Políticas RLS ativas por tabela
* Audit log de ações críticas

---

## 📘 Banco de Dados (Tabelas Chave)

```sql
users, missions, user_missions,
simulations, user_simulations,
certificates, badge_definitions, user_badges,
xp_events, reputation_events, user_rankings
```

---

## 🧪 Testes Prioritários

1. Gamification Service
2. Auth + Middleware de Role
3. Missões práticas (comandos e validação)
4. Feedback IA e IA de dicas
5. Dashboard (resumo + rankings)

---

## 🚀 Roadmap Técnico (resumo)

| Sprint | Tópico                             |
| ------ | ---------------------------------- |
| 1-2    | Refatoração de rotas + DB + Auth   |
| 3-4    | Backend Gamification + Progress    |
| 5-6    | Frontend Dashboards + Terminal     |
| 7      | Segurança, certificados            |
| 8      | Métricas e Analytics               |
| 9-10   | Testes, docs e preparação para MVP |

---

## ✅ Critérios de Sucesso

* Lighthouse acima de 90
* Missões com taxa de conclusão > 60%
* Tempo médio na plataforma > 20min
* Recompensas visíveis mas não intrusivas
* Engajamento diário > 30%

---

> Última revisão: Outubro 2025 — Consolidado com base no PRD v3 e plano incremental técnico
