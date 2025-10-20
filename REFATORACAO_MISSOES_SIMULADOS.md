# 🎯 Refatoração: Missões e Simulados - Baseado em Paineis

**Data:** 17 de Outubro de 2025  
**Referência:** Pasta `/paineis` - Sistema de Gamificação Esquads  
**Objetivo:** Refatorar sistema de missões e simulados usando estrutura comprovada

---

## 📋 Análise da Estrutura Paineis

### Componentes Principais Identificados:

#### 1. **Sistema de Missões** 
- ✅ `MissionCard.jsx` - Card visual com todas funcionalidades
- ✅ `MissionDashboard.tsx` - Dashboard principal
- ✅ `SimulatorTerminal.jsx` - Terminal interativo avançado
- ✅ `MissionFilters` - Filtros complexos
- ✅ `MissionGrid` - Layout de grid responsivo
- ✅ `ProgressionPath` - Visualização de progressão

#### 2. **Sistema de Exames/Simulados**
- ✅ `CertificationSelector.tsx` - Seletor de certificações
- ✅ `ExamInterface` - Interface completa de exame
- ✅ `ExamHeader`, `ExamSidebar`, `ExamTimer` - Componentes modulares
- ✅ `QuestionDisplay`, `QuestionNavigation` - Sistema de questões
- ✅ `ExamResults` - Tela de resultados detalhada

#### 3. **Tipos TypeScript Completos**
- ✅ Enums: `MissionCategory`, `DifficultyLevel`, `CertificationProvider`
- ✅ Interfaces: `Mission`, `CertificationExam`, `UserProfile`, `Badge`
- ✅ Constantes: `XP_REWARDS`, `LEVEL_REQUIREMENTS`, `DIFFICULTY_COLORS`

---

## 🎯 Plano de Refatoração

### Fase 1: Tipos e Estruturas Base ✅
1. Copiar e adaptar tipos do `paineis/src/types/index.ts`
2. Criar enums para categorias de missões e dificuldades
3. Definir interfaces completas

### Fase 2: Componentes de Missões 🔄
1. **MissionCard aprimorado** (baseado em `paineis`)
   - Sistema de locks e prerequisites
   - Indicadores de progresso
   - Badges preview
   - Tools required
   - Premium badge
   
2. **MissionTerminal atualizado** (baseado em `SimulatorTerminal.jsx`)
   - Comandos por categoria
   - Auto-complete inteligente
   - History de comandos
   - Suggestions em tempo real
   - Quick commands buttons

3. **MissionDashboard** (novo)
   - Ranking competitivo
   - Filtros avançados
   - Grid responsivo
   - Progression path visual

### Fase 3: Sistema de Simulados/Exames 🔄
1. **ExamInterface completo**
   - Timer funcional
   - Navegação entre questões
   - Flag system
   - Pause/Resume
   - Keyboard shortcuts
   
2. **Question Types**
   - Multiple choice
   - Code-based questions
   - Scenario questions
   - Image-based questions

3. **ExamResults detalhado**
   - Performance by topic
   - XP rewards panel
   - Badge showcase
   - Social sharing
   - Next steps recommendations

### Fase 4: Integração com Backend ⏳
1. Conectar com GamificationService
2. Registrar eventos (mission_started, mission_completed)
3. Atualizar XP e badges automaticamente
4. Salvar progresso em tempo real

---

## 📊 Estrutura de Arquivos Proposta

