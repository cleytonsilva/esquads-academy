# Documento de Correções Críticas - Esquads Academy Platform

## 1. Análise dos Problemas Identificados

### 1.1 Problemas Críticos nos Logs de Erro

**Erro 1: "Perfil do usuário não encontrado"**
- **Localização**: `aiMissionGenerator.ts:397`
- **Causa**: Tabela `user_profiles` não existe ou não possui dados
- **Impacto**: Sistema de missões personalizadas não funciona

**Erro 2: "Cannot coerce the result to a single JSON object"**
- **Localização**: `recommendationService.ts:23`
- **Causa**: Query retorna 0 rows ao buscar perfil do usuário
- **Impacto**: Sistema de recomendações falha completamente

**Erro 3: "Erro ao buscar certificados"**
- **Localização**: `certificateService.ts:79`
- **Causa**: Estrutura de tabelas de certificados incompleta
- **Impacto**: Funcionalidade de certificados não operacional

### 1.2 Problemas de Estrutura de Dados

**Tabelas Faltantes ou Incompletas:**
- `user_profiles` - Essencial para personalização
- `course_enrollments` - Necessária para tracking de progresso
- `certificates` - Requerida para sistema de certificação
- `certificate_templates` - Templates de certificados
- `mission_progress` - Progresso das missões
- `user_badges` - Sistema de gamificação

**Políticas RLS Inadequadas:**
- Políticas muito restritivas impedindo acesso a dados
- Falta de políticas para tabelas críticas
- Inconsistências entre tabelas relacionadas

## 2. Soluções Técnicas Específicas

### 2.1 Correção da Estrutura de Dados

#### 2.1.1 Criação da Tabela user_profiles
```sql
-- Criar tabela user_profiles com estrutura completa
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT '{}',
  skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  learning_goals TEXT[] DEFAULT '{}',
  preferred_duration TEXT DEFAULT 'medium' CHECK (preferred_duration IN ('short', 'medium', 'long')),
  completed_courses TEXT[] DEFAULT '{}',
  current_courses TEXT[] DEFAULT '{}',
  favorite_categories TEXT[] DEFAULT '{}',
  learning_style TEXT DEFAULT 'visual' CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  time_availability TEXT DEFAULT 'medium' CHECK (time_availability IN ('low', 'medium', 'high')),
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  activity_pattern TEXT DEFAULT 'mixed',
  difficulty_preference TEXT DEFAULT 'medium',
  preferred_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### 2.1.2 Criação da Tabela course_enrollments
```sql
-- Criar tabela course_enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped')),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  time_spent INTEGER DEFAULT 0, -- em minutos
  UNIQUE(user_id, course_id)
);
```

#### 2.1.3 Correção da Tabela certificates
```sql
-- Atualizar tabela certificates com estrutura completa
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS course_title TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS instructor_name TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS completion_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS certificate_hash TEXT UNIQUE;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS blockchain_verified BOOLEAN DEFAULT false;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS skills_acquired TEXT[] DEFAULT '{}';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS grade DECIMAL(5,2);
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS hours_completed INTEGER;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS verification_url TEXT;
```

### 2.2 Correção das Políticas RLS

#### 2.2.1 Políticas para user_profiles
```sql
-- RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Permitir que admins vejam todos os perfis
DROP POLICY IF EXISTS "user_profiles_admin_access" ON public.user_profiles;
CREATE POLICY "user_profiles_admin_access" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 2.2.2 Políticas para course_enrollments
```sql
-- RLS para course_enrollments
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select_own" ON public.course_enrollments;
CREATE POLICY "enrollments_select_own" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_insert_own" ON public.course_enrollments;
CREATE POLICY "enrollments_insert_own" ON public.course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_update_own" ON public.course_enrollments;
CREATE POLICY "enrollments_update_own" ON public.course_enrollments
  FOR UPDATE USING (auth.uid() = user_id);
```

### 2.3 Correções nos Serviços

