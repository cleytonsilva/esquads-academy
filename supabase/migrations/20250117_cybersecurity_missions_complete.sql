-- Missões de Cybersegurança Completas para o Sistema Esquads
-- Inserindo missões específicas de cybersegurança com diferentes níveis de dificuldade

-- Missão 1: Introdução à Cybersegurança (Fácil)
INSERT INTO missions (
  title,
  description,
  objective,
  content,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  estimated_time,
  is_active,
  is_featured,
  steps,
  tags,
  hints,
  validation_criteria
) VALUES (
  'Fundamentos de Cybersegurança',
  'Aprenda os conceitos básicos de segurança da informação e proteção de dados.',
  'Compreender os pilares fundamentais da cybersegurança: confidencialidade, integridade e disponibilidade.',
  'Nesta missão, você aprenderá sobre os três pilares da segurança da informação (CIA Triad), tipos de ameaças digitais e a importância da proteção de dados pessoais e corporativos.',
  'cybersecurity',
  'easy',
  'course_completion',
  100,
  50,
  45,
  true,
  true,
  '[
    {
      "id": 1,
      "title": "Entenda a CIA Triad",
      "description": "Aprenda sobre Confidencialidade, Integridade e Disponibilidade",
      "completed": false
    },
    {
      "id": 2,
      "title": "Identifique Tipos de Ameaças",
      "description": "Reconheça malware, phishing, ransomware e outras ameaças",
      "completed": false
    },
    {
      "id": 3,
      "title": "Proteção de Dados",
      "description": "Compreenda a importância da proteção de dados pessoais",
      "completed": false
    }
  ]',
  '["cybersecurity", "fundamentals", "security", "beginner"]',
  '[
    "A CIA Triad é a base de toda estratégia de segurança",
    "Phishing é uma das ameaças mais comuns atualmente",
    "A LGPD regulamenta a proteção de dados no Brasil"
  ]',
  '{
    "completion_criteria": "complete_all_steps",
    "minimum_score": 80,
    "required_actions": ["read_content", "complete_quiz"]
  }'
);

-- Missão 2: Senhas Seguras e Autenticação (Fácil)
INSERT INTO missions (
  title,
  description,
  objective,
  content,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  estimated_time,
  is_active,
  steps,
  tags,
  hints,
  validation_criteria
) VALUES (
  'Criação de Senhas Seguras',
  'Aprenda a criar e gerenciar senhas fortes para proteger suas contas.',
  'Dominar as técnicas de criação de senhas seguras e implementar autenticação de dois fatores.',
  'Esta missão ensina como criar senhas robustas, usar gerenciadores de senhas e implementar autenticação multifator para máxima segurança.',
  'cybersecurity',
  'easy',
  'terminal',
  120,
  60,
  30,
  true,
  '[
    {
      "id": 1,
      "title": "Critérios de Senha Forte",
      "description": "Aprenda os requisitos para uma senha segura",
      "completed": false
    },
    {
      "id": 2,
      "title": "Gerenciadores de Senha",
      "description": "Configure um gerenciador de senhas",
      "completed": false
    },
    {
      "id": 3,
      "title": "Autenticação 2FA",
      "description": "Ative a autenticação de dois fatores",
      "completed": false
    }
  ]',
  '["passwords", "authentication", "2FA", "security"]',
  '[
    "Use pelo menos 12 caracteres com letras, números e símbolos",
    "Nunca reutilize senhas importantes",
    "Gerenciadores de senha geram senhas únicas automaticamente"
  ]',
  '{
    "completion_criteria": "complete_terminal_tasks",
    "required_commands": ["passwd", "enable-2fa"],
    "minimum_score": 85
  }'
);

-- Missão 3: Detecção de Phishing (Médio)
INSERT INTO missions (
  title,
  description,
  objective,
  content,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  estimated_time,
  is_active,
  steps,
  tags,
  hints,
  validation_criteria
) VALUES (
  'Detecção e Prevenção de Phishing',
  'Desenvolva habilidades para identificar e evitar ataques de phishing.',
  'Identificar emails, sites e mensagens suspeitas que podem ser tentativas de phishing.',
  'Aprenda a reconhecer sinais de phishing em emails, URLs suspeitas, técnicas de engenharia social e como reportar tentativas de ataque.',
  'cybersecurity',
  'medium',
  'quiz_score',
  200,
  100,
  60,
  true,
  '[
    {
      "id": 1,
      "title": "Anatomia do Phishing",
      "description": "Identifique elementos comuns em emails de phishing",
      "completed": false
    },
    {
      "id": 2,
      "title": "Análise de URLs",
      "description": "Aprenda a verificar a legitimidade de links",
      "completed": false
    },
    {
      "id": 3,
      "title": "Engenharia Social",
      "description": "Reconheça técnicas de manipulação psicológica",
      "completed": false
    },
    {
      "id": 4,
      "title": "Reportar Ataques",
      "description": "Saiba como reportar tentativas de phishing",
      "completed": false
    }
  ]',
  '["phishing", "social-engineering", "email-security", "detection"]',
  '[
    "Verifique sempre o remetente real do email",
    "URLs suspeitas frequentemente têm erros de ortografia",
    "Nunca clique em links de emails não solicitados"
  ]',
  '{
    "completion_criteria": "quiz_score",
    "minimum_score": 90,
    "quiz_questions": 15,
    "passing_threshold": 13
  }'
);

