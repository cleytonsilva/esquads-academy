-- Inserir missões de cybersegurança de exemplo
INSERT INTO missions (
  title,
  description,
  category,
  difficulty,
  type,
  points_reward,
  experience_reward,
  target_value,
  objective,
  content,
  steps,
  tags,
  estimated_time,
  is_active
) VALUES 
(
  'Análise de Vulnerabilidades Web',
  'Identifique e analise vulnerabilidades comuns em aplicações web usando ferramentas de segurança.',
  'cybersecurity',
  'medium',
  'terminal',
  150,
  75,
  1,
  'Realizar uma análise completa de vulnerabilidades em uma aplicação web de teste',
  'Nesta missão, você aprenderá a identificar e analisar vulnerabilidades web comuns como XSS, SQL Injection e CSRF. Utilizaremos ferramentas como OWASP ZAP e Burp Suite para realizar testes de penetração básicos.',
  '[
    {
      "id": 1,
      "title": "Configurar ambiente de teste",
      "description": "Configure o ambiente com a aplicação web vulnerável",
      "command": "docker run -d -p 8080:80 webgoat/webgoat-8.0",
      "expected_output": "Container iniciado com sucesso"
    },
    {
      "id": 2,
      "title": "Executar scan inicial",
      "description": "Execute um scan básico com OWASP ZAP",
      "command": "zap-baseline.py -t http://localhost:8080",
      "expected_output": "Scan completado, vulnerabilidades encontradas"
    },
    {
      "id": 3,
      "title": "Analisar resultados",
      "description": "Analise o relatório gerado e identifique as principais vulnerabilidades",
      "command": "cat zap-report.html | grep -i \"high\\|medium\"",
      "expected_output": "Lista de vulnerabilidades críticas e médias"
    }
  ]'::jsonb,
  '["cybersecurity", "web-security", "penetration-testing", "owasp"]'::jsonb,
  45,
  true
),
(
  'Configuração de Firewall Linux',
  'Configure e teste regras de firewall usando iptables para proteger um servidor Linux.',
  'cybersecurity',
  'easy',
  'terminal',
  100,
  50,
  1,
  'Configurar regras básicas de firewall para proteger um servidor web',
  'Aprenda a configurar o iptables para criar regras de firewall eficazes. Esta missão cobre desde conceitos básicos até configurações avançadas para proteger serviços específicos.',
  '[
    {
      "id": 1,
      "title": "Verificar status atual",
      "description": "Verifique as regras atuais do iptables",
      "command": "sudo iptables -L -n -v",
      "expected_output": "Lista das regras atuais do firewall"
    },
    {
      "id": 2,
      "title": "Bloquear tráfego malicioso",
      "description": "Crie regra para bloquear tentativas de força bruta",
      "command": "sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH",
      "expected_output": "Regra adicionada com sucesso"
    },
    {
      "id": 3,
      "title": "Permitir tráfego web",
      "description": "Configure regras para permitir HTTP e HTTPS",
      "command": "sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT && sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT",
      "expected_output": "Regras de web adicionadas"
    }
  ]'::jsonb,
  '["cybersecurity", "firewall", "linux", "iptables", "network-security"]'::jsonb,
  30,
  true
),
(
  'Análise Forense de Logs',
  'Analise logs de sistema para identificar atividades suspeitas e possíveis ataques.',
  'cybersecurity',
  'hard',
  'terminal',
  200,
  100,
  1,
  'Identificar atividades maliciosas através da análise de logs de sistema',
  'Desenvolva habilidades de análise forense digital através do exame de logs de sistema. Aprenda a identificar padrões suspeitos, tentativas de invasão e atividades maliciosas.',
  '[
    {
      "id": 1,
      "title": "Examinar logs de autenticação",
      "description": "Analise tentativas de login suspeitas",
      "command": "grep \"Failed password\" /var/log/auth.log | head -20",
      "expected_output": "Lista de tentativas de login falhadas"
    },
    {
      "id": 2,
      "title": "Identificar IPs suspeitos",
      "description": "Encontre IPs com múltiplas tentativas de acesso",
      "command": "grep \"Failed password\" /var/log/auth.log | awk ''{print $11}'' | sort | uniq -c | sort -nr",
      "expected_output": "Lista de IPs ordenada por número de tentativas"
    },
    {
      "id": 3,
      "title": "Analisar horários de atividade",
      "description": "Identifique padrões temporais suspeitos",
      "command": "grep \"Failed password\" /var/log/auth.log | awk ''{print $1, $2, $3}'' | sort | uniq -c",
      "expected_output": "Distribuição temporal das tentativas"
    }
  ]'::jsonb,
  '["cybersecurity", "forensics", "log-analysis", "incident-response"]'::jsonb,
  60,
  true
),
(
  'Teste de Penetração em Rede',
  'Execute testes de penetração básicos em uma rede local usando Nmap e outras ferramentas.',
  'cybersecurity',
  'expert',
  'terminal',
  300,
  150,
  1,
  'Realizar reconhecimento e testes de penetração em ambiente controlado',
  'Aprenda técnicas de teste de penetração ética usando ferramentas como Nmap, Metasploit e Wireshark. Esta missão avançada cobre desde reconhecimento até exploração controlada.',
  '[
    {
      "id": 1,
      "title": "Descoberta de hosts",
      "description": "Identifique hosts ativos na rede",
      "command": "nmap -sn 192.168.1.0/24",
      "expected_output": "Lista de hosts ativos encontrados"
    },
    {
      "id": 2,
      "title": "Scan de portas",
      "description": "Execute scan detalhado de portas e serviços",
      "command": "nmap -sS -sV -O 192.168.1.100",
      "expected_output": "Informações detalhadas sobre portas e serviços"
    },
    {
      "id": 3,
      "title": "Análise de vulnerabilidades",
      "description": "Execute scripts NSE para detectar vulnerabilidades",
      "command": "nmap --script vuln 192.168.1.100",
      "expected_output": "Relatório de vulnerabilidades encontradas"
    }
  ]'::jsonb,
  '["cybersecurity", "penetration-testing", "nmap", "network-security", "reconnaissance"]'::jsonb,
  90,
  true
),
(
  'Resposta a Incidentes de Segurança',
  'Simule uma resposta a um incidente de segurança seguindo protocolos padrão da indústria.',
  'cybersecurity',
  'hard',
  'terminal',
  250,
  125,
  1,
  'Executar procedimentos de resposta a incidentes de segurança',
  'Aprenda a responder adequadamente a incidentes de segurança, desde a detecção inicial até a recuperação completa. Esta missão simula um cenário real de resposta a incidentes.',
  '[
    {
      "id": 1,
      "title": "Identificação do incidente",
      "description": "Analise alertas e identifique o tipo de incidente",
      "command": "tail -f /var/log/security.log | grep -i \"alert\\|warning\\|critical\"",
      "expected_output": "Alertas de segurança identificados"
    },
    {
      "id": 2,
      "title": "Contenção inicial",
      "description": "Implemente medidas de contenção imediata",
      "command": "sudo iptables -A INPUT -s 192.168.1.50 -j DROP",
      "expected_output": "IP malicioso bloqueado"
    },
    {
      "id": 3,
      "title": "Coleta de evidências",
      "description": "Colete evidências para análise forense",
      "command": "sudo dd if=/dev/sda1 of=/tmp/evidence.img bs=4096",
      "expected_output": "Imagem forense criada com sucesso"
    }
  ]'::jsonb,
  '["cybersecurity", "incident-response", "forensics", "security-operations"]'::jsonb,
  75,
  true
);