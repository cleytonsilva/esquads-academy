# Plano de Integração - Protótipos de Missões e Simulados

## 📋 Visão Geral

Este documento detalha o plano completo para integrar os protótipos de missões e simulados da pasta `paineis` no projeto principal Esquads Academy Platform. A integração visa aproveitar os componentes já desenvolvidos e testados para criar uma experiência completa de aprendizado gamificado.

---

## 🔍 Análise dos Componentes Existentes nos Protótipos

### 📁 Estrutura Atual dos Protótipos (`paineis/`)

```
paineis/
├── src/
│   ├── components/
│   │   ├── ui/                    # Componentes base de UI
│   │   └── gamification/          # Componentes específicos de gamificação
│   ├── pages/
│   │   ├── mission-selection/     # Seleção de missões
│   │   ├── mission-gameplay/      # Execução de missões
│   │   ├── mission-results/       # Resultados de missões
│   │   ├── exam-interface/        # Interface de exames
│   │   ├── exam-results/          # Resultados de exames
│   │   └── certification-selector/ # Seletor de certificações
│   ├── hooks/                     # Custom hooks
│   ├── types/                     # Definições de tipos
│   └── utils/                     # Utilitários
```

### 🧩 Componentes Principais Identificados

#### 1. **MissionCard.jsx** - Card de Missão
- **Funcionalidades**: Exibição de missões com progresso, dificuldade, XP, badges
- **Props**: mission, userPlan
- **Features**: 
  - Sistema de bloqueio/desbloqueio
  - Indicadores de premium
  - Progresso visual
  - Badges de conquista
  - Pré-requisitos

#### 2. **SimulatorTerminal.jsx** - Terminal Interativo
- **Funcionalidades**: Terminal simulado para execução de comandos
- **Features**:
  - Histórico de comandos
  - Sugestões automáticas
  - Comandos específicos por categoria (Firewall, Cloud, Forensics)
  - Feedback visual de sucesso/erro
  - Sistema de ajuda integrado

#### 3. **QuestionDisplay.jsx** - Exibição de Questões
- **Funcionalidades**: Renderização de questões de exame
- **Tipos suportados**: Cenário, Código, Múltipla escolha
- **Features**:
  - Modo de revisão
  - Explicações detalhadas
  - Indicadores visuais de correto/incorreto

#### 4. **Componentes de UI Reutilizáveis**
- Header.jsx
- Breadcrumb.jsx
- UserStatusPanel.jsx
- ProgressIndicator.jsx
- QuickActionButton.jsx

---

## 🗺️ Mapeamento para Estrutura do Projeto Principal

### 📂 Estrutura de Destino no Projeto Principal

```
src/
├── components/
│   ├── missions/                  # ✅ Já existe
│   │   ├── MissionCard.tsx        # 🔄 Atualizar com protótipo
│   │   ├── MissionTerminal.tsx    # 🔄 Integrar SimulatorTerminal
│   │   ├── MissionFilters.tsx     # ✅ Já existe
│   │   ├── MissionGrid.tsx        # ✅ Já existe
│   │   ├── MissionDashboard.tsx   # ✅ Já existe
│   │   └── terminal/              # 🆕 Nova pasta para componentes de terminal
│   │       ├── TerminalCore.tsx   # 🆕 Core do terminal
│   │       ├── CommandProcessor.tsx # 🆕 Processador de comandos
│   │       └── TerminalHistory.tsx # 🆕 Histórico de comandos
│   ├── exams/                     # 🆕 Nova pasta
│   │   ├── ExamInterface.tsx      # 🆕 Interface principal de exames
│   │   ├── QuestionDisplay.tsx    # 🆕 Do protótipo
│   │   ├── ExamSidebar.tsx        # 🆕 Navegação lateral
│   │   ├── ExamHeader.tsx         # 🆕 Cabeçalho do exame
│   │   └── ExamResults.tsx        # 🆕 Resultados do exame
│   ├── simulations/               # 🆕 Nova pasta
│   │   ├── SimulationCard.tsx     # 🆕 Card de simulação
│   │   ├── SimulationInterface.tsx # 🆕 Interface de simulação
│   │   └── SimulationResults.tsx  # 🆕 Resultados de simulação
│   └── ui/                        # ✅ Já existe - adicionar componentes faltantes
├── pages/
│   ├── admin/
│   │   ├── missions/              # 🆕 Gestão de missões
│   │   ├── exams/                 # 🆕 Gestão de exames
│   │   └── simulations/           # 🆕 Gestão de simulações
│   └── student/
│       ├── missions/              # 🔄 Atualizar com protótipos
│       ├── exams/                 # 🆕 Nova seção
│       └── simulations/           # 🆕 Nova seção
├── hooks/
│   ├── missions/                  # ✅ Já existe
│   ├── exams/                     # ✅ Já existe
│   └── simulations/               # 🆕 Novos hooks
└── types/
    ├── missions.ts                # 🔄 Expandir tipos
    ├── exams.ts                   # 🆕 Tipos de exames
    └── simulations.ts             # 🆕 Tipos de simulações
```