-- Missão 4: Segurança em Redes Wi-Fi (Médio)
INSERT INTO missions (
  title,
  description,
  objective,
  content,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  estimated_time,
  is_active,
  steps,
  tags,
  hints,
  validation_criteria
) VALUES (
  'Segurança em Redes Wi-Fi',
  'Aprenda a configurar e usar redes Wi-Fi de forma segura.',
  'Configurar redes Wi-Fi seguras e identificar riscos em redes públicas.',
  'Esta missão aborda protocolos de segurança Wi-Fi (WPA3, WPA2), riscos de redes públicas, uso de VPNs e configuração segura de roteadores.',
  'cybersecurity',
  'medium',
  'terminal',
  180,
  90,
  75,
  true,
  '[
    {
      "id": 1,
      "title": "Protocolos de Segurança",
      "description": "Configure WPA3/WPA2 em seu roteador",
      "completed": false
    },
    {
      "id": 2,
      "title": "Riscos de Wi-Fi Público",
      "description": "Identifique perigos em redes abertas",
      "completed": false
    },
    {
      "id": 3,
      "title": "Configuração de VPN",
      "description": "Configure uma VPN para navegação segura",
      "completed": false
    },
    {
      "id": 4,
      "title": "Hardening de Roteador",
      "description": "Aplique configurações de segurança avançadas",
      "completed": false
    }
  ]',
  '["wifi-security", "networking", "vpn", "router-security"]',
  '[
    "WPA3 é o protocolo mais seguro atualmente",
    "Evite transações financeiras em Wi-Fi público",
    "VPNs criptografam todo o tráfego de internet"
  ]',
  '{
    "completion_criteria": "complete_terminal_tasks",
    "required_commands": ["configure-wpa3", "setup-vpn", "router-hardening"],
    "minimum_score": 85
  }'
);

-- Missão 5: Análise de Malware (Difícil)
INSERT INTO missions (
  title,
  description,
  objective,
  content,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  estimated_time,
  is_active,
  steps,
  tags,
  hints,
  validation_criteria,
  prerequisites
) VALUES (
  'Análise Básica de Malware',
  'Aprenda técnicas fundamentais para identificar e analisar malware.',
  'Realizar análise estática e dinâmica de amostras de malware em ambiente controlado.',
  'Missão avançada que ensina uso de ferramentas como VirusTotal, análise de hashes, sandboxing e identificação de comportamentos maliciosos.',
  'cybersecurity',
  'hard',
  'terminal',
  300,
  150,
  120,
  true,
  '[
    {
      "id": 1,
      "title": "Análise Estática",
      "description": "Examine arquivos sem executá-los",
      "completed": false
    },
    {
      "id": 2,
      "title": "Uso do VirusTotal",
      "description": "Analise hashes e reputação de arquivos",
      "completed": false
    },
    {
      "id": 3,
      "title": "Sandboxing",
      "description": "Execute malware em ambiente isolado",
      "completed": false
    },
    {
      "id": 4,
      "title": "Análise Comportamental",
      "description": "Identifique padrões de comportamento malicioso",
      "completed": false
    },
    {
      "id": 5,
      "title": "Relatório de Análise",
      "description": "Documente suas descobertas",
      "completed": false
    }
  ]',
  '["malware-analysis", "reverse-engineering", "security-analysis", "advanced"]',
  '[
    "Sempre use máquinas virtuais isoladas para análise",
    "Hashes MD5/SHA256 são únicos para cada arquivo",
    "Monitore mudanças no sistema durante execução"
  ]',
  '{
    "completion_criteria": "complete_terminal_tasks",
    "required_commands": ["static-analysis", "virustotal-check", "sandbox-run", "behavior-monitor"],
    "minimum_score": 90,
    "report_required": true
  }',
  '["Detecção e Prevenção de Phishing", "Segurança em Redes Wi-Fi"]'
);

