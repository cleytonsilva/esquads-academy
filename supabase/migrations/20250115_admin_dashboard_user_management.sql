-- Esquads Academy - Admin Dashboard e User Management
-- Extensões de banco de dados e políticas RLS específicas para administração

-- ============================================================================
-- EXTENSÕES DE TABELAS PARA ADMIN DASHBOARD
-- ============================================================================

-- Tabela para métricas do dashboard administrativo
CREATE TABLE IF NOT EXISTS admin_dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT NOT NULL, -- 'count', 'percentage', 'currency', 'time'
    category TEXT NOT NULL, -- 'users', 'courses', 'system', 'revenue'
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela para KPIs executivos
CREATE TABLE IF NOT EXISTS admin_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_name TEXT NOT NULL,
    current_value NUMERIC NOT NULL,
    target_value NUMERIC,
    previous_value NUMERIC,
    period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para alertas do sistema
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('info', 'warning', 'error', 'success')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source TEXT NOT NULL, -- origem do alerta
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para atividades recentes do sistema
CREATE TABLE IF NOT EXISTS system_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    entity_type TEXT, -- 'user', 'course', 'system', etc.
    entity_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EXTENSÕES PARA USER MANAGEMENT
-- ============================================================================

-- Tabela para departamentos
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_department_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para funções/papéis customizados
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system_role BOOLEAN DEFAULT false,
    is_custom BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para permissões do sistema
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY, -- ex: 'users.create', 'courses.delete'
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'users', 'courses', 'system', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extensão da tabela users para incluir campos administrativos
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT '[]'::jsonb;

-- Tabela para logs de atividades dos usuários
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para grupos de usuários
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento usuários-grupos
CREATE TABLE IF NOT EXISTS user_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, group_id)
);