---

## 🚀 Plano de Migração dos Componentes

### Fase 1: Preparação da Estrutura (Sprint 1)

#### 1.1 Criação de Pastas e Estrutura Base
```bash
# Criar estrutura de pastas
mkdir -p src/components/exams
mkdir -p src/components/simulations
mkdir -p src/components/missions/terminal
mkdir -p src/pages/admin/missions
mkdir -p src/pages/admin/exams
mkdir -p src/pages/admin/simulations
mkdir -p src/pages/student/exams
mkdir -p src/pages/student/simulations
mkdir -p src/hooks/simulations
mkdir -p src/types
```

#### 1.2 Migração de Tipos TypeScript
```typescript
// src/types/missions.ts
export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: DifficultyLevel;
  duration: string;
  xpReward: number;
  image: string;
  progress: number;
  isLocked: boolean;
  isPremium: boolean;
  tools: string[];
  badges: Badge[];
  prerequisites: string[];
  objectives: MissionObjective[];
}

export interface MissionObjective {
  title: string;
  description: string;
  xpReward: number;
  hint: string;
  completed?: boolean;
  completedAt?: string;
}

export type MissionCategory = 
  | 'Firewall' 
  | 'Cloud Security' 
  | 'Forensics' 
  | 'Network Security'
  | 'Penetration Testing'
  | 'Incident Response';

export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado';
```

```typescript
// src/types/exams.ts
export interface Exam {
  id: string;
  title: string;
  code: string;
  duration: number;
  totalQuestions: number;
  questions: ExamQuestion[];
  certification: string;
  difficulty: DifficultyLevel;
}

export interface ExamQuestion {
  id: number;
  number: number;
  total: number;
  type: QuestionType;
  category: string;
  difficulty: DifficultyLevel;
  points: number;
  text: string;
  scenario?: string;
  code?: string;
  options: QuestionOption[];
  explanation: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  description?: string;
  isCorrect: boolean;
}

export type QuestionType = 'scenario' | 'code' | 'multiple';
```

### Fase 2: Migração de Componentes Core (Sprint 2)

#### 2.1 Migração do MissionCard
```typescript
// src/components/missions/MissionCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mission } from '@/types/missions';

interface MissionCardProps {
  mission: Mission;
  userPlan?: 'free' | 'premium';
  onStartMission?: (missionId: string) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  userPlan = 'free',
  onStartMission
}) => {
  // Implementação baseada no protótipo
  // Integração com sistema de autenticação existente
  // Integração com sistema de gamificação
};
```

