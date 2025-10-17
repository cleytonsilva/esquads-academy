-- Migration: Adicionar missões específicas de cybersegurança (CORRIGIDA)
-- Data: 2025-01-16
-- Descrição: Implementa missões práticas de cybersegurança conforme prometido na landing page

BEGIN;

-- Primeiro, adicionar 'terminal' e 'challenge' aos tipos permitidos se não existirem
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_type_check;
ALTER TABLE public.missions ADD CONSTRAINT missions_type_check 
CHECK (type = ANY (ARRAY['course_completion'::text, 'lesson_completion'::text, 'points_earned'::text, 'streak'::text, 'quiz_score'::text, 'time_spent'::text, 'terminal'::text, 'challenge'::text]));

-- Adicionar 'cybersecurity' à categoria se não existir
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_category_check;
ALTER TABLE public.missions ADD CONSTRAINT missions_category_check 
CHECK (category = ANY (ARRAY['general'::text, 'programming'::text, 'design'::text, 'business'::text, 'marketing'::text, 'cybersecurity'::text]));

-- Inserir missões de cybersegurança
INSERT INTO public.missions (
  title,
  description,
  type,
  difficulty,
  points,
  objective,
  content,
  steps,
  is_active,
  is_required,
  category,
  estimated_time,
  tags,
  created_at,
  updated_at
) VALUES 
-- Missão 1: Hardening de Servidor Linux
(
  'Hardening de Servidor Linux',
  'Aprenda a fortalecer a segurança de um servidor Linux aplicando técnicas de hardening essenciais.',
  'terminal',
  'medium',
  120,
  'Aplicar técnicas de hardening em um servidor Linux para aumentar sua segurança',
  'Nesta missão você irá configurar um servidor Linux aplicando as melhores práticas de segurança. Você aprenderá a desabilitar serviços desnecessários, configurar firewall, implementar autenticação forte e monitorar logs de segurança.',
  '[
    {
      "step": 1,
      "title": "Análise inicial do sistema",
      "description": "Execute comandos para identificar serviços ativos e portas abertas",
      "command": "netstat -tulpn && systemctl list-units --type=service --state=active"
    },
    {
      "step": 2,
      "title": "Configurar firewall",
      "description": "Configure o UFW (Uncomplicated Firewall) para bloquear portas desnecessárias",
      "command": "sudo ufw enable && sudo ufw default deny incoming && sudo ufw allow ssh"
    },
    {
      "step": 3,
      "title": "Desabilitar serviços desnecessários",
      "description": "Identifique e desabilite serviços que não são necessários",
      "command": "sudo systemctl disable telnet && sudo systemctl stop telnet"
    },
    {
      "step": 4,
      "title": "Configurar SSH seguro",
      "description": "Edite o arquivo /etc/ssh/sshd_config para implementar configurações seguras",
      "command": "sudo nano /etc/ssh/sshd_config"
    },
    {
      "step": 5,
      "title": "Verificar configurações",
      "description": "Valide se todas as configurações de segurança foram aplicadas corretamente",
      "command": "sudo ufw status && sudo systemctl status ssh"
    }
  ]'::jsonb,
  true,
  false,
  'cybersecurity',
  60,
  '["linux", "hardening", "security", "firewall", "ssh"]'::jsonb,
  NOW(),
  NOW()
),

-- Missão 2: Análise de Vulnerabilidades Web
(
  'Análise de Vulnerabilidades Web',
  'Identifique e explore vulnerabilidades comuns em aplicações web usando ferramentas de pentesting.',
  'terminal',
  'hard',
  150,
  'Realizar análise de vulnerabilidades em uma aplicação web de teste',
  'Aprenda a usar ferramentas como Nmap, Nikto e OWASP ZAP para identificar vulnerabilidades em aplicações web. Esta missão ensina técnicas de reconhecimento e análise de segurança.',
  '[
    {
      "step": 1,
      "title": "Reconhecimento com Nmap",
      "description": "Execute um scan de portas para identificar serviços ativos",
      "command": "nmap -sV -sC target_ip"
    },
    {
      "step": 2,
      "title": "Análise web com Nikto",
      "description": "Use Nikto para identificar vulnerabilidades web conhecidas",
      "command": "nikto -h http://target_ip"
    },
    {
      "step": 3,
      "title": "Teste de injeção SQL",
      "description": "Teste manualmente por vulnerabilidades de SQL injection",
      "command": "curl -X POST -d \"username=admin'' OR 1=1--&password=test\" http://target_ip/login"
    },
    {
      "step": 4,
      "title": "Análise com OWASP ZAP",
      "description": "Configure e execute um scan automatizado com ZAP",
      "command": "zap-baseline.py -t http://target_ip"
    },
    {
      "step": 5,
      "title": "Relatório de vulnerabilidades",
      "description": "Documente as vulnerabilidades encontradas e suas severidades",
      "command": "echo \"Vulnerabilidades encontradas:\" > relatorio.txt"
    }
  ]'::jsonb,
  true,
  false,
  'cybersecurity',
  90,
  '["web", "vulnerabilities", "nmap", "nikto", "owasp", "pentesting"]'::jsonb,
  NOW(),
  NOW()
),

