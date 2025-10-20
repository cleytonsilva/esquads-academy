# 🚀 Plano de Migração: Sistema de Missões e Simulados

## 📋 Visão Geral

Este documento descreve o plano completo para migrar a estrutura de missões e simulados da pasta `paineis/` para os painéis Admin e Student do projeto principal, respeitando o PRD e a arquitetura estabelecida.

---

## 🎯 Objetivos

1. **Remover implementação antiga** de missões e simulados do projeto principal
2. **Replicar estrutura robusta** da pasta `paineis/` nos painéis Admin e Student
3. **Separar responsabilidades**: Admin cria/gerencia, Student apenas executa
4. **Manter gamificação invisível** integrada ao fluxo (não como rota separada)
5. **Garantir design responsivo** e experiência fluida

---

## 📊 Análise da Estrutura `paineis/`

### Componentes Principais Identificados

#### 1. **Tipos TypeScript** (`paineis/src/types/index.ts`)
- ✅ Enums: `MissionCategory`, `DifficultyLevel`, `MissionStatus`, `CertificationProvider`
- ✅ Interfaces: `Mission`, `MissionProgress`, `CertificationExam`, `ExamResult`
- ✅ Filtros: `MissionFilters`, `CertificationFilters`, `ExamConfig`
- ✅ Gamificação: `Badge`, `XPTransaction`, `RankingEntry`, `Achievement`

#### 2. **Hooks Personalizados** (`paineis/src/hooks/index.ts`)
- ✅ `useUserProfile` - Gerencia perfil, XP, badges, níveis
- ✅ `useMissions` - CRUD de missões, filtros, progresso
- ✅ `useCertifications` - Gerencia simulados/certificações
- ✅ `useRanking` - Sistema de ranking global

#### 3. **Componentes de Missões**

**Seleção** (`paineis/src/pages/mission-selection/components/`)
- `MissionCard.jsx` - Card visual com status, progresso, badges
- `MissionFilters.jsx` - Filtros por categoria, dificuldade, status
- `MissionGrid.jsx` - Grid responsivo de missões
- `ProgressionPath.jsx` - Visualização de caminho de progressão

**Gameplay** (`paineis/src/pages/mission-gameplay/components/`)
- `SimulatorTerminal.jsx` - Terminal interativo com xterm.js simulado
- `BotGuidancePanel.jsx` - Painel de dicas IA com chat
- `MissionHUD.jsx` - HUD com objetivos, tempo, XP
- `ObjectiveTracker.jsx` - Tracker de objetivos da missão

**Resultados** (`paineis/src/pages/mission-results/components/`)
- `CelebrationHeader.jsx` - Header de celebração com animações
- `PerformanceBreakdown.jsx` - Breakdown de performance
- `BadgeShowcase.jsx` - Showcase de badges conquistadas
- `XPRewardsPanel.jsx` - Painel de recompensas XP

#### 4. **Componentes de Simulados/Certificações**

**Seletor** (`paineis/src/pages/certification-selector/components/`)
- `CertificationCard.jsx` - Card de certificação
- `FilterPanel.jsx` - Filtros avançados
- `ExamConfigPanel.jsx` - Configuração de exame
- `RecommendationPanel.jsx` - Recomendações personalizadas

**Interface de Exame** (`paineis/src/pages/exam-interface/components/`)
- `QuestionDisplay.jsx` - Display de questão
- `ExamTimer.jsx` - Timer de exame
- `QuestionNavigation.jsx` - Navegação entre questões
- `ExamSidebar.jsx` - Sidebar com overview

**Resultados** (`paineis/src/pages/exam-results/components/`)
- `OverallScoreCard.jsx` - Card de pontuação geral
- `DetailedAnalysis.jsx` - Análise detalhada por tópico
- `TopicBreakdownChart.jsx` - Gráfico de breakdown

---

## 🏗️ Arquitetura de Implementação

### Estrutura de Diretórios Proposta