#### 2.2 Migração do Terminal Interativo
```typescript
// src/components/missions/terminal/TerminalCore.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Mission } from '@/types/missions';

interface TerminalCoreProps {
  mission: Mission;
  onCommandExecute: (command: string, isCorrect: boolean, response: string) => void;
  onProgressUpdate: (step: number, progress: number) => void;
  currentStep: number;
  isLoading?: boolean;
}

export const TerminalCore: React.FC<TerminalCoreProps> = ({
  mission,
  onCommandExecute,
  onProgressUpdate,
  currentStep,
  isLoading = false
}) => {
  // Implementação baseada no SimulatorTerminal.jsx
  // Integração com WebSocket para execução real de comandos
  // Sistema de validação de comandos
};
```

#### 2.3 Migração da Interface de Exames
```typescript
// src/components/exams/QuestionDisplay.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExamQuestion } from '@/types/exams';

interface QuestionDisplayProps {
  question: ExamQuestion;
  selectedAnswer?: string;
  onAnswerSelect: (optionId: string) => void;
  isReviewMode?: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  isReviewMode = false
}) => {
  // Implementação baseada no protótipo
  // Suporte a diferentes tipos de questão
  // Modo de revisão com explicações
};
```

### Fase 3: Integração com Supabase (Sprint 3)

#### 3.1 Estrutura de Dados no Supabase

```sql
-- Tabelas para Missões
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  duration VARCHAR(50),
  xp_reward INTEGER DEFAULT 0,
  image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  tools JSONB DEFAULT '[]',
  prerequisites JSONB DEFAULT '[]',
  objectives JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progresso do usuário em missões
CREATE TABLE user_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 1,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_elapsed INTEGER DEFAULT 0, -- em segundos
  lives_used INTEGER DEFAULT 0,
  commands_executed JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Tabelas para Exames
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  certification VARCHAR(100) NOT NULL,
  duration INTEGER NOT NULL, -- em minutos
  total_questions INTEGER NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questões de exames
CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'scenario', 'code', 'multiple'
  category VARCHAR(100),
  difficulty VARCHAR(50),
  points INTEGER DEFAULT 1,
  question_text TEXT NOT NULL,
  scenario_text TEXT,
  code_snippet TEXT,
  options JSONB NOT NULL, -- Array de opções
  correct_answer VARCHAR(255) NOT NULL,
  explanation TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, question_number)
);

-- Tentativas de exames pelos usuários
CREATE TABLE user_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_elapsed INTEGER, -- em segundos
  answers JSONB DEFAULT '{}', -- Respostas do usuário
  flagged_questions JSONB DEFAULT '[]',
  score INTEGER,
  passed BOOLEAN,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simulações (CTF/Labs)
CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  estimated_duration INTEGER, -- em minutos
  xp_reward INTEGER DEFAULT 0,
  environment_config JSONB DEFAULT '{}', -- Configuração do ambiente
  validation_rules JSONB DEFAULT '{}', -- Regras de validação
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progresso em simulações
CREATE TABLE user_simulation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  flags_captured JSONB DEFAULT '[]',
  hints_used INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  time_elapsed INTEGER DEFAULT 0,
  actions_log JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, simulation_id)
);
```

#### 3.2 Políticas RLS (Row Level Security)

```sql
-- Políticas para missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "missions_select_all" ON missions
  FOR SELECT USING (true);

CREATE POLICY "missions_insert_admin" ON missions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- Políticas para user_mission_progress
ALTER TABLE user_mission_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_mission_progress_own_data" ON user_mission_progress
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exams_select_active" ON exams
  FOR SELECT USING (is_active = true);

-- Políticas para exam_questions
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_questions_select_with_exam" ON exam_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exams 
      WHERE exams.id = exam_questions.exam_id 
      AND exams.is_active = true
    )
  );

-- Políticas para user_exam_attempts
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_exam_attempts_own_data" ON user_exam_attempts
  FOR ALL USING (auth.uid() = user_id);
```

#### 3.3 Funções do Banco de Dados