-- Missão 3: Forense Digital Básica
(
  'Forense Digital Básica',
  'Aprenda técnicas básicas de análise forense digital para investigar incidentes de segurança.',
  'terminal',
  'medium',
  100,
  'Realizar análise forense básica em um sistema comprometido',
  'Esta missão ensina os fundamentos da análise forense digital, incluindo coleta de evidências, análise de logs e identificação de indicadores de comprometimento.',
  '[
    {
      "step": 1,
      "title": "Coleta de informações do sistema",
      "description": "Colete informações básicas sobre o sistema comprometido",
      "command": "uname -a && whoami && date && uptime"
    },
    {
      "step": 2,
      "title": "Análise de processos ativos",
      "description": "Identifique processos suspeitos em execução",
      "command": "ps aux | grep -v grep | sort -k3 -nr"
    },
    {
      "step": 3,
      "title": "Verificar conexões de rede",
      "description": "Analise conexões de rede ativas e suspeitas",
      "command": "netstat -antup | grep ESTABLISHED"
    },
    {
      "step": 4,
      "title": "Análise de logs do sistema",
      "description": "Examine logs de autenticação para atividades suspeitas",
      "command": "sudo tail -100 /var/log/auth.log | grep -i failed"
    },
    {
      "step": 5,
      "title": "Verificar arquivos modificados",
      "description": "Identifique arquivos recentemente modificados",
      "command": "find /home -type f -mtime -1 -ls"
    }
  ]'::jsonb,
  true,
  false,
  'cybersecurity',
  45,
  '["forensics", "investigation", "logs", "incident-response"]'::jsonb,
  NOW(),
  NOW()
),

-- Missão 4: Configuração de IDS/IPS
(
  'Configuração de Sistema de Detecção de Intrusão',
  'Configure e implemente um sistema de detecção e prevenção de intrusões usando Snort.',
  'terminal',
  'hard',
  180,
  'Configurar e implementar um IDS/IPS funcional com Snort',
  'Aprenda a instalar, configurar e operar o Snort como sistema de detecção de intrusões. Esta missão cobre desde a instalação até a criação de regras personalizadas.',
  '[
    {
      "step": 1,
      "title": "Instalação do Snort",
      "description": "Instale o Snort e suas dependências",
      "command": "sudo apt update && sudo apt install snort -y"
    },
    {
      "step": 2,
      "title": "Configuração básica",
      "description": "Configure o arquivo principal do Snort",
      "command": "sudo nano /etc/snort/snort.conf"
    },
    {
      "step": 3,
      "title": "Criar regras personalizadas",
      "description": "Crie regras para detectar atividades suspeitas",
      "command": "echo ''alert tcp any any -> any 22 (msg:\"SSH Connection Attempt\"; sid:1000001;)'' | sudo tee -a /etc/snort/rules/local.rules"
    },
    {
      "step": 4,
      "title": "Teste do IDS",
      "description": "Execute o Snort em modo de teste",
      "command": "sudo snort -T -c /etc/snort/snort.conf"
    },
    {
      "step": 5,
      "title": "Monitoramento ativo",
      "description": "Inicie o monitoramento em tempo real",
      "command": "sudo snort -A console -q -c /etc/snort/snort.conf -i eth0"
    }
  ]'::jsonb,
  true,
  false,
  'cybersecurity',
  120,
  '["ids", "ips", "snort", "network-security", "monitoring"]'::jsonb,
  NOW(),
  NOW()
),