```
src/
├── types/
│   ├── missions.ts (ATUALIZAR)
│   ├── exams.ts (CRIAR)
│   └── gamification.ts (baseado em paineis/types)
│
├── components/
│   ├── missions/
│   │   ├── MissionCard.tsx (REFATORAR)
│   │   ├── MissionGrid.tsx (CRIAR)
│   │   ├── MissionFilters.tsx (CRIAR)
│   │   ├── ProgressionPath.tsx (CRIAR)
│   │   └── MissionDashboard.tsx (CRIAR)
│   │
│   ├── missions/terminal/
│   │   ├── MissionTerminal.tsx (REFATORAR)
│   │   ├── TerminalCommand.tsx (CRIAR)
│   │   ├── TerminalOutput.tsx (CRIAR)
│   │   └── TerminalSuggestions.tsx (CRIAR)
│   │
│   ├── exams/
│   │   ├── ExamInterface.tsx (CRIAR)
│   │   ├── ExamHeader.tsx (CRIAR)
│   │   ├── ExamSidebar.tsx (CRIAR)
│   │   ├── ExamTimer.tsx (CRIAR)
│   │   ├── QuestionDisplay.tsx (CRIAR)
│   │   ├── QuestionNavigation.tsx (CRIAR)
│   │   └── ExamResults.tsx (CRIAR)
│   │
│   └── certification/
│       ├── CertificationSelector.tsx (CRIAR)
│       ├── CertificationCard.tsx (CRIAR)
│       └── ExamConfigPanel.tsx (CRIAR)
│
├── hooks/
│   ├── useMissions.ts (ATUALIZAR)
│   ├── useExams.ts (CRIAR)
│   ├── useCertifications.ts (CRIAR)
│   └── useTerminal.ts (CRIAR)
│
├── pages/
│   ├── student/
│   │   ├── Missions.tsx (REFATORAR)
│   │   ├── Mission.tsx (REFATORAR)
│   │   ├── Exams.tsx (CRIAR)
│   │   ├── ExamAttempt.tsx (CRIAR)
│   │   └── Certifications.tsx (CRIAR)
│   │
│   └── admin/
│       ├── Missions.tsx (ATUALIZAR)
│       └── Exams.tsx (ATUALIZAR)
│
└── services/
    ├── missionService.ts (CRIAR)
    ├── examService.ts (CRIAR)
    └── terminalService.ts (CRIAR)
```

---

## 🎨 Features Chave a Implementar

### Mission Card Avançado:
```typescript
interface MissionCardFeatures {
  // Visual
  premiumBadge: boolean;
  lockOverlay: boolean;
  progressBar: boolean;
  completionBadge: boolean;
  
  // Informações
  categoryIcon: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string; // "30 min"
  xpReward: number;
  tools: string[]; // ["Wireshark", "Nmap"]
  prerequisites: string[];
  badges: Badge[];
  
  // Estados
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  progress: number; // 0-100
  isPremium: boolean;
  
  // Ações
  onStart: () => void;
  onContinue: () => void;
  onRepeat: () => void;
  onUpgrade: () => void; // Para premium
}
```

### Terminal Simulator Avançado:
```typescript
interface TerminalFeatures {
  // Comandos
  commandHistory: string[];
  suggestions: string[];
  autoComplete: boolean;
  
  // Outputs
  terminalOutput: TerminalOutput[];
  colors: {
    system: 'cyan';
    command: 'white';
    output: 'gray';
    success: 'green';
    error: 'red';
  };
  
  // Quick Actions
  quickCommands: string[]; // ['help', 'clear', 'ls']
  
  // Comandos por categoria
  availableCommands: {
    Firewall: string[];
    CloudSecurity: string[];
    Forensics: string[];
    NetworkSecurity: string[];
  };
  
  // Handlers
  onCommandExecute: (cmd: string, isCorrect: boolean) => void;
  onProgressUpdate: (progress: number) => void;
}
```

### Exam Interface Completo:
```typescript
interface ExamFeatures {
  // Timer
  duration: number; // em minutos
  timeRemaining: number;
  onTimeUp: () => void;
  
  // Navegação
  currentQuestion: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  onNavigate: (questionNumber: number) => void;
  
  // Respostas
  answers: Record<number, string>;
  flaggedQuestions: number[];
  onAnswerSelect: (questionId: number, answer: string) => void;
  onToggleFlag: (questionId: number) => void;
  
  // Controles
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
  onFinish: () => void;
  
  // Keyboard shortcuts
  shortcuts: {
    'ArrowLeft': 'Previous question';
    'ArrowRight': 'Next question';
    'Ctrl+F': 'Toggle flag';
    '1-4': 'Select option';
  };
  
  // Question Types
  questionTypes: {
    multiple: MultipleChoiceQuestion;
    scenario: ScenarioQuestion;
    code: CodeQuestion;
  };
}
```

---

## 🎯 Categorias de Missões (Baseado em Paineis)

```typescript
enum MissionCategory {
  Firewall = "FIREWALL",
  CloudSecurity = "CLOUD_SECURITY",
  Forensics = "FORENSICS",
  NetworkSecurity = "NETWORK_SECURITY",
  PenetrationTesting = "PENETRATION_TESTING",
  IncidentResponse = "INCIDENT_RESPONSE",
  VulnerabilityAssessment = "VULNERABILITY_ASSESSMENT"
}

// Ícones por categoria
const CATEGORY_ICONS = {
  FIREWALL: 'Shield',
  CLOUD_SECURITY: 'Cloud',
  FORENSICS: 'Search',
  NETWORK_SECURITY: 'Network',
  PENETRATION_TESTING: 'Swords',
  INCIDENT_RESPONSE: 'AlertTriangle',
  VULNERABILITY_ASSESSMENT: 'Bug'
};

// Comandos por categoria
const COMMANDS_BY_CATEGORY = {
  FIREWALL: ['iptables', 'ufw', 'netstat', 'ss', 'nmap'],
  CLOUD_SECURITY: ['aws', 'kubectl', 'docker', 'terraform'],
  FORENSICS: ['volatility', 'autopsy', 'strings', 'hexdump'],
  NETWORK_SECURITY: ['wireshark', 'nmap', 'netcat', 'curl']
};
```