-- Missão 6: Incident Response (Difícil)
INSERT INTO missions (
  title,
  description,
  objective,
  content,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  estimated_time,
  is_active,
  steps,
  tags,
  hints,
  validation_criteria,
  prerequisites
) VALUES (
  'Resposta a Incidentes de Segurança',
  'Aprenda a responder adequadamente a incidentes de cybersegurança.',
  'Implementar um plano de resposta a incidentes seguindo frameworks como NIST.',
  'Missão que simula um incidente real de segurança, ensinando identificação, contenção, erradicação, recuperação e lições aprendidas.',
  'cybersecurity',
  'hard',
  'terminal',
  400,
  200,
  150,
  true,
  '[
    {
      "id": 1,
      "title": "Identificação do Incidente",
      "description": "Detecte e classifique o incidente de segurança",
      "completed": false
    },
    {
      "id": 2,
      "title": "Contenção",
      "description": "Implemente medidas para conter o incidente",
      "completed": false
    },
    {
      "id": 3,
      "title": "Investigação Forense",
      "description": "Colete evidências e analise o ataque",
      "completed": false
    },
    {
      "id": 4,
      "title": "Erradicação",
      "description": "Remova a ameaça do ambiente",
      "completed": false
    },
    {
      "id": 5,
      "title": "Recuperação",
      "description": "Restaure sistemas e operações normais",
      "completed": false
    },
    {
      "id": 6,
      "title": "Lições Aprendidas",
      "description": "Documente melhorias para o futuro",
      "completed": false
    }
  ]',
  '["incident-response", "forensics", "nist-framework", "expert"]',
  '[
    "Documente todas as ações durante o incidente",
    "Preserve evidências antes de fazer alterações",
    "Comunique-se com stakeholders regularmente"
  ]',
  '{
    "completion_criteria": "complete_terminal_tasks",
    "required_commands": ["incident-detect", "contain-threat", "forensic-analysis", "eradicate-threat", "system-recovery"],
    "minimum_score": 95,
    "timeline_limit": 180,
    "report_required": true
  }',
  '["Análise Básica de Malware", "Segurança em Redes Wi-Fi"]'
);

-- Missão 7: Penetration Testing Básico (Expert)
INSERT INTO missions (
  title,
  description,
  objective,
  content,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  estimated_time,
  is_active,
  steps,
  tags,
  hints,
  validation_criteria,
  prerequisites,
  max_attempts
) VALUES (
  'Introdução ao Penetration Testing',
  'Aprenda os fundamentos de testes de penetração éticos.',
  'Realizar um pentest básico seguindo metodologias como OWASP e PTES.',
  'Missão expert que ensina reconhecimento, scanning, enumeração, exploração e pós-exploração em ambiente controlado e legal.',
  'cybersecurity',
  'expert',
  'terminal',
  500,
  250,
  180,
  true,
  '[
    {
      "id": 1,
      "title": "Reconhecimento",
      "description": "Colete informações sobre o alvo",
      "completed": false
    },
    {
      "id": 2,
      "title": "Scanning e Enumeração",
      "description": "Identifique serviços e vulnerabilidades",
      "completed": false
    },
    {
      "id": 3,
      "title": "Análise de Vulnerabilidades",
      "description": "Avalie e priorize vulnerabilidades encontradas",
      "completed": false
    },
    {
      "id": 4,
      "title": "Exploração Controlada",
      "description": "Execute exploits em ambiente de teste",
      "completed": false
    },
    {
      "id": 5,
      "title": "Pós-Exploração",
      "description": "Demonstre impacto das vulnerabilidades",
      "completed": false
    },
    {
      "id": 6,
      "title": "Relatório de Pentest",
      "description": "Documente achados e recomendações",
      "completed": false
    }
  ]',
  '["penetration-testing", "ethical-hacking", "owasp", "expert", "security-testing"]',
  '[
    "Sempre obtenha autorização antes de testar",
    "Use apenas ambientes de laboratório designados",
    "Documente cada passo do processo de teste"
  ]',
  '{
    "completion_criteria": "complete_terminal_tasks",
    "required_commands": ["nmap-scan", "vulnerability-scan", "exploit-run", "post-exploit", "generate-report"],
    "minimum_score": 95,
    "timeline_limit": 240,
    "report_required": true,
    "ethical_agreement": true
  }',
  '["Resposta a Incidentes de Segurança", "Análise Básica de Malware"]',
  1
);

-- Missão Diária: Verificação de Segurança
INSERT INTO missions (
  title,
  description,
  objective,
  content,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  estimated_time,
  is_active,
  is_daily,
  steps,
  tags,
  validation_criteria
) VALUES (
  'Verificação Diária de Segurança',
  'Realize verificações básicas de segurança em seus dispositivos.',
  'Manter boas práticas de segurança através de verificações diárias.',
  'Missão diária que incentiva a verificação regular de atualizações, backup de dados e monitoramento de atividades suspeitas.',
  'cybersecurity',
  'easy',
  'terminal',
  50,
  25,
  15,
  true,
  true,
  '[
    {
      "id": 1,
      "title": "Verificar Atualizações",
      "description": "Verifique atualizações do sistema e aplicativos",
      "completed": false
    },
    {
      "id": 2,
      "title": "Backup de Dados",
      "description": "Confirme que backups estão funcionando",
      "completed": false
    },
    {
      "id": 3,
      "title": "Monitorar Atividades",
      "description": "Revise logs de segurança e atividades suspeitas",
      "completed": false
    }
  ]',
  '["daily-security", "maintenance", "monitoring", "best-practices"]',
  '{
    "completion_criteria": "complete_all_steps",
    "daily_reset": true,
    "minimum_score": 100
  }'
);