```sql
-- Função para calcular progresso de missão
CREATE OR REPLACE FUNCTION calculate_mission_progress(
  p_user_id UUID,
  p_mission_id UUID
) RETURNS INTEGER AS $$
DECLARE
  total_objectives INTEGER;
  completed_objectives INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Buscar total de objetivos da missão
  SELECT jsonb_array_length(objectives) INTO total_objectives
  FROM missions WHERE id = p_mission_id;
  
  -- Buscar objetivos completados pelo usuário
  SELECT current_step INTO completed_objectives
  FROM user_mission_progress 
  WHERE user_id = p_user_id AND mission_id = p_mission_id;
  
  -- Calcular porcentagem
  IF total_objectives > 0 THEN
    progress_percentage := (completed_objectives * 100) / total_objectives;
  ELSE
    progress_percentage := 0;
  END IF;
  
  RETURN COALESCE(progress_percentage, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar comando de missão
CREATE OR REPLACE FUNCTION validate_mission_command(
  p_user_id UUID,
  p_mission_id UUID,
  p_command TEXT,
  p_step INTEGER
) RETURNS JSONB AS $$
DECLARE
  mission_data JSONB;
  step_validation JSONB;
  is_valid BOOLEAN := false;
  response_message TEXT;
  xp_reward INTEGER := 0;
BEGIN
  -- Buscar dados da missão
  SELECT objectives INTO mission_data
  FROM missions WHERE id = p_mission_id;
  
  -- Buscar validação para o step atual
  step_validation := mission_data->p_step-1;
  
  -- Lógica de validação baseada no comando e step
  -- (Implementar validação específica por categoria)
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'is_valid', is_valid,
    'message', response_message,
    'xp_reward', xp_reward,
    'next_step', CASE WHEN is_valid THEN p_step + 1 ELSE p_step END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Fase 4: Integração com Sistema de Gamificação (Sprint 4)

#### 4.1 Eventos de Gamificação para Missões

```typescript
// src/services/gamificationService.ts
export class GamificationService {
  // Eventos de missão
  static async recordMissionStart(userId: string, missionId: string) {
    await this.recordEvent(userId, 'mission_started', {
      mission_id: missionId,
      xp_change: 0,
      reputation_change: 0
    });
  }

  static async recordMissionComplete(userId: string, missionId: string, timeElapsed: number, accuracy: number) {
    const baseXP = 100;
    const timeBonus = Math.max(0, 300 - timeElapsed);
    const accuracyBonus = Math.floor(accuracy * 50);
    const totalXP = baseXP + timeBonus + accuracyBonus;

    await this.recordEvent(userId, 'mission_completed', {
      mission_id: missionId,
      xp_change: totalXP,
      reputation_change: 10,
      time_elapsed: timeElapsed,
      accuracy: accuracy
    });

    // Verificar badges
    await this.evaluateBadges(userId);
  }

  static async recordCommandExecution(userId: string, missionId: string, command: string, isCorrect: boolean) {
    const xpChange = isCorrect ? 10 : -5;
    const reputationChange = isCorrect ? 1 : -1;

    await this.recordEvent(userId, 'command_executed', {
      mission_id: missionId,
      command: command,
      is_correct: isCorrect,
      xp_change: xpChange,
      reputation_change: reputationChange
    });
  }

  // Eventos de exame
  static async recordExamStart(userId: string, examId: string) {
    await this.recordEvent(userId, 'exam_started', {
      exam_id: examId,
      xp_change: 0,
      reputation_change: 0
    });
  }

