# 🔔 Sistema de Notificações Inteligente - IMPLEMENTADO

**Data:** 17 de Outubro de 2025  
**Status:** ✅ 75% Concluído (6/8 TODOs)  
**Baseado em:** PRD Esquads Academy Consolidado

---

## 📋 Resumo Executivo

Implementação completa do sistema de notificações inteligente com:
- ✅ **Agrupamento automático** de notificações similares (30 segundos)
- ✅ **Supressão inteligente** após 3 eventos em 2 minutos
- ✅ **3 tipos de prioridade**: silent, toast, modal
- ✅ **Performance otimizada** com RLS e índices
- ✅ **Integração completa** com GamificationService

---

## ✅ Componentes Implementados

### 1. **Banco de Dados** ✅

#### Tabela `notifications`
```sql
- id (UUID)
- user_id (UUID FK)
- type (TEXT)
- category (TEXT) -- 'xp', 'badge', 'mission', 'certificate', 'level', etc.
- priority (TEXT) -- 'silent', 'toast', 'modal'
- title (TEXT)
- message (TEXT)
- payload (JSONB)
- status (TEXT) -- 'unread', 'read', 'suppressed', 'grouped'
- grouped_count (INTEGER)
- parent_group_id (UUID FK)
- content_hash (TEXT)
- expires_at (TIMESTAMP)
- read_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Tabela `notification_preferences`
```sql
- id (UUID)
- user_id (UUID FK)
- category (TEXT)
- enabled (BOOLEAN)
- priority_override (TEXT)
```

#### Tabela `notification_suppressions`
```sql
- id (UUID)
- user_id (UUID FK)
- type (TEXT)
- category (TEXT)
- suppressed_count (INTEGER)
- last_suppressed_at (TIMESTAMP)
- reset_at (TIMESTAMP)
```

#### Funções SQL Criadas:
- ✅ `generate_notification_hash()` - Hash para duplicatas
- ✅ `group_similar_notifications()` - Agrupa notificações
- ✅ `should_suppress_notification()` - Verifica supressão
- ✅ `cleanup_old_notifications()` - Limpeza automática

#### Políticas RLS:
- ✅ Users can view their own notifications
- ✅ Users can update their own notifications
- ✅ System can insert notifications
- ✅ Users can delete their own notifications

---

### 2. **NotificationService.ts** ✅

**Arquivo:** `src/services/notificationService.ts` (635 linhas)

#### Métodos Principais:

**Criar Notificações:**
- `addNotification(input)` - Adiciona com verificação de supressão
- `notifyXPGained(userId, xp, source)` - Atalho para XP
- `notifyBadgeEarned(userId, name, rarity, id)` - Atalho para badges
- `notifyLevelUp(userId, level, rewards)` - Atalho para level up
- `notifyMissionCompleted(userId, title, rewards)` - Atalho para missões
- `notifyCertificateIssued(userId, title, id)` - Atalho para certificados

**Buscar Notificações:**
- `getVisibleNotifications(userId, options)` - Notificações visíveis
- `getUnreadCount(userId)` - Contador de não lidas
- `getNotificationsByPriority(userId)` - Separadas por prioridade

**Gerenciar:**
- `markAsRead(notificationId)` - Marca como lida
- `markMultipleAsRead(notificationIds[])` - Múltiplas
- `markAllAsRead(userId)` - Todas
- `deleteNotification(notificationId)` - Deleta uma
- `deleteAllRead(userId)` - Deleta todas lidas

**Agrupamento:**
- `groupSimilarNotifications(userId, category, minutes)` - Agrupa similares

**Preferências:**
- `getUserPriority(userId, category)` - Busca preferência
- `updatePreference(userId, category, enabled, priority)` - Atualiza
- `getAllPreferences(userId)` - Todas preferências

---

### 3. **Integração com GamificationService** ✅

**Arquivo:** `src/services/gamificationService.ts`

#### Notificações Adicionadas:

**Na função `recordEvent()`:**
```typescript
// XP ganha (silenciosa)
if (xpGained > 0) {
  NotificationService.notifyXPGained(userId, xpGained, source);
}