```
src/
├── types/
│   ├── missions.ts          # Tipos de missões
│   ├── exams.ts             # Tipos de simulados
│   └── gamification.ts      # Tipos de gamificação (já existe, atualizar)
│
├── hooks/
│   ├── missions/
│   │   ├── useMissions.ts
│   │   ├── useMissionProgress.ts
│   │   └── useMissionFilters.ts
│   ├── exams/
│   │   ├── useExams.ts
│   │   ├── useExamSession.ts
│   │   └── useExamResults.ts
│   └── gamification/
│       ├── useUserProfile.ts (já existe, atualizar)
│       ├── useRanking.ts
│       └── useAchievements.ts (já existe, atualizar)
│
├── components/
│   ├── missions/
│   │   ├── selection/
│   │   │   ├── MissionCard.tsx
│   │   │   ├── MissionFilters.tsx
│   │   │   ├── MissionGrid.tsx
│   │   │   └── ProgressionPath.tsx
│   │   ├── gameplay/
│   │   │   ├── SimulatorTerminal.tsx
│   │   │   ├── BotGuidancePanel.tsx
│   │   │   ├── MissionHUD.tsx
│   │   │   └── ObjectiveTracker.tsx
│   │   ├── results/
│   │   │   ├── CelebrationHeader.tsx
│   │   │   ├── PerformanceBreakdown.tsx
│   │   │   ├── BadgeShowcase.tsx
│   │   │   └── XPRewardsPanel.tsx
│   │   └── admin/
│   │       ├── MissionCreator.tsx
│   │       ├── MissionEditor.tsx
│   │       └── MissionManager.tsx
│   │
│   ├── exams/
│   │   ├── selector/
│   │   │   ├── CertificationCard.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── ExamConfigPanel.tsx
│   │   ├── interface/
│   │   │   ├── QuestionDisplay.tsx
│   │   │   ├── ExamTimer.tsx
│   │   │   └── QuestionNavigation.tsx
│   │   ├── results/
│   │   │   ├── OverallScoreCard.tsx
│   │   │   ├── DetailedAnalysis.tsx
│   │   │   └── TopicBreakdownChart.tsx
│   │   └── admin/
│   │       ├── ExamCreator.tsx
│   │       ├── QuestionEditor.tsx
│   │       └── ExamManager.tsx
│   │
│   └── ui/
│       └── (componentes base do shadcn já existentes)
│
├── pages/
│   ├── admin/
│   │   ├── Missions.tsx           # Atualizar: Gerenciamento completo
│   │   ├── MissionEditor.tsx      # Novo: Editor de missões
│   │   ├── Exams.tsx              # Atualizar: Gerenciamento completo
│   │   └── ExamEditor.tsx         # Novo: Editor de simulados
│   │
│   └── student/
│       ├── Missions.tsx           # Atualizar: Listagem/seleção
│       ├── MissionPlay.tsx        # Novo: Gameplay de missão
│       ├── MissionResult.tsx      # Novo: Resultados de missão
│       ├── Exams.tsx              # Atualizar: Listagem/seleção
│       ├── ExamPlay.tsx           # Novo: Interface de exame
│       └── ExamResult.tsx         # Novo: Resultados de exame
│
├── services/
│   ├── missionService.ts          # CRUD de missões
│   ├── examService.ts             # CRUD de simulados
│   ├── gamificationService.ts     # Já existe, atualizar
│   └── hintAgent.ts               # Já existe, integrar
│
└── supabase/
    └── migrations/
        ├── 2025XXXX_create_missions_v2.sql
        ├── 2025XXXX_create_exams_v2.sql
        └── 2025XXXX_create_mission_progress.sql
```

---

## 🗄️ Modelagem de Dados (Supabase)

### Tabelas Necessárias

#### 1. `missions` (Atualizar/Recriar)
```sql
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- FIREWALL, CLOUD_SECURITY, etc
  difficulty_level TEXT NOT NULL, -- BASIC, INTERMEDIATE, ADVANCED, EXPERT
  xp_reward INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  tools TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  badge_on_completion UUID REFERENCES badge_definitions(id),
  is_premium BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  objectives JSONB, -- Array de objetivos com critérios
  terminal_commands JSONB, -- Comandos esperados e respostas
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_category CHECK (category IN ('FIREWALL', 'CLOUD_SECURITY', 'FORENSICS', 'NETWORK_SECURITY', 'PENETRATION_TESTING', 'INCIDENT_RESPONSE', 'VULNERABILITY_ASSESSMENT')),
  CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'))
);
```

#### 2. `user_missions` (Progresso do Aluno)
```sql
CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mission_id UUID REFERENCES missions(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  score NUMERIC(5,2) DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  best_score NUMERIC(5,2) DEFAULT 0,
  objectives_completed JSONB, -- Array de objetivos completados
  commands_executed JSONB, -- Histórico de comandos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id),
  CONSTRAINT valid_status CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'LOCKED'))
);
```

#### 3. `certification_exams` (Atualizar/Recriar)
```sql
CREATE TABLE certification_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL, -- AWS, AZURE, GCP, COMPTIA, etc
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  difficulty_level TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  pass_percentage NUMERIC(5,2) NOT NULL,
  xp_reward INTEGER NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  topics TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  icon_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_provider CHECK (provider IN ('AWS', 'AZURE', 'GCP', 'COMPTIA', 'CISCO', 'ISC2', 'ECCOUNCIL', 'ISACA')),
  CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'))
);
```

#### 4. `exam_questions`
```sql
CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES certification_exams(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array de opções
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  image_url TEXT,
  code_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. `user_exam_sessions`
```sql
CREATE TABLE user_exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  exam_id UUID REFERENCES certification_exams(id) NOT NULL,
  config JSONB NOT NULL, -- Configuração do exame
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_question_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}', -- Mapa de respostas
  time_remaining_seconds INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. `user_exam_results`
```sql
CREATE TABLE user_exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  exam_id UUID REFERENCES certification_exams(id) NOT NULL,
  session_id UUID REFERENCES user_exam_sessions(id),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  pass_percentage NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  time_spent_minutes INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  performance_by_topic JSONB, -- Breakdown por tópico
  attempts INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 Row Level Security (RLS)

### Políticas Necessárias

```sql
-- Missões: Admin pode tudo, Student pode ler
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to missions"
  ON missions FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