---

## 📈 Sistema de XP e Recompensas

```typescript
const XP_REWARDS = {
  // Missões
  MISSION_BASIC: 100,
  MISSION_INTERMEDIATE: 200,
  MISSION_ADVANCED: 350,
  MISSION_EXPERT: 500,
  
  // Exames
  EXAM_PASSED: 300,
  PERFECT_SCORE_BONUS: 50,
  
  // Bônus
  STREAK_BONUS: 25,
  DAILY_LOGIN: 10,
  FIRST_TRY_SUCCESS: 30
};

const LEVEL_REQUIREMENTS = {
  1: 0,
  2: 500,
  3: 1000,
  4: 1500,
  5: 2000,
  // ... até 10
};
```

---

## 🎨 UI/UX Melhorias (Baseadas em Paineis)

### Cores por Dificuldade:
```typescript
const DIFFICULTY_STYLES = {
  Iniciante: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20'
  },
  Intermediário: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20'
  },
  Avançado: {
    color: 'text-error',
    bg: 'bg-error/10',
    border: 'border-error/20'
  }
};
```

### Animações:
- Hover effects em cards
- Progress bar animations
- Badge reveal animations
- Level up animations
- XP counter animations

### Responsividade:
- Grid adaptável (1-2-3-4 colunas)
- Mobile-first design
- Touch-friendly buttons
- Swipe gestures

---

## 🔄 Integração com Sistema Existente

### 1. GamificationService:
```typescript
// Ao completar missão
await GamificationService.recordEvent(userId, 'mission_completed', {
  mission_id: missionId,
  score: score,
  time_spent: timeSpent,
  difficulty: mission.difficulty
});

// Ao passar em exame
await GamificationService.recordEvent(userId, 'exam_passed', {
  exam_id: examId,
  score: score,
  percentage: percentage
});
```

### 2. HintAgent:
```typescript
// Integrar dicas no terminal
const hint = await hintAgent.getHint({
  missionId,
  userId,
  level: 1,
  currentCode: terminalHistory
});
```

### 3. CertificateService:
```typescript
// Gerar certificado ao completar curso
if (allMissionsCompleted) {
  await CertificateService.getInstance().generateCertificate(
    userId,
    courseId,
    { grade, hoursCompleted, skillsAcquired }
  );
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Setup ✅
- [x] Analisar estrutura paineis
- [x] Documentar features
- [x] Definir plano de refatoração

### Fase 2: Tipos e Estruturas ⏳
- [ ] Copiar tipos de `paineis/types`
- [ ] Adaptar para projeto
- [ ] Criar enums e constantes
- [ ] Definir interfaces completas

### Fase 3: Componentes Core ⏳
- [ ] Refatorar MissionCard
- [ ] Atualizar MissionTerminal
- [ ] Criar MissionDashboard
- [ ] Implementar MissionFilters

### Fase 4: Sistema de Exames ⏳
- [ ] Criar ExamInterface
- [ ] Implementar ExamTimer
- [ ] Criar QuestionDisplay
- [ ] Implementar ExamResults

### Fase 5: Integração ⏳
- [ ] Conectar com Gamification
- [ ] Integrar HintAgent
- [ ] Salvar progresso
- [ ] Testes end-to-end

---

## 🎯 Próximos Passos Imediatos

1. **Copiar tipos base** do `paineis/types/index.ts`
2. **Criar `src/types/gamification.ts`** completo
3. **Refatorar `MissionCard`** com features do paineis
4. **Atualizar `MissionTerminal`** com comandos por categoria
5. **Criar `ExamInterface`** completo

---

## 📊 Métricas de Sucesso

- ✅ Todos tipos TypeScript definidos
- ✅ MissionCard com todas features
- ✅ Terminal com auto-complete funcional
- ✅ Exam interface com timer e navegação
- ✅ Integração completa com gamificação
- ✅ Testes unitários para componentes críticos

---

**Status:** 📋 Planejamento Concluído - Pronto para Implementação  
**Próxima Ação:** Copiar e adaptar tipos do paineis

