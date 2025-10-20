# 🛡️ Esquads - Sistema de Gamificação para Cibersegurança

## 📋 Visão Geral

O **Esquads** é uma plataforma de gamificação e avaliação para treinamento em cibersegurança, desenvolvida com TypeScript e React. O sistema oferece missões práticas, simulados de certificação e um sistema de ranking competitivo para profissionais de segurança cloud e cybersecurity.

## 🎯 Características Principais

### 🎮 Sistema de Gamificação
- **Pontuação baseada em XP** com sistema de níveis
- **Badges específicas** para cada missão e conquista
- **Progressão entre níveis** com benefícios desbloqueáveis
- **Ranking competitivo** global e por período
- **Sistema de vidas** para aumentar o desafio

### 🎓 Certificações Suportadas
- **AWS Security Specialty**
- **Microsoft Azure Security Engineer**
- **Google Cloud Professional Cloud Security Engineer**
- **CompTIA Security+**
- **Certificações específicas de cybersecurity**

### 🛠️ Tecnologias Utilizadas
- **TypeScript** para tipagem forte e melhor DX
- **React 18** com hooks modernos
- **Tailwind CSS** para estilização
- **Shadcn/UI** como sistema de componentes
- **Vite** para build e desenvolvimento
- **ESLint** para qualidade de código

## 🏗️ Arquitetura do Sistema

### 📁 Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (Button, Input, etc.)
│   └── gamification/    # Componentes específicos de gamificação
├── hooks/               # Hooks personalizados
├── types/               # Definições de tipos TypeScript
├── pages/               # Páginas da aplicação
├── utils/               # Utilitários e helpers
├── styles/              # Estilos globais
└── examples/            # Exemplos de uso
```

### 🔧 Componentes Principais

#### MissionDashboard
Dashboard principal com sistema de ranking competitivo e filtros avançados.

```typescript
import { MissionDashboard } from '@/components/gamification/MissionDashboard'

<MissionDashboard userId="user_123" />
```

#### CertificationSelector
Seletor de certificações com configuração personalizada de exames.

```typescript
import { CertificationSelector } from '@/components/gamification/CertificationSelector'

<CertificationSelector userId="user_123" />
```

### 🎣 Hooks Personalizados

#### useUserProfile
Gerencia o perfil do usuário, XP, badges e progressão.

```typescript
import { useUserProfile } from '@/hooks'

const { 
  userProfile, 
  updateXP, 
  addBadge, 
  updateLevel 
} = useUserProfile(userId)
```

#### useMissions
Gerencia missões, filtros e progresso.

```typescript
import { useMissions } from '@/hooks'

const { 
  missions, 
  filteredMissions, 
  filters, 
  setFilters, 
  startMission, 
  completeMission 
} = useMissions(userId)
```

#### useCertifications
Gerencia certificações e exames.

```typescript
import { useCertifications } from '@/hooks'

const { 
  certifications, 
  filteredCertifications, 
  startExam, 
  getExamResults 
} = useCertifications(userId)
```

#### useRanking
Gerencia ranking global e leaderboards.

```typescript
import { useRanking } from '@/hooks'

const { 
  globalRanking, 
  userRank, 
  refreshRanking, 
  getLeaderboard 
} = useRanking(userId)
```

## 📊 Tipos e Interfaces

### 🎯 Tipos de Missão

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

enum DifficultyLevel {
  Basic = "BASIC",
  Intermediate = "INTERMEDIATE", 
  Advanced = "ADVANCED",
  Expert = "EXPERT"
}

interface Mission {
  id: string
  title: string
  description: string
  category: MissionCategory
  difficultyLevel: DifficultyLevel
  xpReward: number
  requiredBadge?: string
  isLocked: boolean
  badgeOnCompletion: string
  duration: number
  tools: string[]
  prerequisites: string[]
  isPremium: boolean
  status: MissionStatus
}
```

### 🏆 Tipos de Certificação

```typescript
enum CertificationProvider {
  AWS = "AWS",
  Azure = "AZURE",
  GCP = "GCP",
  CompTIA = "COMPTIA",
  Cisco = "CISCO",
  ISC2 = "ISC2",
  ECCOUNCIL = "ECCOUNCIL",
  ISACA = "ISACA"
}

interface CertificationExam {
  id: string
  provider: CertificationProvider
  title: string
  description: string
  questionCount: number
  difficultyLevel: DifficultyLevel
  duration: number
  passPercentage: number
  questions: ExamQuestion[]
  xpReward: number
  isPremium: boolean
  topics: string[]
  prerequisites: string[]
  successRate: number
}
```

### 👤 Tipos de Usuário