  static async recordExamComplete(userId: string, examId: string, score: number, passed: boolean) {
    const xpReward = passed ? score * 10 : score * 5;
    const reputationChange = passed ? 20 : 5;

    await this.recordEvent(userId, 'exam_completed', {
      exam_id: examId,
      score: score,
      passed: passed,
      xp_change: xpReward,
      reputation_change: reputationChange
    });

    if (passed) {
      await this.evaluateBadges(userId);
    }
  }
}
```

#### 4.2 Badges Específicas para Missões e Exames

```sql
-- Inserir badges específicas para missões
INSERT INTO badge_definitions (name, description, type, rarity, criteria, icon, xp_value) VALUES
('Primeiro Terminal', 'Complete sua primeira missão de terminal', 'Achievement', 'Common', '{"event_type": "mission_completed", "count": 1}', 'Terminal', 50),
('Especialista em Firewall', 'Complete 5 missões de Firewall', 'Progress', 'Rare', '{"event_type": "mission_completed", "category": "Firewall", "count": 5}', 'Shield', 200),
('Mestre Forense', 'Complete 10 missões de Forense Digital', 'Progress', 'Epic', '{"event_type": "mission_completed", "category": "Forense Digital", "count": 10}', 'Search', 500),
('Velocista', 'Complete uma missão em menos de 5 minutos', 'Achievement', 'Rare', '{"event_type": "mission_completed", "time_elapsed": {"max": 300}}', 'Zap', 150),
('Perfeccionista', 'Complete uma missão com 100% de precisão', 'Achievement', 'Epic', '{"event_type": "mission_completed", "accuracy": 100}', 'Target', 300),

-- Badges para exames
('Primeiro Certificado', 'Passe em seu primeiro exame', 'Achievement', 'Common', '{"event_type": "exam_completed", "passed": true, "count": 1}', 'Award', 100),
('Especialista CISSP', 'Passe no exame CISSP', 'Milestone', 'Legendary', '{"event_type": "exam_completed", "certification": "CISSP", "passed": true}', 'Crown', 1000),
('Nota Máxima', 'Obtenha 100% em um exame', 'Achievement', 'Epic', '{"event_type": "exam_completed", "score": 100, "passed": true}', 'Star', 500);
```

### Fase 5: Rotas e Navegação (Sprint 5)

#### 5.1 Rotas para Missões

```typescript
// src/pages/student/missions/index.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MissionSelection from './MissionSelection';
import MissionGameplay from './MissionGameplay';
import MissionResults from './MissionResults';

const MissionsRouter: React.FC = () => {
  return (
    <Routes>
      <Route index element={<MissionSelection />} />
      <Route path="play/:missionId" element={<MissionGameplay />} />
      <Route path="results/:missionId" element={<MissionResults />} />
    </Routes>
  );
};

export default MissionsRouter;
```

#### 5.2 Rotas para Exames

```typescript
// src/pages/student/exams/index.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ExamSelection from './ExamSelection';
import ExamInterface from './ExamInterface';
import ExamResults from './ExamResults';

const ExamsRouter: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ExamSelection />} />
      <Route path="take/:examId" element={<ExamInterface />} />
      <Route path="results/:attemptId" element={<ExamResults />} />
    </Routes>
  );
};

export default ExamsRouter;
```

#### 5.3 Atualização do Router Principal

```typescript
// src/components/Router.tsx
import MissionsRouter from '@/pages/student/missions';
import ExamsRouter from '@/pages/student/exams';
import SimulationsRouter from '@/pages/student/simulations';

// Adicionar rotas no componente Router existente
<Route path="/student/missions/*" element={<MissionsRouter />} />
<Route path="/student/exams/*" element={<ExamsRouter />} />
<Route path="/student/simulations/*" element={<SimulationsRouter />} />
```

### Fase 6: Hooks e Serviços (Sprint 6)

#### 6.1 Hooks para Missões

```typescript
// src/hooks/missions/useMissionTerminal.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mission } from '@/types/missions';

export const useMissionTerminal = (mission: Mission) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const executeCommand = useCallback(async (command: string) => {
    setIsLoading(true);
    
    try {
      // Validar comando no backend
      const { data, error } = await supabase.rpc('validate_mission_command', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_mission_id: mission.id,
        p_command: command,
        p_step: currentStep
      });

      if (error) throw error;

      // Atualizar histórico
      setCommandHistory(prev => [...prev, command]);
      
      // Atualizar step se comando foi válido
      if (data.is_valid) {
        setCurrentStep(data.next_step);
      }

      return data;
    } catch (error) {
      console.error('Erro ao executar comando:', error);
      return { is_valid: false, message: 'Erro interno do sistema' };
    } finally {
      setIsLoading(false);
    }
  }, [mission.id, currentStep]);

  return {
    commandHistory,
    currentStep,
    isLoading,
    executeCommand
  };
};
```

#### 6.2 Hooks para Exames

```typescript
// src/hooks/exams/useExamSession.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exam, ExamQuestion } from '@/types/exams';

