-- ============================================================================
-- CORREÇÃO SIMPLES: PADRONIZAR MISSÕES PARA 5 PASSOS
-- ============================================================================
-- Atualizar apenas missões que não têm 5 passos ou têm steps vazios

-- Primeiro, vamos verificar quantas missões têm steps vazios ou nulos
SELECT 
    COUNT(*) as total_missions,
    COUNT(CASE WHEN steps IS NULL OR steps = '[]'::jsonb THEN 1 END) as empty_steps,
    COUNT(CASE WHEN steps IS NOT NULL AND jsonb_array_length(steps) < 5 THEN 1 END) as less_than_5_steps
FROM missions;

-- ============================================================================
-- ATUALIZAR MISSÃO: Análise Forense de Logs (expandir para 5 passos)
-- ============================================================================

UPDATE missions 
SET steps = '[
    {
      "id": 1,
      "title": "Verificar logs de autenticação",
      "description": "Examine tentativas de login suspeitas no sistema",
      "command": "grep \"Failed password\" /var/log/auth.log | head -20",
      "expected_output": "Lista de tentativas de login falhadas"
    },
    {
      "id": 2,
      "title": "Analisar padrões de IP",
      "description": "Identifique IPs com múltiplas tentativas de acesso",
      "command": "grep \"Failed password\" /var/log/auth.log | awk ''{print $11}'' | sort | uniq -c | sort -nr",
      "expected_output": "Lista de IPs ordenada por número de tentativas"
    },
    {
      "id": 3,
      "title": "Examinar horários de atividade",
      "description": "Identifique padrões temporais suspeitos",
      "command": "grep \"Failed password\" /var/log/auth.log | awk ''{print $1, $2, $3}'' | sort | uniq -c",
      "expected_output": "Distribuição temporal das tentativas"
    },
    {
      "id": 4,
      "title": "Verificar logs de sistema",
      "description": "Analise logs do sistema para atividades anômalas",
      "command": "tail -50 /var/log/syslog | grep -i \"error\\|warning\\|critical\"",
      "expected_output": "Eventos críticos do sistema identificados"
    },
    {
      "id": 5,
      "title": "Gerar relatório de segurança",
      "description": "Compile um relatório final das descobertas",
      "command": "echo \"Relatório de Análise Forense - $(date)\" > /tmp/security_report.txt",
      "expected_output": "Relatório de segurança gerado com sucesso"
    }
  ]'::jsonb,
  objectives = '[
    {
      "id": 1,
      "title": "Verificar logs de autenticação",
      "description": "Examine tentativas de login suspeitas no sistema",
      "expectedCommand": "grep \"Failed password\" /var/log/auth.log | head -20",
      "points": 20,
      "completed": false
    },
    {
      "id": 2,
      "title": "Analisar padrões de IP",
      "description": "Identifique IPs com múltiplas tentativas de acesso",
      "expectedCommand": "grep \"Failed password\" /var/log/auth.log | awk ''{print $11}'' | sort | uniq -c | sort -nr",
      "points": 20,
      "completed": false
    },
    {
      "id": 3,
      "title": "Examinar horários de atividade",
      "description": "Identifique padrões temporais suspeitos",
      "expectedCommand": "grep \"Failed password\" /var/log/auth.log | awk ''{print $1, $2, $3}'' | sort | uniq -c",
      "points": 20,
      "completed": false
    },
    {
      "id": 4,
      "title": "Verificar logs de sistema",
      "description": "Analise logs do sistema para atividades anômalas",
      "expectedCommand": "tail -50 /var/log/syslog | grep -i \"error\\|warning\\|critical\"",
      "points": 20,
      "completed": false
    },
    {
      "id": 5,
      "title": "Gerar relatório de segurança",
      "description": "Compile um relatório final das descobertas",
      "expectedCommand": "echo \"Relatório de Análise Forense - $(date)\" > /tmp/security_report.txt",
      "points": 20,
      "completed": false
    }
  ]'::jsonb
WHERE title = 'Análise Forense de Logs';

-- ============================================================================
-- ATUALIZAR MISSÃO: Configuração de Firewall Linux (expandir para 5 passos)
-- ============================================================================