```typescript
interface UserProfile {
  id: string
  username: string
  email: string
  totalXP: number
  currentLevel: number
  completedMissions: string[]
  badges: Badge[]
  lives: number
  maxLives: number
  currentPlan: UserPlan
  globalRanking: number
  preferences: UserPreferences
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  type: BadgeType
  xpReward: number
  earnedAt?: Date
  isNew: boolean
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY"
}
```

### 🏅 Tipos de Ranking

```typescript
interface RankingEntry {
  userId: string
  username: string
  totalXP: number
  level: number
  badges: Badge[]
  completedMissions: number
  completedExams: number
  rank: number
  lastActiveAt: Date
}

interface Leaderboard {
  id: string
  name: string
  type: "GLOBAL" | "MONTHLY" | "WEEKLY" | "CATEGORY"
  category?: MissionCategory
  entries: RankingEntry[]
  totalParticipants: number
  period: {
    start: Date
    end: Date
  }
  rewards: LeaderboardReward[]
}
```

## 🚀 Instalação e Configuração

### 📦 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Git

### 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/esquads/gamification-platform.git
cd gamification-platform
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute o projeto**
```bash
npm run dev
```

### 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificação de tipos
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Preview da build
npm run preview
```

## 📖 Guia de Uso

### 🎮 Como Usar o Sistema de Gamificação

#### 1. Iniciando uma Missão

```typescript
import { useMissions } from '@/hooks'

const { startMission } = useMissions(userId)

const handleStartMission = async (missionId: string) => {
  try {
    await startMission(missionId)
    // Navegar para a interface de gameplay
  } catch (error) {
    console.error('Erro ao iniciar missão:', error)
  }
}
```

#### 2. Completando uma Missão

```typescript
import { useUserProfile } from '@/hooks'

const { updateXP, addBadge, updateLevel } = useUserProfile(userId)

const handleCompleteMission = async (missionId: string, score: number, timeSpent: number) => {
  try {
    // Completar missão
    await completeMission(missionId, score, timeSpent)
    
    // Atualizar XP
    await updateXP(100, missionId, "Missão completada!")
    
    // Adicionar badge se necessário
    if (score >= 90) {
      await addBadge({
        id: "perfect_score",
        name: "Pontuação Perfeita",
        description: "Completou uma missão com 90% ou mais",
        icon: "Star",
        type: "ACHIEVEMENT",
        xpReward: 50,
        rarity: "RARE"
      })
    }
    
    // Verificar level up
    updateLevel()
  } catch (error) {
    console.error('Erro ao completar missão:', error)
  }
}
```

#### 3. Iniciando um Exame

```typescript
import { useCertifications } from '@/hooks'

const { startExam } = useCertifications(userId)

const handleStartExam = async (examId: string) => {
  const config: ExamConfig = {
    difficulty: DifficultyLevel.Intermediate,
    questionCount: 50,
    mode: 'timed',
    topicFocus: 'all',
    timeLimit: 90,
    showExplanations: true,
    allowSkip: false
  }

  try {
    await startExam(examId, config)
    // Navegar para a interface do exame
  } catch (error) {
    console.error('Erro ao iniciar exame:', error)
  }
}
```

### 🎯 Sistema de Filtros

#### Filtros de Missões

```typescript
import { MissionFilters, MissionCategory, DifficultyLevel } from '@/types'

const filters: MissionFilters = {
  search: 'firewall',
  category: MissionCategory.Firewall,
  difficulty: DifficultyLevel.Intermediate,
  status: 'NOT_STARTED',
  sortBy: 'recommended'
}

setFilters(filters)
```

#### Filtros de Certificações

```typescript
import { CertificationFilters, CertificationProvider } from '@/types'

const filters: CertificationFilters = {
  search: 'AWS',
  provider: CertificationProvider.AWS,
  difficulty: DifficultyLevel.Advanced,
  showPremiumOnly: false,
  showFreeOnly: false,
  hasPrerequisites: true,
  sortBy: 'success-rate'
}