-- Missão 5: CTF - Capture The Flag
(
  'CTF: Quebra de Senha e Criptografia',
  'Desafio prático de CTF focado em técnicas de quebra de senhas e análise criptográfica.',
  'challenge',
  'hard',
  200,
  'Resolver desafios de criptografia e quebra de senhas em um ambiente CTF',
  'Este CTF apresenta desafios reais de criptografia e quebra de senhas. Você usará ferramentas como John the Ripper, Hashcat e técnicas de análise criptográfica.',
  '[
    {
      "step": 1,
      "title": "Análise do hash",
      "description": "Identifique o tipo de hash fornecido",
      "command": "hashid hash.txt"
    },
    {
      "step": 2,
      "title": "Ataque de dicionário",
      "description": "Use John the Ripper para quebrar a senha",
      "command": "john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt"
    },
    {
      "step": 3,
      "title": "Análise de cifra",
      "description": "Decodifique a mensagem criptografada encontrada",
      "command": "echo ''mensagem_codificada'' | base64 -d"
    },
    {
      "step": 4,
      "title": "Quebra de cifra César",
      "description": "Implemente um script para quebrar cifra César",
      "command": "python3 caesar_decoder.py"
    },
    {
      "step": 5,
      "title": "Capturar a flag",
      "description": "Use as informações descobertas para encontrar a flag final",
      "command": "cat flag.txt"
    }
  ]'::jsonb,
  true,
  false,
  'cybersecurity',
  75,
  '["ctf", "cryptography", "password-cracking", "john-the-ripper", "hashcat"]'::jsonb,
  NOW(),
  NOW()
),

-- Missão 6: Segurança em Containers Docker
(
  'Segurança em Containers Docker',
  'Aprenda a implementar práticas de segurança em containers Docker e Kubernetes.',
  'terminal',
  'medium',
  130,
  'Implementar práticas de segurança em containers Docker',
  'Esta missão ensina como proteger containers Docker, desde a criação de imagens seguras até a implementação de políticas de segurança em runtime.',
  '[
    {
      "step": 1,
      "title": "Análise de imagem Docker",
      "description": "Escaneie uma imagem Docker em busca de vulnerabilidades",
      "command": "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image nginx:latest"
    },
    {
      "step": 2,
      "title": "Criar Dockerfile seguro",
      "description": "Crie um Dockerfile seguindo práticas de segurança",
      "command": "nano Dockerfile.secure"
    },
    {
      "step": 3,
      "title": "Configurar usuário não-root",
      "description": "Configure o container para executar com usuário não-privilegiado",
      "command": "docker run --user 1000:1000 nginx:latest"
    },
    {
      "step": 4,
      "title": "Implementar network policies",
      "description": "Configure políticas de rede para isolar containers",
      "command": "docker network create --driver bridge secure-network"
    },
    {
      "step": 5,
      "title": "Monitoramento de runtime",
      "description": "Configure monitoramento de segurança em runtime",
      "command": "docker run -d --name falco --privileged -v /var/run/docker.sock:/host/var/run/docker.sock falcosecurity/falco"
    }
  ]'::jsonb,
  true,
  false,
  'cybersecurity',
  80,
  '["docker", "containers", "devsecops", "security", "kubernetes"]'::jsonb,
  NOW(),
  NOW()
);

-- Criar badges específicos para cybersegurança se não existirem
INSERT INTO public.badges (
  name,
  description,
  icon_url,
  category,
  points_required,
  created_at,
  updated_at
) VALUES 
(
  'Especialista em Hardening',
  'Concluiu missões de hardening de sistemas',
  NULL,
  'cybersecurity',
  120,
  NOW(),
  NOW()
),
(
  'Analista de Vulnerabilidades',
  'Especialista em identificação de vulnerabilidades',
  NULL,
  'cybersecurity',
  150,
  NOW(),
  NOW()
),
(
  'Investigador Forense',
  'Domina técnicas de análise forense digital',
  NULL,
  'cybersecurity',
  100,
  NOW(),
  NOW()
),
(
  'Guardião da Rede',
  'Configurou sistemas de detecção de intrusão',
  NULL,
  'cybersecurity',
  180,
  NOW(),
  NOW()
),
(
  'Mestre CTF',
  'Resolveu desafios avançados de CTF',
  NULL,
  'cybersecurity',
  200,
  NOW(),
  NOW()
),
(
  'DevSecOps',
  'Implementou segurança em containers e DevOps',
  NULL,
  'cybersecurity',
  130,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- Comentário final
COMMENT ON TABLE public.missions IS 'Tabela de missões incluindo missões específicas de cybersegurança - Migração 20250116_add_cybersecurity_missions_fixed aplicada';