-- Tabela para templates de notificação
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'email', 'sms', 'push'
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_admin_dashboard_metrics_category ON admin_dashboard_metrics(category);
CREATE INDEX IF NOT EXISTS idx_admin_dashboard_metrics_recorded_at ON admin_dashboard_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_admin_kpis_period ON admin_kpis(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_acknowledged ON system_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_system_activities_user ON system_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activities_type ON system_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_system_activities_created_at ON system_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- ============================================================================
-- POLÍTICAS RLS PARA ADMIN DASHBOARD
-- ============================================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE admin_dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_dashboard_metrics
CREATE POLICY "Admins podem ver todas as métricas" ON admin_dashboard_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Sistema pode inserir métricas" ON admin_dashboard_metrics
    FOR INSERT WITH CHECK (true);

-- Políticas para admin_kpis
CREATE POLICY "Admins podem ver todos os KPIs" ON admin_kpis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins podem gerenciar KPIs" ON admin_kpis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para system_alerts
CREATE POLICY "Admins podem ver todos os alertas" ON system_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins podem gerenciar alertas" ON system_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Sistema pode criar alertas" ON system_alerts
    FOR INSERT WITH CHECK (true);

-- Políticas para system_activities
CREATE POLICY "Admins podem ver todas as atividades" ON system_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Sistema pode registrar atividades" ON system_activities
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- POLÍTICAS RLS PARA USER MANAGEMENT
-- ============================================================================

-- Políticas para departments
CREATE POLICY "Todos podem ver departamentos ativos" ON departments
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins podem gerenciar departamentos" ON departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para roles
CREATE POLICY "Usuários autenticados podem ver roles" ON roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para permissions
CREATE POLICY "Usuários autenticados podem ver permissões" ON permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar permissões" ON permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para user_activity_logs
CREATE POLICY "Usuários podem ver próprios logs" ON user_activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os logs" ON user_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Sistema pode registrar logs" ON user_activity_logs
    FOR INSERT WITH CHECK (true);

-- Políticas para user_groups
CREATE POLICY "Usuários autenticados podem ver grupos" ON user_groups
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar grupos" ON user_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para user_group_members
CREATE POLICY "Usuários podem ver próprios grupos" ON user_group_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar membros de grupos" ON user_group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para notification_templates
CREATE POLICY "Admins podem gerenciar templates" ON notification_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar atividade do usuário
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_logs (user_id, action, description, metadata)
    VALUES (p_user_id, p_action, p_description, p_metadata)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar alerta do sistema
CREATE OR REPLACE FUNCTION create_system_alert(
    p_title TEXT,
    p_message TEXT,
    p_alert_type TEXT,
    p_severity TEXT,
    p_source TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO system_alerts (title, message, alert_type, severity, source, metadata)
    VALUES (p_title, p_message, p_alert_type, p_severity, p_source, p_metadata)
    RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Inserir permissões básicas do sistema
INSERT INTO permissions (id, name, description, category) VALUES
    ('users.create', 'Criar usuários', 'Permite criar novos usuários', 'users'),
    ('users.read', 'Visualizar usuários', 'Permite visualizar lista de usuários', 'users'),
    ('users.update', 'Editar usuários', 'Permite editar informações de usuários', 'users'),
    ('users.delete', 'Excluir usuários', 'Permite excluir usuários', 'users'),
    ('courses.create', 'Criar cursos', 'Permite criar novos cursos', 'courses'),
    ('courses.read', 'Visualizar cursos', 'Permite visualizar lista de cursos', 'courses'),
    ('courses.update', 'Editar cursos', 'Permite editar cursos', 'courses'),
    ('courses.delete', 'Excluir cursos', 'Permite excluir cursos', 'courses'),
    ('dashboard.view', 'Ver dashboard', 'Permite acessar dashboard administrativo', 'dashboard'),
    ('reports.view', 'Ver relatórios', 'Permite visualizar relatórios', 'reports'),
    ('system.manage', 'Gerenciar sistema', 'Permite gerenciar configurações do sistema', 'system')
ON CONFLICT (id) DO NOTHING;

-- Inserir roles básicos
INSERT INTO roles (id, name, description, permissions, is_system_role, is_custom) VALUES
    (gen_random_uuid(), 'Administrador', 'Acesso total ao sistema', 
     '["users.create", "users.read", "users.update", "users.delete", "courses.create", "courses.read", "courses.update", "courses.delete", "dashboard.view", "reports.view", "system.manage"]'::jsonb, 
     true, false),
    (gen_random_uuid(), 'Instrutor', 'Criar e gerenciar cursos', 
     '["courses.create", "courses.read", "courses.update", "dashboard.view"]'::jsonb, 
     true, false),
    (gen_random_uuid(), 'Estudante', 'Acesso aos cursos', 
     '["courses.read"]'::jsonb, 
     true, false)
ON CONFLICT (name) DO NOTHING;

-- Inserir departamentos básicos
INSERT INTO departments (id, name, description) VALUES
    (gen_random_uuid(), 'TI', 'Tecnologia da Informação'),
    (gen_random_uuid(), 'Educação', 'Departamento de Educação e Treinamento'),
    (gen_random_uuid(), 'Marketing', 'Marketing e Comunicação'),
    (gen_random_uuid(), 'Vendas', 'Vendas e Relacionamento com Cliente')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- GRANTS DE PERMISSÕES
-- ============================================================================

-- Conceder permissões para roles anon e authenticated
GRANT SELECT ON admin_dashboard_metrics TO anon, authenticated;
GRANT SELECT ON admin_kpis TO anon, authenticated;
GRANT SELECT ON system_alerts TO anon, authenticated;
GRANT SELECT ON system_activities TO anon, authenticated;
GRANT SELECT ON departments TO anon, authenticated;
GRANT SELECT ON roles TO anon, authenticated;
GRANT SELECT ON permissions TO anon, authenticated;
GRANT SELECT ON user_activity_logs TO anon, authenticated;
GRANT SELECT ON user_groups TO anon, authenticated;
GRANT SELECT ON user_group_members TO anon, authenticated;
GRANT SELECT ON notification_templates TO anon, authenticated;

-- Conceder permissões de inserção para authenticated
GRANT INSERT ON admin_dashboard_metrics TO authenticated;
GRANT INSERT ON admin_kpis TO authenticated;
GRANT INSERT ON system_alerts TO authenticated;
GRANT INSERT ON system_activities TO authenticated;
GRANT INSERT ON departments TO authenticated;
GRANT INSERT ON roles TO authenticated;
GRANT INSERT ON permissions TO authenticated;
GRANT INSERT ON user_activity_logs TO authenticated;
GRANT INSERT ON user_groups TO authenticated;
GRANT INSERT ON user_group_members TO authenticated;
GRANT INSERT ON notification_templates TO authenticated;

-- Conceder permissões de atualização para authenticated
GRANT UPDATE ON admin_dashboard_metrics TO authenticated;
GRANT UPDATE ON admin_kpis TO authenticated;
GRANT UPDATE ON system_alerts TO authenticated;
GRANT UPDATE ON departments TO authenticated;
GRANT UPDATE ON roles TO authenticated;
GRANT UPDATE ON permissions TO authenticated;
GRANT UPDATE ON user_groups TO authenticated;
GRANT UPDATE ON notification_templates TO authenticated;
GRANT UPDATE ON users TO authenticated;

-- Conceder permissões de exclusão para authenticated
GRANT DELETE ON admin_dashboard_metrics TO authenticated;
GRANT DELETE ON admin_kpis TO authenticated;
GRANT DELETE ON system_alerts TO authenticated;
GRANT DELETE ON departments TO authenticated;
GRANT DELETE ON roles TO authenticated;
GRANT DELETE ON permissions TO authenticated;
GRANT DELETE ON user_groups TO authenticated;
GRANT DELETE ON user_group_members TO authenticated;
GRANT DELETE ON notification_templates TO authenticated;