export const useExamSession = (examId: string) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Inicializar sessão de exame
  const startExam = useCallback(async () => {
    try {
      // Buscar dados do exame
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select(`
          *,
          exam_questions (*)
        `)
        .eq('id', examId)
        .single();

      if (examError) throw examError;

      setExam(examData);
      setTimeRemaining(examData.duration * 60); // Converter para segundos

      // Criar tentativa de exame
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_exam_attempts')
        .insert({
          exam_id: examId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      setAttemptId(attemptData.id);
    } catch (error) {
      console.error('Erro ao iniciar exame:', error);
    }
  }, [examId]);

  // Submeter resposta
  const submitAnswer = useCallback((questionNumber: number, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: optionId
    }));
  }, []);

  // Finalizar exame
  const finishExam = useCallback(async () => {
    if (!attemptId) return;

    try {
      const { error } = await supabase
        .from('user_exam_attempts')
        .update({
          completed_at: new Date().toISOString(),
          answers: answers,
          flagged_questions: flaggedQuestions,
          time_elapsed: (exam?.duration || 0) * 60 - timeRemaining
        })
        .eq('id', attemptId);

      if (error) throw error;

      return attemptId;
    } catch (error) {
      console.error('Erro ao finalizar exame:', error);
    }
  }, [attemptId, answers, flaggedQuestions, timeRemaining, exam]);

  return {
    exam,
    currentQuestion,
    setCurrentQuestion,
    answers,
    submitAnswer,
    flaggedQuestions,
    setFlaggedQuestions,
    timeRemaining,
    startExam,
    finishExam
  };
};
```

---

## 🎯 Sistema de Gamificação Integrado

### Eventos Específicos para Missões e Simulados

```typescript
// Eventos de missão
export const MISSION_EVENTS = {
  MISSION_STARTED: 'mission_started',
  MISSION_COMPLETED: 'mission_completed',
  MISSION_FAILED: 'mission_failed',
  COMMAND_EXECUTED: 'command_executed',
  HINT_REQUESTED: 'hint_requested',
  OBJECTIVE_COMPLETED: 'objective_completed'
} as const;

// Eventos de exame
export const EXAM_EVENTS = {
  EXAM_STARTED: 'exam_started',
  EXAM_COMPLETED: 'exam_completed',
  QUESTION_ANSWERED: 'question_answered',
  QUESTION_FLAGGED: 'question_flagged',
  EXAM_PAUSED: 'exam_paused'
} as const;

// Eventos de simulação
export const SIMULATION_EVENTS = {
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_COMPLETED: 'simulation_completed',
  FLAG_CAPTURED: 'flag_captured',
  VULNERABILITY_FOUND: 'vulnerability_found',
  TOOL_USED: 'tool_used'
} as const;
```

### Regras de XP e Reputação

```typescript
export const GAMIFICATION_RULES = {
  missions: {
    start: { xp: 0, reputation: 0 },
    complete: { xp: 100, reputation: 10 },
    fail: { xp: 0, reputation: -5 },
    correct_command: { xp: 10, reputation: 1 },
    incorrect_command: { xp: -5, reputation: -1 },
    hint_used: { xp: -5, reputation: 0 },
    objective_complete: { xp: 25, reputation: 2 }
  },
  exams: {
    start: { xp: 0, reputation: 0 },
    complete_pass: { xp: 200, reputation: 20 },
    complete_fail: { xp: 50, reputation: 5 },
    correct_answer: { xp: 5, reputation: 1 },
    incorrect_answer: { xp: 0, reputation: 0 }
  },
  simulations: {
    start: { xp: 0, reputation: 0 },
    complete: { xp: 150, reputation: 15 },
    flag_captured: { xp: 30, reputation: 3 },
    vulnerability_found: { xp: 50, reputation: 5 }
  }
};
```

---

## 🖥️ Terminal Interativo Avançado

### Arquitetura do Terminal

```typescript
// src/components/missions/terminal/TerminalCore.tsx
export interface TerminalCommand {
  command: string;
  args: string[];
  category: string;
  description: string;
  validator: (args: string[]) => boolean;
  executor: (args: string[]) => Promise<TerminalResponse>;
}