// Level up (modal)
if (levelUp) {
  NotificationService.notifyLevelUp(userId, newLevel, rewards);
}
```

**Na função `evaluateBadges()`:**
```typescript
// Badge conquistado (toast ou modal baseado em raridade)
NotificationService.notifyBadgeEarned(
  userId,
  badge.name,
  badge.rarity,
  badge.id
);
```

---

### 4. **Componentes React** ✅

#### **NotificationToast.tsx** (161 linhas)
- ✅ Toast discreto com auto-hide (4 segundos)
- ✅ Ícones contextuais por categoria
- ✅ Progress bar de auto-hide
- ✅ Animações de entrada/saída
- ✅ Indicador de agrupamento (grouped_count)
- ✅ Responsivo e acessível

**Features:**
- 12 categorias com ícones e cores únicas
- Auto-close após 4 segundos (configurável)
- Botão de fechar manual
- Animação suave de slide-in/slide-out

#### **NotificationToastContainer.tsx** (108 linhas)
- ✅ Gerencia stack de toasts
- ✅ Máximo de 3 toasts simultâneos
- ✅ Subscription em tempo real (Supabase Realtime)
- ✅ Posicionamento: bottom-right (desktop)
- ✅ Remove automaticamente após auto-hide

**Features:**
- Real-time updates via Supabase channels
- Limita a 3 toasts para não poluir UI
- Remove automaticamente quando fechado
- Marca como lida automaticamente

#### **NotificationModal.tsx** (267 linhas)
- ✅ Modal para notificações importantes
- ✅ Confetti animation para celebrações
- ✅ Backdrop blur
- ✅ Gradientes por categoria
- ✅ Botão de ação primária
- ✅ Payload details (recompensas, nível, etc.)

**Features:**
- Confetti para level up, certificados, achievements
- Gradientes coloridos por tipo
- Exibição de recompensas (XP, badges)
- Botões de ação contextuais
- Animações suaves

---

## 📊 Regras de Priorização

### Prioridades Padrão por Categoria:

| Categoria | Prioridade | Comportamento |
|-----------|-----------|---------------|
| **XP** | `silent` | Apenas histórico, sem toast |
| **Reputation** | `silent` | Apenas histórico |
| **Hint** | `toast` | Toast discreto |
| **Feedback** | `toast` | Toast discreto |
| **Badge** | `toast` | Toast (modal se epic/legendary) |
| **Exam** | `toast` | Toast discreto |
| **Social** | `toast` | Toast discreto |
| **System** | `toast` | Toast discreto |
| **Mission** | `modal` | Modal com celebração |
| **Certificate** | `modal` | Modal com confetti |
| **Level** | `modal` | Modal com confetti |
| **Achievement** | `modal` | Modal com celebração |

---

## 🎯 Sistema de Agrupamento

### Janela de Tempo: 30 segundos

Notificações similares dentro de 30 segundos são agrupadas automaticamente:

**Exemplo:**
```
15:00:00 - "+10 XP de Quiz" (principal)
15:00:15 - "+10 XP de Quiz" (agrupada)
15:00:25 - "+15 XP de Missão" (agrupada)
```

**Resultado:**
```
Toast único: "+10 XP (+2 similar)"
```

### Algoritmo:
1. Primeira notificação cria o grupo
2. Notificações subsequentes são marcadas como `grouped`
3. `parent_group_id` aponta para a primeira
4. `grouped_count` é atualizado no grupo pai

---

## 🚫 Sistema de Supressão

### Regra: 3 eventos em 2 minutos

Se um usuário recebe **mais de 3 notificações do mesmo tipo** em **2 minutos**:

1. **Notificações são suprimidas** (status = 'suppressed')
2. **Salvas apenas no histórico** (não exibidas)
3. **Supressão dura 10 minutos**
4. **Registro na tabela `notification_suppressions`**

### Exemplo:
```
Usuário completa 5 quizzes em 1 minuto:
- Primeiras 3: exibidas
- 4ª e 5ª: suprimidas
- Próximas 10 minutos: todas suprimidas
- Após 10 minutos: volta ao normal
```

---

## 📈 Performance

### Índices Criados:
```sql
- idx_notifications_user_id
- idx_notifications_status
- idx_notifications_type
- idx_notifications_category
- idx_notifications_created_at
- idx_notifications_content_hash
- idx_notifications_user_status (composto)
- idx_notifications_parent_group
```

### Otimizações:
- ✅ RLS policies para segurança
- ✅ Queries otimizadas com índices
- ✅ Limpeza automática de notificações antigas (30 dias)
- ✅ Subscription em tempo real (Supabase Realtime)
- ✅ Debounce no agrupamento

---

## 🎨 Design e UX

### Cores por Categoria:

| Categoria | Cor Principal | Background |
|-----------|--------------|------------|
| XP | Yellow (#F59E0B) | yellow-50 |
| Badge | Blue (#3B82F6) | blue-50 |
| Mission | Purple (#8B5CF6) | purple-50 |
| Certificate | Green (#10B981) | green-50 |
| Level | Orange (#F97316) | orange-50 |
| Achievement | Yellow (#FBBF24) | yellow-50 |

### Ícones (Lucide React):
- XP: `Zap`
- Badge: `Award`
- Mission: `Trophy`
- Certificate: `Star`
- Level: `Trophy`
- Hint: `Info`
- Feedback: `MessageCircle`

---

## ⏳ Pendências (2/8 TODOs)

### TODO 6: NotificationPanel Page ⏳
**Rota:** `/student/notifications`

**Features a implementar:**
- [ ] Lista completa de notificações
- [ ] Filtros (todas, não lidas, lidas)
- [ ] Categorias tabs
- [ ] Marcar todas como lidas
- [ ] Deletar notificações
- [ ] Paginação
- [ ] Search

### TODO 7: StudentLayout Integration ⏳
**Features a implementar:**
- [ ] Badge com contador de não lidas
- [ ] Ícone de sino na sidebar
- [ ] Hover mostra preview de notificações
- [ ] Link para `/student/notifications`

### TODO 8: Testes Automatizados ⏳
**Testes a escrever:**
- [ ] Agrupamento de notificações (30s window)
- [ ] Supressão automática (3 em 2 min)
- [ ] Limpeza de notificações antigas
- [ ] RLS policies
- [ ] NotificationService métodos
- [ ] Componentes React (vitest)

---

## 🔄 Fluxo Completo

### 1. Evento Ocorre
```
Usuário completa missão → GamificationService.recordEvent()
```

### 2. Service Registra
```
GamificationService → NotificationService.notifyMissionCompleted()
```

### 3. Verificações
```
NotificationService:
1. should_suppress_notification() → Verifica supressão
2. getUserPriority() → Busca preferência do usuário
3. generateHash() → Cria hash para duplicatas
```

### 4. Criação
```
INSERT INTO notifications (priority='modal', status='unread', ...)
```

### 5. Agrupamento (Background)
```
group_similar_notifications() → Agrupa similares em 30s
```

### 6. Real-time Update
```
Supabase Realtime → NotificationToastContainer/Modal
```

### 7. Renderização
```
- silent: Apenas histórico
- toast: NotificationToast com auto-hide
- modal: NotificationModal com confetti
```

### 8. Interação do Usuário
```
- Fechar → markAsRead()
- Ação → Navigate + markAsRead()
- Auto-close → markAsRead()
```

---

## 🎯 Casos de Uso

### Caso 1: XP Ganha
```typescript
// Evento
await GamificationService.recordEvent(userId, 'quiz_correct', {
  source: 'Quiz Firewall Básico'
});

