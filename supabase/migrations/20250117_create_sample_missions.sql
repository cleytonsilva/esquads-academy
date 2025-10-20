-- Inserir missões de exemplo para teste
INSERT INTO missions (
  title,
  description,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  duration_minutes,
  estimated_time,
  is_active,
  objectives,
  tools,
  prerequisites,
  tags,
  hints,
  checkpoints,
  validation_criteria
) VALUES 
(
  'Configuração Básica de Firewall',
  'Aprenda a configurar regras básicas de firewall para proteger sua rede',
  'Firewall',
  'Iniciante',
  'terminal',
  100,
  50,
  30,
  30,
  true,
  '[
    {
      "id": "1",
      "title": "Verificar status do firewall",
      "description": "Use o comando para verificar se o firewall está ativo",
      "expectedCommand": "ufw status",
      "isCompleted": false,
      "order": 1,
      "points": 25
    },
    {
      "id": "2", 
      "title": "Ativar o firewall",
      "description": "Ative o firewall do sistema",
      "expectedCommand": "ufw enable",
      "isCompleted": false,
      "order": 2,
      "points": 25
    },
    {
      "id": "3",
      "title": "Criar regra de bloqueio",
      "description": "Bloqueie uma porta específica",
      "expectedCommand": "ufw deny 22",
      "isCompleted": false,
      "order": 3,
      "points": 25
    },
    {
      "id": "4",
      "title": "Verificar regras ativas",
      "description": "Liste todas as regras configuradas",
      "expectedCommand": "ufw status numbered",
      "isCompleted": false,
      "order": 4,
      "points": 25
    }
  ]'::jsonb,
  '["ufw", "iptables", "terminal"]'::jsonb,
  '[]'::jsonb,
  '["firewall", "segurança", "rede", "iniciante"]'::jsonb,
  '[
    "Use o comando ufw para gerenciar o firewall",
    "O comando status mostra o estado atual",
    "Enable ativa o firewall",
    "Deny bloqueia uma porta específica"
  ]'::jsonb,
  '[
    {
      "step": 1,
      "description": "Verificação inicial do firewall"
    },
    {
      "step": 2,
      "description": "Ativação do firewall"
    },
    {
      "step": 3,
      "description": "Configuração de regras"
    },
    {
      "step": 4,
      "description": "Validação final"
    }
  ]'::jsonb,
  '{
    "commands": ["ufw status", "ufw enable", "ufw deny 22", "ufw status numbered"],
    "expectedOutputs": ["Status: inactive", "Firewall is active", "Rule added", "Status: active"]
  }'::jsonb
),
(
  'Análise de Logs de Segurança',
  'Aprenda a analisar logs do sistema para identificar atividades suspeitas',
  'Forensics',
  'Intermediário',
  'terminal',
  150,
  75,
  45,
  45,
  true,
  '[
    {
      "id": "1",
      "title": "Visualizar logs de autenticação",
      "description": "Examine os logs de login do sistema",
      "expectedCommand": "cat /var/log/auth.log",
      "isCompleted": false,
      "order": 1,
      "points": 30
    },
    {
      "id": "2",
      "title": "Filtrar tentativas de login falhadas",
      "description": "Encontre tentativas de login que falharam",
      "expectedCommand": "grep \"Failed password\" /var/log/auth.log",
      "isCompleted": false,
      "order": 2,
      "points": 40
    },
    {
      "id": "3",
      "title": "Contar tentativas por IP",
      "description": "Conte quantas tentativas cada IP fez",
      "expectedCommand": "grep \"Failed password\" /var/log/auth.log | awk \"{print $11}\" | sort | uniq -c",
      "isCompleted": false,
      "order": 3,
      "points": 50
    },
    {
      "id": "4",
      "title": "Verificar logs do sistema",
      "description": "Examine logs gerais do sistema",
      "expectedCommand": "tail -n 20 /var/log/syslog",
      "isCompleted": false,
      "order": 4,
      "points": 30
    }
  ]'::jsonb,
  '["grep", "awk", "sort", "uniq", "tail", "cat"]'::jsonb,
  '["Configuração Básica de Firewall"]'::jsonb,
  '["forensics", "logs", "análise", "segurança", "intermediário"]'::jsonb,
  '[
    "Use cat para visualizar arquivos de log",
    "grep ajuda a filtrar linhas específicas",
    "awk pode extrair campos específicos",
    "sort e uniq ajudam a organizar dados",
    "tail mostra as últimas linhas de um arquivo"
  ]'::jsonb,
  '[
    {
      "step": 1,
      "description": "Visualização inicial dos logs"
    },
    {
      "step": 2,
      "description": "Filtragem de eventos específicos"
    },
    {
      "step": 3,
      "description": "Análise estatística"
    },
    {
      "step": 4,
      "description": "Verificação complementar"
    }
  ]'::jsonb,
  '{
    "commands": ["cat /var/log/auth.log", "grep \"Failed password\" /var/log/auth.log", "grep \"Failed password\" /var/log/auth.log | awk \"{print $11}\" | sort | uniq -c", "tail -n 20 /var/log/syslog"],
    "expectedOutputs": ["Authentication logs displayed", "Failed login attempts found", "IP count statistics", "Recent system logs"]
  }'::jsonb
),
(
  'Teste de Penetração Básico',
  'Introdução aos conceitos básicos de teste de penetração',
  'Penetration Testing',
  'Avançado',
  'terminal',
  200,
  100,
  60,
  60,
  true,
  '[
    {
      "id": "1",
      "title": "Scan de rede",
      "description": "Execute um scan básico da rede local",
      "expectedCommand": "nmap -sn 192.168.1.0/24",
      "isCompleted": false,
      "order": 1,
      "points": 40
    },
    {
      "id": "2",
      "title": "Scan de portas",
      "description": "Identifique portas abertas em um host",
      "expectedCommand": "nmap -sS 192.168.1.1",
      "isCompleted": false,
      "order": 2,
      "points": 50
    },
    {
      "id": "3",
      "title": "Identificação de serviços",
      "description": "Identifique os serviços rodando nas portas",
      "expectedCommand": "nmap -sV 192.168.1.1",
      "isCompleted": false,
      "order": 3,
      "points": 60
    },
    {
      "id": "4",
      "title": "Scan de vulnerabilidades",
      "description": "Execute scripts de detecção de vulnerabilidades",
      "expectedCommand": "nmap --script vuln 192.168.1.1",
      "isCompleted": false,
      "order": 4,
      "points": 50
    }
  ]'::jsonb,
  '["nmap", "netcat", "wireshark"]'::jsonb,
  '["Análise de Logs de Segurança"]'::jsonb,
  '["pentest", "nmap", "vulnerabilidades", "rede", "avançado"]'::jsonb,
  '[
    "nmap é uma ferramenta poderosa para descoberta de rede",
    "-sn faz ping scan sem scan de portas",
    "-sS executa SYN scan (stealth)",
    "-sV detecta versões de serviços",
    "--script vuln executa scripts de vulnerabilidade"
  ]'::jsonb,
  '[
    {
      "step": 1,
      "description": "Descoberta de hosts ativos"
    },
    {
      "step": 2,
      "description": "Mapeamento de portas"
    },
    {
      "step": 3,
      "description": "Identificação de serviços"
    },
    {
      "step": 4,
      "description": "Detecção de vulnerabilidades"
    }
  ]'::jsonb,
  '{
    "commands": ["nmap -sn 192.168.1.0/24", "nmap -sS 192.168.1.1", "nmap -sV 192.168.1.1", "nmap --script vuln 192.168.1.1"],
    "expectedOutputs": ["Host discovery completed", "Port scan completed", "Service detection completed", "Vulnerability scan completed"]
  }'::jsonb
);

-- Verificar se as missões foram criadas
SELECT 
  title,
  category,
  difficulty,
  points_reward,
  experience_reward
FROM missions 
WHERE title IN (
  'Configuração Básica de Firewall',
  'Análise de Logs de Segurança', 
  'Teste de Penetração Básico'
);