CREATE POLICY "Students can view missions"
  ON missions FOR SELECT
  USING (true);

-- Progresso de Missões: Usuário vê apenas o seu
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mission progress"
  ON user_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mission progress"
  ON user_missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mission progress"
  ON user_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Exames: Admin pode tudo, Student pode ler
ALTER TABLE certification_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to exams"
  ON certification_exams FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

CREATE POLICY "Students can view exams"
  ON certification_exams FOR SELECT
  USING (true);

-- Questões: Herdado dos exames
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to questions"
  ON exam_questions FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

CREATE POLICY "Students can view questions"
  ON exam_questions FOR SELECT
  USING (true);

-- Sessões e Resultados: Usuário vê apenas o seu
ALTER TABLE user_exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exam sessions"
  ON user_exam_sessions FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE user_exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exam results"
  ON user_exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam results"
  ON user_exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔄 Rotas e Navegação

### Rotas Admin (Adicionar/Atualizar)

```typescript
/admin/missions              → AdminMissions (Lista + CRUD)
/admin/missions/create       → AdminMissionEditor (Criar nova)
/admin/missions/:id/edit     → AdminMissionEditor (Editar)
/admin/exams                 → AdminExams (Lista + CRUD)
/admin/exams/create          → AdminExamEditor (Criar novo)
/admin/exams/:id/edit        → AdminExamEditor (Editar)
/admin/exams/:id/questions   → AdminQuestionManager (Gerenciar questões)
```

### Rotas Student (Adicionar/Atualizar)

```typescript
/student/missions            → StudentMissions (Listagem com filtros)
/student/missions/:id        → StudentMissionPlay (Gameplay)
/student/missions/:id/result → StudentMissionResult (Resultados)
/student/exams               → StudentExams (Listagem com filtros)
/student/exams/:id/config    → StudentExamConfig (Configuração)
/student/exams/:id/play      → StudentExamPlay (Interface de exame)
/student/exams/:id/result    → StudentExamResult (Resultados)
```

---

## 📝 Etapas de Implementação

### Fase 1: Preparação e Limpeza ✅
1. ✅ Analisar estrutura de `paineis/`
2. ⏳ Remover componentes/rotas antigas de missões
3. ⏳ Backup de dados existentes se necessário

### Fase 2: Fundação
4. Criar tipos TypeScript unificados
5. Implementar hooks personalizados
6. Criar componentes UI base

### Fase 3: Backend e Banco de Dados
7. Criar migrações Supabase
8. Implementar serviços (missionService, examService)
9. Configurar RLS

### Fase 4: Painel Admin
10. Implementar criação de missões
11. Implementar criação de simulados
12. Implementar gerenciamento e edição

### Fase 5: Painel Student
13. Implementar listagem e seleção de missões
14. Implementar gameplay de missões
15. Implementar listagem e seleção de simulados
16. Implementar interface de simulados

### Fase 6: Integração e Polimento
17. Integrar sistema de gamificação
18. Integrar HintAgent/BotGuidancePanel
19. Aplicar design system e responsividade
20. Testes end-to-end

### Fase 7: Deploy e Validação
21. Deploy em staging
22. Testes de aceitação
23. Deploy em produção

---

## ✅ Critérios de Sucesso

- [ ] Admin pode criar e editar missões completas com objetivos e comandos
- [ ] Admin pode criar e editar simulados completos com questões
- [ ] Student vê apenas missões disponíveis (não bloqueadas)
- [ ] Student pode executar missões no terminal simulado
- [ ] Student recebe dicas do bot IA durante missões
- [ ] Student pode fazer simulados configuráveis
- [ ] Progresso é salvo automaticamente
- [ ] XP e badges são atribuídos automaticamente
- [ ] Gamificação está integrada ao fluxo (não como rota separada)
- [ ] Design é responsivo e moderno
- [ ] Performance é otimizada (< 3s loading)

---

## 🚨 Pontos de Atenção

1. **Não criar rota `/student/gamification`** - gamificação deve ser invisível
2. **Separação clara**: Admin cria, Student executa
3. **RLS rigoroso**: Usuário só vê/edita seus dados
4. **Validação de comandos no backend**: Nunca confiar no frontend
5. **Rate limiting**: Prevenir spam de requisições
6. **Backup antes de deletar**: Salvar dados antigos antes de migrar
7. **Design responsivo**: Mobile-first approach
8. **Acessibilidade**: Seguir WCAG 2.1 AA

---

## 📊 Métricas de Sucesso

- **Performance**: First Contentful Paint < 1.5s
- **Usabilidade**: Máximo 3 cliques para qualquer ação
- **Cobertura de testes**: > 80%
- **Satisfação**: NPS > 8
- **Engajamento**: Taxa de conclusão de missões > 60%

---

**Documento criado em**: 17 de Outubro de 2025  
**Última atualização**: 17 de Outubro de 2025  
**Status**: Em Implementação 🚧