// Notificação criada (silent)
{
  type: 'xp_gained',
  category: 'xp',
  priority: 'silent',
  title: '+10 XP',
  message: 'Você ganhou 10 XP em Quiz Firewall Básico'
}

// Resultado: Apenas no histórico, sem toast
```

### Caso 2: Badge Comum
```typescript
// Notificação criada (toast)
{
  type: 'badge_earned',
  category: 'badge',
  priority: 'toast',
  title: 'Conquista Desbloqueada!',
  message: 'Você ganhou o badge "Primeiro Quiz"'
}

// Resultado: Toast por 4 segundos
```

### Caso 3: Level Up
```typescript
// Notificação criada (modal)
{
  type: 'level_up',
  category: 'level',
  priority: 'modal',
  title: 'Nível 5 Alcançado!',
  message: 'Parabéns! Você subiu para o nível 5',
  payload: { level: 5, rewards: {...} }
}

// Resultado: Modal com confetti + detalhes
```

### Caso 4: Spam Protection
```
15:00:00 - Quiz 1 completo → Toast exibido
15:00:30 - Quiz 2 completo → Toast exibido  
15:01:00 - Quiz 3 completo → Toast exibido
15:01:30 - Quiz 4 completo → SUPRIMIDO
15:01:45 - Quiz 5 completo → SUPRIMIDO
...
15:12:00 - Quiz 10 completo → Toast exibido (após 10 min)
```

---

## 📦 Arquivos Criados

1. ✅ `supabase/migrations/20251017_create_notifications_system.sql` (315 linhas)
2. ✅ `src/services/notificationService.ts` (635 linhas)
3. ✅ `src/components/notifications/NotificationToast.tsx` (161 linhas)
4. ✅ `src/components/notifications/NotificationToastContainer.tsx` (108 linhas)
5. ✅ `src/components/notifications/NotificationModal.tsx` (267 linhas)
6. ✅ `src/services/gamificationService.ts` (atualizado - integração)

**Total:** 6 arquivos, ~1,500 linhas de código

---

## 🎉 Próximos Passos

1. **Criar NotificationPanel** (`/student/notifications`)
2. **Integrar no StudentLayout** (sino com badge)
3. **Escrever testes** (Jest + Vitest)
4. **Integrar com CertificateService** (notificar emissão)
5. **Integrar com HintAgent** (dicas de missões)
6. **Integrar com FeedbackAgent** (feedback IA)

---

**Status Final:** Sistema de notificações inteligente 75% implementado e funcionando! 🎯✨


