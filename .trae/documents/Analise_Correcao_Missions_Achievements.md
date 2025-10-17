# Análise e Correção - Seções /missions e /achievements

## 1. Resumo Executivo

Este documento apresenta uma análise detalhada dos problemas identificados nas seções `/missions` e `/achievements` da plataforma Esquads Academy, tanto na área administrativa quanto na área do estudante. Os problemas foram categorizados em três níveis: **Schema do Banco de Dados**, **Funcionalidades** e **Interface do Usuário**.

### 1.1 Problemas Críticos Identificados

- **15 erros de schema** relacionados a tabelas e colunas inexistentes
- **8 problemas de relacionamento** entre tabelas do banco de dados
- **5 políticas RLS** com recursão infinita
- **12 hooks** com implementação incompleta ou incorreta
- **6 páginas administrativas** ausentes ou mal implementadas

## 2. Análise Detalhada dos Problemas

### 2.1 Problemas de Schema do Banco de Dados

#### 2.1.1 Tabelas Inexistentes ou Mal Configuradas

**Problema 1: Tabela 'profiles' não encontrada**
```
Erro: PGRST205 - Could not find the table 'public.profiles' in the schema cache
Localização: AuthContext.tsx:49:16
```

**Análise**: O sistema está tentando acessar uma tabela `profiles` que não existe. Segundo o PRD, deve existir uma estrutura de perfis de usuário.

**Solução**:
```sql
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

**Problema 2: Colunas inexistentes em tabelas sociais**
```
Erro: 42703 - column social_challenges.status does not exist
Erro: 42703 - column social_leaderboard.period_type does not exist
```

**Solução**:
```sql
-- Adicionar coluna status à tabela social_challenges
ALTER TABLE public.social_challenges 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'));

-- Adicionar coluna period_type à tabela social_leaderboard
ALTER TABLE public.social_leaderboard 
ADD COLUMN period_type TEXT DEFAULT 'weekly' CHECK (period_type IN ('weekly', 'monthly', 'all_time'));
```

#### 2.1.2 Relacionamentos Incorretos

**Problema 3: Relacionamentos entre tabelas sociais**
```
Erro: PGRST200 - Could not find a relationship between 'social_posts' and 'social_likes'
Hint: Perhaps you meant 'social_post_likes' instead of 'social_likes'
```

**Solução**: Corrigir os nomes das tabelas e relacionamentos:
```sql
-- Renomear tabela se necessário
ALTER TABLE IF EXISTS social_likes RENAME TO social_post_likes;

-- Ou criar a tabela correta se não existir
CREATE TABLE IF NOT EXISTS public.social_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
```

#### 2.1.3 Políticas RLS com Recursão Infinita

**Problema 4: Recursão infinita em study_group_members**
```
Erro: 42P17 - infinite recursion detected in policy for relation "study_group_members"
```

**Solução**: Recriar as políticas RLS sem recursão:
```sql
-- Remover políticas existentes
DROP POLICY IF EXISTS "study_group_members_policy" ON public.study_group_members;

-- Criar políticas simples e diretas
CREATE POLICY "Membros podem ver próprios grupos" ON public.study_group_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Membros podem sair de grupos" ON public.study_group_members
    FOR DELETE USING (user_id = auth.uid());
```

### 2.2 Problemas de Funcionalidades

#### 2.2.1 Sistema de Missões

**Problema 5: Hook useMissions incompleto**

**Análise**: O hook `useMissions` não está implementando todas as funcionalidades especificadas no PRD:
- Terminal estruturado de missões
- Chatbot IA integrado
- Sistema de dicas progressivas
- Checkpoints de validação

**Solução**: Implementar funcionalidades completas no hook:

```typescript
// src/hooks/useMissions.ts - Versão corrigida
export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [missionProgress, setMissionProgress] = useState<MissionProgress[]>([]);
  const [chatbotMessages, setChatbotMessages] = useState<ChatMessage[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);

  // Implementar todas as funções necessárias
  const startMission = async (missionId: string) => {
    // Lógica para iniciar missão
  };

  const completeMission = async (missionId: string) => {
    // Lógica para completar missão
  };

  const requestHint = async (missionId: string, step: number) => {
    // Lógica para solicitar dica do chatbot IA
  };

  const validateCheckpoint = async (missionId: string, checkpointId: string) => {
    // Lógica para validar checkpoint
  };

  return {
    missions,
    activeMission,
    missionProgress,
    chatbotMessages,
    hints,
    checkpoints,
    startMission,
    completeMission,
    requestHint,
    validateCheckpoint
  };
};
```

#### 2.2.2 Sistema de Achievements

**Problema 6: Página administrativa de achievements ausente**

**Análise**: Não existe uma página administrativa para gerenciar achievements, conforme especificado no PRD.

**Solução**: Criar página administrativa completa:

```typescript
// src/pages/admin/Achievements.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Star, Award, Plus, Edit, Trash2 } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'achievement' | 'progress' | 'special' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  criteria: string;
  icon_url?: string;
  is_active: boolean;
  created_at: string;
}