UPDATE missions 
SET steps = '[
    {
      "id": 1,
      "title": "Verificar status atual do firewall",
      "description": "Verifique as regras atuais do iptables",
      "command": "sudo iptables -L -n -v",
      "expected_output": "Lista das regras atuais do firewall"
    },
    {
      "id": 2,
      "title": "Configurar política padrão",
      "description": "Defina políticas padrão de segurança",
      "command": "sudo iptables -P INPUT DROP && sudo iptables -P FORWARD DROP",
      "expected_output": "Políticas padrão configuradas"
    },
    {
      "id": 3,
      "title": "Permitir tráfego essencial",
      "description": "Configure regras para permitir HTTP e HTTPS",
      "command": "sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT && sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT",
      "expected_output": "Regras de web adicionadas"
    },
    {
      "id": 4,
      "title": "Bloquear tentativas de força bruta",
      "description": "Crie regra para bloquear tentativas de força bruta SSH",
      "command": "sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH",
      "expected_output": "Proteção contra força bruta ativada"
    },
    {
      "id": 5,
      "title": "Salvar configurações",
      "description": "Persista as regras do firewall",
      "command": "sudo iptables-save > /etc/iptables/rules.v4",
      "expected_output": "Configurações do firewall salvas"
    }
  ]'::jsonb,
  objectives = '[
    {
      "id": 1,
      "title": "Verificar status atual do firewall",
      "description": "Verifique as regras atuais do iptables",
      "expectedCommand": "sudo iptables -L -n -v",
      "points": 20,
      "completed": false
    },
    {
      "id": 2,
      "title": "Configurar política padrão",
      "description": "Defina políticas padrão de segurança",
      "expectedCommand": "sudo iptables -P INPUT DROP && sudo iptables -P FORWARD DROP",
      "points": 20,
      "completed": false
    },
    {
      "id": 3,
      "title": "Permitir tráfego essencial",
      "description": "Configure regras para permitir HTTP e HTTPS",
      "expectedCommand": "sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT && sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT",
      "points": 20,
      "completed": false
    },
    {
      "id": 4,
      "title": "Bloquear tentativas de força bruta",
      "description": "Crie regra para bloquear tentativas de força bruta SSH",
      "expectedCommand": "sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH",
      "points": 20,
      "completed": false
    },
    {
      "id": 5,
      "title": "Salvar configurações",
      "description": "Persista as regras do firewall",
      "expectedCommand": "sudo iptables-save > /etc/iptables/rules.v4",
      "points": 20,
      "completed": false
    }
  ]'::jsonb
WHERE title = 'Configuração de Firewall Linux';

-- ============================================================================
-- ATUALIZAR MISSÃO: Análise de Vulnerabilidades Web (expandir para 5 passos)
-- ============================================================================

UPDATE missions 
SET steps = '[
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
      "title": "Analisar vulnerabilidades críticas",
      "description": "Analise o relatório gerado e identifique vulnerabilidades críticas",
      "command": "cat zap-report.html | grep -i \"high\\|critical\"",
      "expected_output": "Lista de vulnerabilidades críticas"
    },
    {
      "id": 4,
      "title": "Testar vulnerabilidades manualmente",
      "description": "Execute testes manuais para confirmar vulnerabilidades",
      "command": "curl -X POST http://localhost:8080/login -d \"username=admin''OR 1=1--&password=test\"",
      "expected_output": "Teste de SQL Injection executado"
    },
    {
      "id": 5,
      "title": "Gerar relatório final",
      "description": "Compile um relatório detalhado das vulnerabilidades encontradas",
      "command": "echo \"Relatório de Vulnerabilidades - $(date)\" > /tmp/vuln_report.txt",
      "expected_output": "Relatório de vulnerabilidades gerado"
    }
  ]'::jsonb,
  objectives = '[
    {
      "id": 1,
      "title": "Configurar ambiente de teste",
      "description": "Configure o ambiente com a aplicação web vulnerável",
      "expectedCommand": "docker run -d -p 8080:80 webgoat/webgoat-8.0",
      "points": 20,
      "completed": false
    },
    {
      "id": 2,
      "title": "Executar scan inicial",
      "description": "Execute um scan básico com OWASP ZAP",
      "expectedCommand": "zap-baseline.py -t http://localhost:8080",
      "points": 20,
      "completed": false
    },
    {
      "id": 3,
      "title": "Analisar vulnerabilidades críticas",
      "description": "Analise o relatório gerado e identifique vulnerabilidades críticas",
      "expectedCommand": "cat zap-report.html | grep -i \"high\\|critical\"",
      "points": 20,
      "completed": false
    },
    {
      "id": 4,
      "title": "Testar vulnerabilidades manualmente",
      "description": "Execute testes manuais para confirmar vulnerabilidades",
      "expectedCommand": "curl -X POST http://localhost:8080/login -d \"username=admin''OR 1=1--&password=test\"",
      "points": 20,
      "completed": false
    },
    {
      "id": 5,
      "title": "Gerar relatório final",
      "description": "Compile um relatório detalhado das vulnerabilidades encontradas",
      "expectedCommand": "echo \"Relatório de Vulnerabilidades - $(date)\" > /tmp/vuln_report.txt",
      "points": 20,
      "completed": false
    }
  ]'::jsonb
WHERE title = 'Análise de Vulnerabilidades Web';

-- ============================================================================
-- VERIFICAÇÃO FINAL (sem validação que causa erro)
-- ============================================================================

-- Verificar quantos passos cada missão tem agora
SELECT 
    title,
    jsonb_array_length(steps) as num_steps,
    jsonb_array_length(objectives) as num_objectives,
    category,
    difficulty
FROM missions 
WHERE steps IS NOT NULL AND steps != '[]'::jsonb
ORDER BY num_steps, title;
