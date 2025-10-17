-- Esquads Academy - Políticas RLS (Row Level Security)
-- Definição de todas as políticas de segurança

-- Políticas para tabela users
CREATE POLICY "Usuários podem ver próprio perfil" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os usuários" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins podem atualizar usuários" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela user_points
CREATE POLICY "Usuários podem ver próprios pontos" ON user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode atualizar pontos" ON user_points
    FOR UPDATE USING (true);

CREATE POLICY "Sistema pode inserir pontos" ON user_points
    FOR INSERT WITH CHECK (true);

-- Políticas para tabela badges
CREATE POLICY "Todos podem ver badges" ON badges
    FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar badges" ON badges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela user_badges
CREATE POLICY "Usuários podem ver próprios badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode conceder badges" ON user_badges
    FOR INSERT WITH CHECK (true);

-- Políticas para tabela courses
CREATE POLICY "Todos podem ver cursos publicados" ON courses
    FOR SELECT USING (status = 'published');

CREATE POLICY "Instrutores podem ver próprios cursos" ON courses
    FOR SELECT USING (auth.uid() = instructor_id);

CREATE POLICY "Instrutores podem criar cursos" ON courses
    FOR INSERT WITH CHECK (
        auth.uid() = instructor_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('instructor', 'admin')
        )
    );

CREATE POLICY "Instrutores podem atualizar próprios cursos" ON courses
    FOR UPDATE USING (auth.uid() = instructor_id);

CREATE POLICY "Admins podem gerenciar todos os cursos" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela course_modules
CREATE POLICY "Usuários podem ver módulos de cursos publicados" ON course_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE id = course_id AND status = 'published'
        )
    );

CREATE POLICY "Instrutores podem ver módulos de próprios cursos" ON course_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE id = course_id AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Instrutores podem gerenciar módulos de próprios cursos" ON course_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE id = course_id AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem gerenciar todos os módulos" ON course_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela module_lessons
CREATE POLICY "Usuários podem ver lições de cursos publicados" ON module_lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_modules cm
            JOIN courses c ON c.id = cm.course_id
            WHERE cm.id = module_id AND c.status = 'published'
        )
    );

CREATE POLICY "Instrutores podem ver lições de próprios cursos" ON module_lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_modules cm
            JOIN courses c ON c.id = cm.course_id
            WHERE cm.id = module_id AND c.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Instrutores podem gerenciar lições de próprios cursos" ON module_lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM course_modules cm
            JOIN courses c ON c.id = cm.course_id
            WHERE cm.id = module_id AND c.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem gerenciar todas as lições" ON module_lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela user_courses
CREATE POLICY "Usuários podem ver próprias inscrições" ON user_courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem se inscrever em cursos" ON user_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio progresso" ON user_courses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Instrutores podem ver inscrições em seus cursos" ON user_courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE id = course_id AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem ver todas as inscrições" ON user_courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela lesson_progress
CREATE POLICY "Usuários podem ver próprio progresso" ON lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio progresso" ON lesson_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Instrutores podem ver progresso em seus cursos" ON lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM module_lessons ml
            JOIN course_modules cm ON cm.id = ml.module_id
            JOIN courses c ON c.id = cm.course_id
            WHERE ml.id = lesson_id AND c.instructor_id = auth.uid()
        )
    );

-- Políticas para tabela missions
CREATE POLICY "Todos podem ver missões ativas" ON missions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins podem gerenciar missões" ON missions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela mission_progress
CREATE POLICY "Usuários podem ver próprio progresso de missões" ON mission_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio progresso de missões" ON mission_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todo progresso de missões" ON mission_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela certificates
CREATE POLICY "Usuários podem ver próprios certificados" ON certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode emitir certificados" ON certificates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Instrutores podem ver certificados de seus cursos" ON certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE id = course_id AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem ver todos os certificados" ON certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela exams
CREATE POLICY "Usuários podem ver exames de cursos inscritos" ON exams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_courses 
            WHERE course_id = exams.course_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Instrutores podem gerenciar exames de próprios cursos" ON exams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE id = course_id AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem gerenciar todos os exames" ON exams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para tabela exam_attempts
CREATE POLICY "Usuários podem ver próprias tentativas" ON exam_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar tentativas" ON exam_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprias tentativas" ON exam_attempts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Instrutores podem ver tentativas em seus cursos" ON exam_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exams e
            JOIN courses c ON c.id = e.course_id
            WHERE e.id = exam_id AND c.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem ver todas as tentativas" ON exam_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Conceder permissões básicas aos roles
GRANT SELECT ON badges TO anon, authenticated;
GRANT SELECT ON missions TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;