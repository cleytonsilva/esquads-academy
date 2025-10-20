-- Migration: Dados Iniciais para Sistema de Certificações
-- Data: 2025-01-25
-- Descrição: Insere dados de exemplo para demonstração do sistema

-- 1. Inserir configurações de simulados padrão
INSERT INTO simulation_configs (certification, name, description, question_count, time_limit, passing_score, difficulty_distribution, topics, is_active) VALUES
('AWS', 'AWS Solutions Architect Associate - Básico', 'Simulado básico para AWS SAA com foco em conceitos fundamentais', 25, 90, 70.0, '{"easy": 40, "medium": 50, "hard": 10}', '["EC2", "S3", "IAM", "VPC", "RDS"]', true),
('AWS', 'AWS Solutions Architect Associate - Intermediário', 'Simulado intermediário para AWS SAA com cenários práticos', 50, 180, 75.0, '{"easy": 20, "medium": 60, "hard": 20}', '["EC2", "S3", "IAM", "VPC", "RDS", "Lambda", "CloudFormation", "Route53"]', true),
('Azure', 'Azure Fundamentals AZ-900 - Básico', 'Simulado básico para certificação Azure Fundamentals', 30, 120, 70.0, '{"easy": 50, "medium": 40, "hard": 10}', '["Azure Services", "Security", "Privacy", "Compliance", "Trust"]', true),
('CompTIA', 'Security+ SY0-601 - Básico', 'Simulado básico para CompTIA Security+', 40, 150, 75.0, '{"easy": 30, "medium": 50, "hard": 20}', '["Threats", "Attacks", "Vulnerabilities", "Architecture", "Design"]', true);

-- 2. Inserir questões de exemplo para AWS
INSERT INTO certification_questions (certification, topic, difficulty, question_text, options, correct_answer_id, explanation, status) VALUES
('AWS', 'EC2', 'easy', 'Qual é o tipo de instância EC2 mais adequado para aplicações que requerem alta performance de CPU?', 
'[{"id": "a", "text": "t2.micro"}, {"id": "b", "text": "c5.large"}, {"id": "c", "text": "r5.large"}, {"id": "d", "text": "m5.large"}]', 
'b', 
'As instâncias da família C5 são otimizadas para alta performance de CPU, sendo ideais para aplicações computacionalmente intensivas.', 'approved'),

('AWS', 'S3', 'medium', 'Um desenvolvedor precisa armazenar dados que serão acessados frequentemente nos primeiros 30 dias e depois raramente. Qual classe de armazenamento S3 é mais adequada?', 
'[{"id": "a", "text": "S3 Standard"}, {"id": "b", "text": "S3 Intelligent-Tiering"}, {"id": "c", "text": "S3 Standard-IA"}, {"id": "d", "text": "S3 Glacier"}]', 
'b', 
'S3 Intelligent-Tiering monitora automaticamente os padrões de acesso e move os dados entre as classes de armazenamento conforme necessário, otimizando custos.', 'approved'),

('AWS', 'IAM', 'hard', 'Uma empresa precisa implementar acesso temporário a recursos AWS para desenvolvedores externos. Qual é a melhor prática recomendada?', 
'[{"id": "a", "text": "Criar usuários IAM permanentes para cada desenvolvedor"}, {"id": "b", "text": "Usar AWS STS com AssumeRole para acesso temporário"}, {"id": "c", "text": "Compartilhar chaves de acesso de longa duração"}, {"id": "d", "text": "Usar apenas políticas inline"}]', 
'b', 
'AWS STS (Security Token Service) com AssumeRole permite criar credenciais temporárias e seguras, seguindo o princípio do menor privilégio.', 'approved'),