#### 2.3.1 Correção do recommendationService.ts
```typescript
// Função corrigida para getUserProfile
static async getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Primeiro verificar se user_profiles existe
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Usar maybeSingle() em vez de single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Se não encontrou perfil, criar um padrão
    if (!profile) {
      const defaultProfile: Partial<UserProfile> = {
        user_id: userId,
        interests: [],
        skill_level: 'beginner',
        learning_goals: [],
        preferred_duration: 'medium',
        completed_courses: [],
        current_courses: [],
        favorite_categories: [],
        learning_style: 'visual',
        time_availability: 'medium',
        level: 1,
        total_points: 0
      };

      // Tentar criar perfil padrão
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar perfil padrão:', createError);
        return null;
      }

      return newProfile;
    }

    return profile;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
}
```

#### 2.3.2 Correção do aiMissionGenerator.ts
```typescript
// Função corrigida para generatePersonalizedMissions
export async function generatePersonalizedMissions(userId: string): Promise<GeneratedMission[]> {
  try {
    // Buscar perfil do usuário com fallback
    let profile;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      profile = data;
    } catch (error) {
      console.log('Tabela user_profiles não encontrada, usando dados da tabela users');
    }

    // Se não encontrou perfil, criar um básico
    if (!profile) {
      profile = {
        user_id: userId,
        level: 1,
        total_points: 0,
        skill_level: 'beginner',
        preferred_categories: ['geral'],
        activity_pattern: 'mixed',
        difficulty_preference: 'medium',
        learning_style: 'visual'
      };
    }

    // Buscar progresso dos cursos com fallback
    let courseProgress = [];
    try {
      const { data } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          progress_percentage,
          status,
          courses(title, category)
        `)
        .eq('user_id', userId);
      
      courseProgress = data || [];
    } catch (error) {
      console.log('Tabela course_enrollments não encontrada, usando dados alternativos');
    }

    // Buscar missões existentes
    let existingMissions = [];
    try {
      const { data } = await supabase
        .from('mission_progress')
        .select('mission_id, status')
        .eq('user_id', userId)
        .in('status', ['active', 'pending']);
      
      existingMissions = data || [];
    } catch (error) {
      console.log('Tabela mission_progress não encontrada');
    }

    // Gerar missões usando o gerador
    return await aiMissionGenerator.generateMissions(profile, courseProgress, existingMissions);
  } catch (error) {
    console.error('Erro ao gerar missões personalizadas:', error);
    return [];
  }
}
```

#### 2.3.3 Correção do certificateService.ts
```typescript
// Função corrigida para getUserCertificates
async getUserCertificates(userId: string): Promise<Certificate[]> {
  try {
    // Verificar se a tabela certificates existe
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('completion_date', { ascending: false });

    if (error) {
      // Se a tabela não existir, retornar array vazio
      if (error.code === '42P01') {
        console.log('Tabela certificates não encontrada');
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    return [];
  }
}
```

## 3. Plano de Implementação Prioritário

### 3.1 Fase 1: Correções Críticas Imediatas (Prioridade Alta)

**Duração Estimada: 2-3 horas**

1. **Criar Migration de Correção Crítica**
   - Criar tabelas faltantes (user_profiles, course_enrollments)
   - Corrigir estrutura da tabela certificates
   - Implementar políticas RLS adequadas

2. **Corrigir Serviços Principais**
   - Atualizar recommendationService.ts
   - Corrigir aiMissionGenerator.ts
   - Ajustar certificateService.ts

3. **Implementar Fallbacks**
   - Adicionar tratamento de erro robusto
   - Criar dados padrão quando necessário
   - Implementar verificações de existência de tabelas

### 3.2 Fase 2: Funcionalidades Essenciais (Prioridade Média)

**Duração Estimada: 4-6 horas**

1. **Sistema de Gamificação**
   - Criar tabelas de badges e conquistas
   - Implementar sistema de pontos
   - Configurar triggers automáticos

2. **Sistema de Progresso**
   - Implementar tracking de lições
   - Criar sistema de marcos
   - Configurar notificações

3. **Dashboard Administrativo**
   - Implementar métricas básicas
   - Criar relatórios essenciais
   - Configurar monitoramento

### 3.3 Fase 3: Recursos Avançados (Prioridade Baixa)

**Duração Estimada: 6-8 horas**

1. **Sistema de IA Avançado**
   - Implementar geração de cursos
   - Configurar templates de IA
   - Sistema de controle de qualidade

2. **Recursos Sociais**
   - Implementar interação entre usuários
   - Sistema de rankings
   - Funcionalidades colaborativas

## 4. Estrutura de Dados Necessária

### 4.1 Tabelas Críticas para Funcionamento Básico

```sql
-- 1. user_profiles (CRÍTICA)
-- 2. course_enrollments (CRÍTICA)
-- 3. certificates (CRÍTICA)
-- 4. mission_progress (IMPORTANTE)
-- 5. user_badges (IMPORTANTE)
-- 6. lesson_progress (IMPORTANTE)
-- 7. certificate_templates (OPCIONAL)
```

### 4.2 Índices para Performance

```sql
-- Índices críticos para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_hash ON certificates(certificate_hash);
```

### 4.3 Triggers Automáticos

```sql
-- Trigger para atualizar updated_at em user_profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 5. Correções de Código Essenciais

### 5.1 Implementação de Hooks Robustos

#### 5.1.1 Hook useUserProfile Corrigido
```typescript
// hooks/useUserProfile.ts
export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await RecommendationService.getUserProfile(user.id);
        setProfile(userProfile);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar perfil do usuário');
        console.error('Erro no useUserProfile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  return { profile, loading, error, refetch: () => fetchProfile() };
}
```

#### 5.1.2 Hook useCertificates Corrigido
```typescript
// hooks/useCertificates.ts
export function useCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const userCertificates = await certificateService.getUserCertificates(user.id);
        setCertificates(userCertificates);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar certificados');
        console.error('Erro no useCertificates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user?.id]);

  return { certificates, loading, error, refetch: () => fetchCertificates() };
}
```

### 5.2 Componentes com Tratamento de Erro

#### 5.2.1 Componente Dashboard do Estudante
```typescript
// components/student/StudentDashboard.tsx
export function StudentDashboard() {
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const { certificates, loading: certLoading, error: certError } = useCertificates();

  if (profileLoading || certLoading) {
    return <LoadingSpinner />;
  }

  if (profileError || certError) {
    return (
      <ErrorBoundary 
        error={profileError || certError} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeSection profile={profile} />
      <ProgressSection profile={profile} />
      <CertificatesSection certificates={certificates} />
      <MissionsSection userId={profile?.user_id} />
    </div>
  );
}
```

## 6. Checklist de Implementação

### 6.1 Verificações Pré-Implementação
- [ ] Backup do banco de dados atual
- [ ] Verificação de dependências
- [ ] Teste de conectividade com Supabase
- [ ] Validação de permissões de usuário

### 6.2 Implementação das Correções
- [ ] Executar migration de correção crítica
- [ ] Atualizar serviços com tratamento de erro
- [ ] Implementar hooks robustos
- [ ] Criar componentes com fallbacks
- [ ] Configurar políticas RLS adequadas

### 6.3 Testes Pós-Implementação
- [ ] Testar login e criação de perfil
- [ ] Verificar sistema de recomendações
- [ ] Validar geração de missões
- [ ] Testar sistema de certificados
- [ ] Confirmar funcionalidade de dashboards

### 6.4 Monitoramento
- [ ] Configurar logs de erro
- [ ] Implementar métricas de performance
- [ ] Estabelecer alertas para falhas críticas
- [ ] Documentar procedimentos de rollback

## 7. Considerações de Segurança

### 7.1 Políticas RLS Robustas
- Implementar princípio de menor privilégio
- Validar todas as operações de dados
- Configurar auditoria de acessos

### 7.2 Validação de Dados
- Sanitizar todas as entradas de usuário
- Implementar validação de tipos
- Configurar limites de rate limiting

### 7.3 Backup e Recuperação
- Backup automático diário
- Procedimentos de rollback testados
- Plano de recuperação de desastres

## 8. Próximos Passos

1. **Implementação Imediata**: Executar correções críticas
2. **Teste Extensivo**: Validar todas as funcionalidades
3. **Monitoramento**: Acompanhar métricas de erro
4. **Otimização**: Melhorar performance conforme necessário
5. **Documentação**: Atualizar documentação técnica

---

**Responsável**: Equipe de Desenvolvimento Esquads
**Data de Criação**: 15 de Dezembro de 2024
**Prioridade**: CRÍTICA
**Status**: Aguardando Implementação