setFilters(filters)
```

## 🎨 Customização e Temas

### 🎨 Sistema de Cores

O sistema utiliza variáveis CSS customizadas para cores:

```css
:root {
  --primary: 210 40% 50%;
  --primary-foreground: 0 0% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 210 40% 15%;
  --muted: 210 40% 96%;
  --muted-foreground: 210 40% 45%;
  --accent: 210 40% 96%;
  --accent-foreground: 210 40% 15%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 210 40% 90%;
  --input: 210 40% 90%;
  --ring: 210 40% 50%;
  --background: 0 0% 100%;
  --foreground: 210 40% 15%;
  --card: 0 0% 100%;
  --card-foreground: 210 40% 15%;
}
```

### 🎭 Modo Escuro

```css
.dark {
  --background: 210 40% 8%;
  --foreground: 0 0% 98%;
  --card: 210 40% 8%;
  --card-foreground: 0 0% 98%;
  --popover: 210 40% 8%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 210 40% 8%;
  --secondary: 210 40% 15%;
  --secondary-foreground: 0 0% 98%;
  --muted: 210 40% 15%;
  --muted-foreground: 210 40% 65%;
  --accent: 210 40% 15%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62% 30%;
  --destructive-foreground: 0 0% 98%;
  --border: 210 40% 15%;
  --input: 210 40% 15%;
  --ring: 210 40% 65%;
}
```

## 🧪 Testes

### 🔬 Estrutura de Testes

```typescript
// Exemplo de teste para componente
import { render, screen } from '@testing-library/react'
import { MissionDashboard } from '@/components/gamification/MissionDashboard'

describe('MissionDashboard', () => {
  it('should render mission dashboard correctly', () => {
    render(<MissionDashboard userId="test-user" />)
    
    expect(screen.getByText('Missões de Cibersegurança')).toBeInTheDocument()
    expect(screen.getByText('Escolha uma missão para praticar')).toBeInTheDocument()
  })
})
```

### 🎯 Testes de Hooks

```typescript
// Exemplo de teste para hook
import { renderHook, act } from '@testing-library/react'
import { useUserProfile } from '@/hooks'

describe('useUserProfile', () => {
  it('should update XP correctly', async () => {
    const { result } = renderHook(() => useUserProfile('test-user'))
    
    await act(async () => {
      await result.current.updateXP(100, 'mission_1', 'Test XP')
    })
    
    expect(result.current.userProfile?.totalXP).toBe(1347) // 1247 + 100
  })
})
```

## 📈 Performance e Otimização

### ⚡ Otimizações Implementadas

1. **Lazy Loading** de componentes pesados
2. **Memoização** com `useMemo` e `useCallback`
3. **Virtualização** para listas grandes
4. **Code Splitting** por rotas
5. **Tree Shaking** para bundle otimizado

### 📊 Métricas de Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🔒 Segurança

### 🛡️ Medidas de Segurança

1. **Validação de tipos** com TypeScript
2. **Sanitização** de inputs do usuário
3. **Rate limiting** em APIs
4. **Autenticação** robusta
5. **Autorização** baseada em roles

### 🔐 Boas Práticas

- Nunca exponha chaves de API no frontend
- Use HTTPS em produção
- Implemente CSP (Content Security Policy)
- Valide dados no backend
- Use tokens seguros para sessões

## 🚀 Deploy e Produção

### 🌐 Deploy com Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 🐳 Deploy com Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

### 🔧 Variáveis de Ambiente

```env
# Produção
VITE_API_URL=https://api.esquads.com
VITE_APP_ENV=production
VITE_ANALYTICS_ID=your-analytics-id

# Desenvolvimento
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
```

## 🤝 Contribuição

### 📝 Como Contribuir

1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. **Abra** um Pull Request

### 📋 Padrões de Código

- Use **TypeScript** para todos os arquivos
- Siga as **convenções de nomenclatura**
- Escreva **testes** para novas funcionalidades
- Documente **APIs** e componentes
- Use **commits semânticos**

### 🐛 Reportando Bugs

Use o template de issue para reportar bugs:

```markdown
**Descrição do Bug**
Uma descrição clara do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Versão: [e.g. 1.0.0]
```

## 📚 Recursos Adicionais

### 📖 Documentação

- [Documentação do React](https://react.dev/)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Shadcn/UI](https://ui.shadcn.com/)

### 🎓 Tutoriais

- [Tutorial de Gamificação](docs/gamification-tutorial.md)
- [Guia de Certificações](docs/certifications-guide.md)
- [Sistema de Ranking](docs/ranking-system.md)

### 🔗 Links Úteis

- [Repositório GitHub](https://github.com/esquads/gamification-platform)
- [Documentação da API](https://api.esquads.com/docs)
- [Comunidade Discord](https://discord.gg/esquads)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: [Seu Nome](https://github.com/seu-usuario)
- **Designer UX/UI**: [Nome do Designer](https://github.com/designer)
- **Arquiteto de Software**: [Nome do Arquiteto](https://github.com/arquiteto)

## 🙏 Agradecimentos

- Comunidade React
- Equipe do TypeScript
- Contribuidores do Tailwind CSS
- Equipe do Shadcn/UI
- Todos os contribuidores do projeto

---

**Esquads** - Transformando o aprendizado de cibersegurança em uma experiência gamificada e envolvente! 🛡️🎮