export interface TerminalResponse {
  output: string;
  isSuccess: boolean;
  xpReward?: number;
  nextHint?: string;
}

export class TerminalCommandProcessor {
  private commands: Map<string, TerminalCommand> = new Map();

  constructor(missionCategory: string) {
    this.loadCommandsForCategory(missionCategory);
  }

  private loadCommandsForCategory(category: string) {
    switch (category) {
      case 'Firewall':
        this.registerFirewallCommands();
        break;
      case 'Cloud Security':
        this.registerCloudCommands();
        break;
      case 'Forensics':
        this.registerForensicsCommands();
        break;
      // ... outros casos
    }
  }

  private registerFirewallCommands() {
    this.commands.set('iptables', {
      command: 'iptables',
      args: ['-L', '-A', '-D', '-I'],
      category: 'Firewall',
      description: 'Gerenciar regras de firewall',
      validator: (args) => args.length > 0,
      executor: async (args) => {
        // Lógica específica para iptables
        return {
          output: 'Regras de firewall listadas...',
          isSuccess: true,
          xpReward: 10
        };
      }
    });
    // ... outros comandos
  }
}
```

### Sistema de Validação de Comandos

```typescript
// src/services/commandValidationService.ts
export class CommandValidationService {
  static async validateCommand(
    userId: string,
    missionId: string,
    command: string,
    step: number
  ): Promise<ValidationResult> {
    // Buscar regras de validação da missão
    const { data: mission } = await supabase
      .from('missions')
      .select('objectives')
      .eq('id', missionId)
      .single();

    const objective = mission.objectives[step - 1];
    
    // Aplicar regras de validação específicas
    const isValid = this.applyValidationRules(command, objective.validation_rules);
    
    // Registrar comando executado
    await this.logCommandExecution(userId, missionId, command, isValid);
    
    return {
      isValid,
      message: isValid ? objective.success_message : objective.error_message,
      xpReward: isValid ? objective.xp_reward : 0,
      nextStep: isValid ? step + 1 : step
    };
  }

  private static applyValidationRules(command: string, rules: any): boolean {
    // Implementar lógica de validação baseada nas regras
    // Pode incluir regex, comandos específicos, parâmetros, etc.
    return true; // Placeholder
  }
}
```

---

## 📊 Interface de Exames/Simulados

### Componente Principal de Exame

```typescript
// src/pages/student/exams/ExamInterface.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSession } from '@/hooks/exams/useExamSession';
import { ExamHeader } from '@/components/exams/ExamHeader';
import { ExamSidebar } from '@/components/exams/ExamSidebar';
import { QuestionDisplay } from '@/components/exams/QuestionDisplay';

const ExamInterface: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const {
    exam,
    currentQuestion,
    setCurrentQuestion,
    answers,
    submitAnswer,
    flaggedQuestions,
    setFlaggedQuestions,
    timeRemaining,
    startExam,
    finishExam
  } = useExamSession(examId!);

  useEffect(() => {
    startExam();
  }, [startExam]);

  const handleFinishExam = async () => {
    const attemptId = await finishExam();
    if (attemptId) {
      navigate(`/student/exams/results/${attemptId}`);
    }
  };

  if (!exam) {
    return <div>Carregando exame...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <ExamHeader
        exam={exam}
        timeRemaining={timeRemaining}
        onFinishExam={handleFinishExam}
      />
      
      <div className="flex">
        <ExamSidebar
          exam={exam}
          currentQuestion={currentQuestion}
          answeredQuestions={Object.keys(answers).map(Number)}
          flaggedQuestions={flaggedQuestions}
          onNavigateToQuestion={setCurrentQuestion}
        />
        
        <main className="flex-1 p-6">
          <QuestionDisplay
            question={exam.questions[currentQuestion - 1]}
            selectedAnswer={answers[currentQuestion]}
            onAnswerSelect={(optionId) => submitAnswer(currentQuestion, optionId)}
          />
        </main>
      </div>
    </div>
  );
};

