# Análise de Estrutura - Esquads Academy Platform

## 📊 Status Atual vs PRD Consolidado

### ✅ O que está ALINHADO com o PRD:

1. **Estrutura de Rotas**
   - `/student/*` e `/admin/*` devidamente separados
   - Middleware de autenticação (`StudentProtectedRoute`, `AdminProtectedRoute`) funcionando
   - RLS policies implementadas

2. **Componentes Existentes**
   - Terminal de missões (`MissionTerminal`)
   - Sistema de certificados (`CertificateService`)
   - Autenticação completa com RLS
   - Badges e conquistas implementados
   - Leaderboard funcional

3. **Serviços Implementados**
   - `certificateService.ts` ✅
   - `analyticsService.ts` ✅
   - `authService.ts` ✅
   - `recommendationService.ts` ✅

---

## ⚠️ INCONSISTÊNCIAS CRÍTICAS com PRD:

### 1. **Rota de Gamificação Visível** (PRIORIDADE MÁXIMA)

**Problema:**
- Linha 32 em `StudentLayout.tsx`: `{ icon: Gamepad2, label: 'Gamificação', href: ROUTES.STUDENT_GAMIFICATION }`
- Linha 248 em `Router.tsx`: Rota `/student/gamification` ainda está ativa
- Linha 22 em `constants.ts`: `STUDENT_GAMIFICATION: '/student/gamification'`

**O que o PRD diz:**
> "A lógica de gamificação é executada **no backend**, embutida no fluxo da plataforma, e **não deve aparecer como seção de menu separada**"

**Ação Necessária:**
- ❌ Remover rota `/student/gamification` do Router
- ❌ Remover item "Gamificação" do menu lateral do StudentLayout
- ❌ Remover página `Gamification.tsx` (ou movê-la para área de testes)
- ✅ Integrar funcionalidades de gamificação no Dashboard do estudante

---

### 2. **Falta de GamificationService Backend**

**Problema:**
- Não existe `src/services/gamificationService.ts`
- A lógica de gamificação está dispersa em hooks (`useGamification`, `useUserPoints`)
- Frontend está calculando lógica que deveria ser backend

**O que o PRD diz:**
> "Serviço: `GamificationService` (lógica separada e reativa)"

**Ação Necessária:**
- ✅ Criar `src/services/gamificationService.ts` com:
  - `recordEvent(userId, eventType, metadata)`
  - `evaluateBadges(userId)`
  - `calculateRanking()`
  - `getUserProgress(userId)`
  - `getStudentSummary(userId)`

---

### 3. **Dashboard do Estudante Incompleto**

**Problema:**
- Dashboard atual não exibe dados consolidados de gamificação
- Faltam métricas integradas: XP, Reputação, Badges, Ranking, Missões Ativas

**O que o PRD diz:**
```typescript
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

**Ação Necessária:**
- ✅ Refatorar `StudentDashboard.tsx` para consumir API consolidada
- ✅ Criar endpoint `/api/student/summary` no backend
- ✅ Exibir todos os dados de gamificação de forma integrada

---

### 4. **MissionTerminal precisa de IA integrada**

**Problema:**
- Componente existe mas precisa validar integração com `HintAgent`
- Falta endpoint de validação clara

**O que o PRD diz:**
> "Chatbot IA fornece dicas progressivas (nível 1 → 3)"

**Ação Necessária:**
- ✅ Verificar integração do `MissionTerminal` com IA
- ✅ Garantir endpoint `/api/missions/validate` funcional
- ✅ Implementar `HintAgent` para dicas progressivas

---

### 5. **Falta de Modelagem de Dados no Supabase**

**Problema:**
- Precisa verificar se todas as tabelas do PRD existem:
  - `xp_events` ❓
  - `reputation_events` ❓
  - `user_badges` ❓
  - `badge_definitions` ❓
  - `user_rankings` ❓

**Ação Necessária:**
- ✅ Auditar banco de dados do Supabase
- ✅ Criar migrations para tabelas faltantes
- ✅ Configurar triggers para atualização automática de gamificação

---

## 🎯 Plano de Ação Priorizado

### Sprint 1: Remover Gamificação Visível
1. Remover rota `/student/gamification` do Router
2. Remover item do menu lateral do StudentLayout
3. Remover constante `STUDENT_GAMIFICATION` de `constants.ts`
4. Mover lógica da página para serviço backend

### Sprint 2: Implementar GamificationService
1. Criar `src/services/gamificationService.ts`
2. Implementar métodos de registro de eventos
3. Implementar cálculo de badges automáticos
4. Implementar cálculo de ranking
5. Criar endpoint API para consumo

### Sprint 3: Refatorar Dashboard do Estudante
1. Criar endpoint `/api/student/summary`
2. Refatorar `StudentDashboard.tsx` para exibir dados consolidados
3. Integrar XP, badges, ranking, missões ativas
4. Adicionar recomendações personalizadas via IA

### Sprint 4: Validar e Ajustar
1. Validar MissionTerminal com IA
2. Auditar banco de dados
3. Criar testes automatizados
4. Documentar mudanças

---

## 📈 Métricas de Sucesso

- ✅ Rota `/student/gamification` removida
- ✅ GamificationService implementado e testado
- ✅ Dashboard exibindo dados consolidados
- ✅ Cobertura de testes > 70%
- ✅ Todas as tabelas do PRD existentes no Supabase

---

**Data de Análise:** Outubro 2025  
**Próxima Revisão:** Após Sprint 1