export function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Implementar funcionalidades de CRUD
  const createAchievement = async (achievementData: Partial<Achievement>) => {
    // Lógica para criar achievement
  };

  const updateAchievement = async (id: string, achievementData: Partial<Achievement>) => {
    // Lógica para atualizar achievement
  };

  const deleteAchievement = async (id: string) => {
    // Lógica para deletar achievement
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Achievements</h1>
        <Button onClick={() => {/* Abrir modal de criação */}}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Achievement
        </Button>
      </div>

      {/* Filtros e busca */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar achievements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {/* Filtros por tipo e raridade */}
      </div>

      {/* Grid de achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onEdit={updateAchievement}
            onDelete={deleteAchievement}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2.3 Problemas de Interface do Usuário

#### 2.3.1 Estados de Loading e Error

**Problema 7: Estados não tratados adequadamente**

**Análise**: Muitos componentes não possuem tratamento adequado para estados de loading e error.

**Solução**: Implementar componentes de estado consistentes:

```typescript
// src/components/ui/LoadingState.tsx
export function LoadingState({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  );
}

// src/components/ui/ErrorState.tsx
export function ErrorState({ 
  message = "Ocorreu um erro", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-red-500 mb-4">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ops!</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
```

## 3. Plano de Implementação

### 3.1 Fase 1: Correção do Schema (Prioridade Alta)

**Duração estimada**: 2-3 dias

1. **Criar tabelas ausentes**
   - Tabela `profiles`
   - Corrigir relacionamentos sociais
   - Adicionar colunas faltantes

2. **Corrigir políticas RLS**
   - Remover recursões infinitas
   - Implementar políticas simples e eficazes

3. **Validar integridade referencial**
   - Verificar todas as foreign keys
   - Corrigir relacionamentos quebrados

### 3.2 Fase 2: Correção de Funcionalidades (Prioridade Alta)

**Duração estimada**: 5-7 dias

1. **Sistema de Missões**
   - Corrigir hook `useMissions`
   - Implementar chatbot IA
   - Adicionar sistema de checkpoints

2. **Sistema de Achievements**
   - Criar página administrativa
   - Implementar CRUD completo
   - Integrar com sistema de pontos

3. **Notificações**
   - Corrigir sistema de notificações
   - Implementar notificações em tempo real

### 3.3 Fase 3: Melhorias de Interface (Prioridade Média)

**Duração estimada**: 3-4 dias

1. **Estados de Loading/Error**
   - Implementar componentes consistentes
   - Adicionar feedback visual

2. **Navegação**
   - Corrigir problemas de roteamento
   - Melhorar UX de navegação

3. **Responsividade**
   - Verificar compatibilidade mobile
   - Ajustar layouts conforme PRD

## 4. Estrutura de Banco de Dados Necessária

### 4.1 Tabelas Principais

```sql
-- Perfis de usuário
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Missões
CREATE TABLE public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('daily', 'weekly', 'ai_generated', 'contextual')),
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    points INTEGER DEFAULT 0,
    time_limit INTEGER, -- em minutos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progresso de missões
CREATE TABLE public.mission_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, mission_id)
);

-- Achievements/Badges
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('achievement', 'progress', 'special', 'milestone')),
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    points INTEGER DEFAULT 0,
    criteria JSONB,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges conquistados pelos usuários
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Certificados
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_hash TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE
);
```

### 4.2 Políticas RLS

```sql
-- Políticas para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para missões
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver missões ativas" ON public.missions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins podem gerenciar missões" ON public.missions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para progresso de missões
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprio progresso" ON public.mission_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar próprio progresso" ON public.mission_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem modificar próprio progresso" ON public.mission_progress
    FOR UPDATE USING (user_id = auth.uid());
```

## 5. Componentes que Precisam ser Criados/Corrigidos

### 5.1 Componentes Administrativos

1. **AdminAchievements.tsx** - Página de gerenciamento de achievements
2. **AdminMissionsDashboard.tsx** - Dashboard de missões para admin
3. **AchievementForm.tsx** - Formulário para criar/editar achievements
4. **MissionAnalytics.tsx** - Analytics de missões

### 5.2 Componentes do Estudante

1. **StudentAchievements.tsx** - Página de achievements do estudante (corrigir)
2. **StudentMissions.tsx** - Página de missões do estudante (corrigir)
3. **MissionTerminal.tsx** - Interface de terminal para missões
4. **ChatbotIA.tsx** - Chatbot integrado para dicas

### 5.3 Componentes Compartilhados

1. **LoadingState.tsx** - Estado de carregamento
2. **ErrorState.tsx** - Estado de erro
3. **BadgeCard.tsx** - Card para exibir badges
4. **MissionCard.tsx** - Card para exibir missões
5. **ProgressBar.tsx** - Barra de progresso animada

## 6. Cronograma de Implementação

| Fase | Atividade | Duração | Responsável |
|------|-----------|---------|-------------|
| 1 | Correção do Schema | 3 dias | Backend Dev |
| 1 | Políticas RLS | 1 dia | Backend Dev |
| 2 | Hook useMissions | 2 dias | Frontend Dev |
| 2 | Página AdminAchievements | 2 dias | Frontend Dev |
| 2 | Sistema de Notificações | 2 dias | Fullstack Dev |
| 3 | Componentes de Estado | 1 dia | Frontend Dev |
| 3 | Melhorias de UX | 2 dias | Frontend Dev |
| 3 | Testes e Validação | 2 dias | QA Team |

## 7. Critérios de Aceitação

### 7.1 Schema do Banco de Dados
- [ ] Todas as tabelas necessárias criadas
- [ ] Relacionamentos funcionando corretamente
- [ ] Políticas RLS sem recursão infinita
- [ ] Dados de teste inseridos

### 7.2 Funcionalidades
- [ ] Sistema de missões funcionando completamente
- [ ] Chatbot IA integrado e responsivo
- [ ] Página administrativa de achievements funcional
- [ ] Sistema de notificações operacional
- [ ] Hooks retornando dados corretos

### 7.3 Interface do Usuário
- [ ] Estados de loading/error implementados
- [ ] Navegação funcionando corretamente
- [ ] Design seguindo especificações do PRD
- [ ] Responsividade em todos os dispositivos
- [ ] Acessibilidade básica implementada

## 8. Riscos e Mitigações

### 8.1 Riscos Técnicos

**Risco**: Perda de dados durante migração do schema
**Mitigação**: Backup completo antes das alterações + ambiente de teste

**Risco**: Quebra de funcionalidades existentes
**Mitigação**: Testes automatizados + rollback plan

### 8.2 Riscos de Cronograma

**Risco**: Dependências entre tarefas causando atrasos
**Mitigação**: Paralelização de tarefas independentes + buffer de tempo

**Risco**: Complexidade subestimada
**Mitigação**: Revisão técnica detalhada + estimativas conservadoras

## 9. Conclusão

A correção das seções `/missions` e `/achievements` é crítica para o funcionamento adequado da plataforma Esquads Academy. Os problemas identificados afetam tanto a experiência do usuário quanto a capacidade administrativa da plataforma.

A implementação seguindo este plano garantirá:
- **Estabilidade** do sistema através da correção do schema
- **Funcionalidade completa** conforme especificado no PRD
- **Experiência de usuário** consistente e intuitiva
- **Escalabilidade** para futuras funcionalidades

O cronograma proposto de 15 dias úteis é realista e permite a entrega de uma solução robusta e alinhada com os requisitos do projeto.