export default ExamInterface;
```

### Sistema de Proctoring Básico

```typescript
// src/hooks/exams/useExamProctoring.ts
export const useExamProctoring = (examId: string) => {
  const [violations, setViolations] = useState<string[]>([]);
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    // Detectar mudança de aba
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        setViolations(prev => [...prev, 'tab_switch']);
      } else {
        setIsTabActive(true);
      }
    };

    // Detectar tentativas de copiar/colar
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setViolations(prev => [...prev, 'copy_attempt']);
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setViolations(prev => [...prev, 'paste_attempt']);
    };

    // Detectar clique direito
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setViolations(prev => [...prev, 'right_click']);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return {
    violations,
    isTabActive
  };
};
```

---

## ✅ Checklist de Implementação

### Sprint 1: Preparação
- [ ] Criar estrutura de pastas
- [ ] Migrar tipos TypeScript
- [ ] Configurar estrutura de banco de dados
- [ ] Implementar políticas RLS
- [ ] Criar funções do banco de dados

### Sprint 2: Componentes Core
- [ ] Migrar MissionCard
- [ ] Implementar TerminalCore
- [ ] Migrar QuestionDisplay
- [ ] Criar componentes de UI faltantes
- [ ] Implementar ExamInterface

### Sprint 3: Integração Backend
- [ ] Implementar hooks de missões
- [ ] Implementar hooks de exames
- [ ] Criar serviços de validação
- [ ] Integrar com sistema de gamificação
- [ ] Implementar logging de eventos

### Sprint 4: Rotas e Navegação
- [ ] Criar rotas de missões
- [ ] Criar rotas de exames
- [ ] Atualizar router principal
- [ ] Implementar navegação entre páginas
- [ ] Adicionar breadcrumbs

### Sprint 5: Funcionalidades Avançadas
- [ ] Sistema de proctoring
- [ ] Terminal interativo completo
- [ ] Sistema de hints com IA
- [ ] Validação de comandos
- [ ] Resultados detalhados

### Sprint 6: Testes e Otimização
- [ ] Testes unitários dos componentes
- [ ] Testes de integração
- [ ] Otimização de performance
- [ ] Documentação
- [ ] Deploy e monitoramento

---

## 🎯 Critérios de Sucesso

### Funcionalidades Obrigatórias
- ✅ Migração completa dos componentes dos protótipos
- ✅ Integração com sistema de autenticação existente
- ✅ Sistema de gamificação funcionando
- ✅ Terminal interativo operacional
- ✅ Interface de exames completa
- ✅ Persistência de dados no Supabase

### Métricas de Performance
- Tempo de carregamento < 2s
- Responsividade em dispositivos móveis
- Taxa de conclusão de missões > 70%
- Satisfação do usuário > 4.5/5

### Segurança
- Validação de comandos no backend
- Políticas RLS implementadas
- Logs de auditoria funcionando
- Sistema de proctoring básico

---

## 📝 Considerações Finais

Este plano de integração garante que todos os componentes desenvolvidos nos protótipos sejam aproveitados e integrados de forma consistente com a arquitetura existente do projeto Esquads Academy Platform. A abordagem incremental permite validação contínua e reduz riscos de implementação.

A integração seguirá as regras estabelecidas no sistema, mantendo a compatibilidade com Windows, utilizando apenas componentes aprovados e priorizando soluções nativas do ecossistema atual.

Após a conclusão da integração e validação de que todas as funcionalidades estão 100% operacionais, a pasta `paineis` poderá ser removida com segurança.