('AWS', 'VPC', 'medium', 'Qual componente do VPC é responsável por permitir comunicação entre diferentes zonas de disponibilidade?', 
'[{"id": "a", "text": "Internet Gateway"}, {"id": "b", "text": "NAT Gateway"}, {"id": "c", "text": "Route Table"}, {"id": "d", "text": "Security Group"}]', 
'c', 
'As Route Tables controlam o roteamento de tráfego dentro do VPC, incluindo comunicação entre subnets em diferentes zonas de disponibilidade.', 'approved'),

('AWS', 'RDS', 'easy', 'Qual é o benefício principal do Multi-AZ deployment no RDS?', 
'[{"id": "a", "text": "Melhor performance de leitura"}, {"id": "b", "text": "Alta disponibilidade e failover automático"}, {"id": "c", "text": "Redução de custos"}, {"id": "d", "text": "Backup automático"}]', 
'b', 
'Multi-AZ deployment cria uma réplica síncrona em outra zona de disponibilidade, proporcionando alta disponibilidade e failover automático.', 'approved');

-- 3. Inserir questões de exemplo para Azure
INSERT INTO certification_questions (certification, topic, difficulty, question_text, options, correct_answer_id, explanation, status) VALUES
('Azure', 'Azure Services', 'easy', 'Qual serviço do Azure é usado para hospedar aplicações web?', 
'[{"id": "a", "text": "Azure Virtual Machines"}, {"id": "b", "text": "Azure App Service"}, {"id": "c", "text": "Azure Storage"}, {"id": "d", "text": "Azure SQL Database"}]', 
'b', 
'Azure App Service é uma plataforma totalmente gerenciada para hospedar aplicações web, APIs e aplicações móveis.', 'approved'),

('Azure', 'Security', 'medium', 'Qual é o serviço do Azure usado para gerenciar identidades e acesso?', 
'[{"id": "a", "text": "Azure Active Directory"}, {"id": "b", "text": "Azure Key Vault"}, {"id": "c", "text": "Azure Security Center"}, {"id": "d", "text": "Azure Monitor"}]', 
'a', 
'Azure Active Directory (Azure AD) é o serviço de gerenciamento de identidades e acesso da Microsoft, permitindo autenticação e autorização.', 'approved');

-- 4. Inserir questões de exemplo para CompTIA Security+
INSERT INTO certification_questions (certification, topic, difficulty, question_text, options, correct_answer_id, explanation, status) VALUES
('CompTIA', 'Threats', 'easy', 'Qual tipo de ataque usa engenharia social para obter informações confidenciais?', 
'[{"id": "a", "text": "DDoS"}, {"id": "b", "text": "Phishing"}, {"id": "c", "text": "SQL Injection"}, {"id": "d", "text": "Buffer Overflow"}]', 
'b', 
'Phishing é um ataque de engenharia social que usa comunicações fraudulentas para obter informações confidenciais das vítimas.', 'approved'),

('CompTIA', 'Architecture', 'medium', 'Qual princípio de segurança garante que apenas usuários autorizados tenham acesso aos recursos?', 
'[{"id": "a", "text": "Confidencialidade"}, {"id": "b", "text": "Integridade"}, {"id": "c", "text": "Disponibilidade"}, {"id": "d", "text": "Autenticação"}]', 
'a', 
'Confidencialidade é o princípio que garante que informações sejam acessíveis apenas por usuários autorizados.', 'approved');

-- 5. Inserir algumas missões de exemplo com novos campos
UPDATE missions SET 
  mission_type = 'terminal',
  status = 'published',
  ai_prompt = 'Criar uma missão de configuração de firewall usando iptables',
  created_by = (SELECT user_id FROM user_profiles WHERE role = 'admin' LIMIT 1)
WHERE title LIKE '%Firewall%' OR title LIKE '%Segurança%'
LIMIT 3;

-- 6. Comentários para documentação
COMMENT ON TABLE simulation_configs IS 'Configurações pré-definidas para diferentes tipos de simulados de certificação';
COMMENT ON TABLE certification_questions IS 'Banco de questões para simulados de certificação com diferentes níveis de dificuldade';
