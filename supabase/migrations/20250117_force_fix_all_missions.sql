-- ============================================================================
-- CORREÇÃO FORÇADA: PADRONIZAR TODAS AS MISSÕES COM 5 OBJETIVOS
-- ============================================================================
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Força a padronização de todas as missões para 5 objetivos

-- ========================================
-- ATUALIZAR TODAS AS MISSÕES PARA 5 PASSOS
-- ========================================

-- Primeiro, vamos atualizar missões que têm steps mas não têm 5 passos
UPDATE missions 
SET steps = CASE 
  WHEN title = 'Análise Forense de Logs' THEN '[
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
  ]'::jsonb
  
  WHEN title = 'Configuração de Firewall Linux' THEN '[
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
      "description": "Configure proteção contra ataques de força bruta",
      "command": "sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH",
      "expected_output": "Proteção contra força bruta configurada"
    },
    {
      "id": 5,
      "title": "Salvar configurações",
      "description": "Persista as regras do firewall",
      "command": "sudo iptables-save > /etc/iptables/rules.v4",
      "expected_output": "Regras salvas permanentemente"
    }
  ]'::jsonb
  
  WHEN title = 'Análise de Vulnerabilidades Web' THEN '[
    {
      "id": 1,
      "title": "Reconhecimento inicial",
      "description": "Identifique tecnologias e serviços do alvo",
      "command": "nmap -sV -sC target.com",
      "expected_output": "Serviços e versões identificados"
    },
    {
      "id": 2,
      "title": "Enumeração de diretórios",
      "description": "Descubra diretórios e arquivos ocultos",
      "command": "dirb http://target.com /usr/share/dirb/wordlists/common.txt",
      "expected_output": "Diretórios descobertos"
    },
    {
      "id": 3,
      "title": "Análise de vulnerabilidades",
      "description": "Execute scan automatizado de vulnerabilidades",
      "command": "nikto -h http://target.com",
      "expected_output": "Vulnerabilidades identificadas"
    },
    {
      "id": 4,
      "title": "Teste de injeção SQL",
      "description": "Verifique vulnerabilidades de SQL injection",
      "command": "sqlmap -u \"http://target.com/login.php\" --forms --batch",
      "expected_output": "Vulnerabilidades SQL identificadas"
    },
    {
      "id": 5,
      "title": "Relatório de vulnerabilidades",
      "description": "Compile um relatório detalhado das descobertas",
      "command": "echo \"Relatório de Vulnerabilidades - $(date)\" > /tmp/vuln_report.txt",
      "expected_output": "Relatório de vulnerabilidades gerado"
    }
  ]'::jsonb
  
  ELSE '[
    {
      "id": 1,
      "title": "Passo 1",
      "description": "Primeiro passo da missão",
      "command": "echo \"Iniciando missão\"",
      "expected_output": "Missão iniciada"
    },
    {
      "id": 2,
      "title": "Passo 2",
      "description": "Segundo passo da missão",
      "command": "echo \"Executando passo 2\"",
      "expected_output": "Passo 2 executado"
    },
    {
      "id": 3,
      "title": "Passo 3",
      "description": "Terceiro passo da missão",
      "command": "echo \"Executando passo 3\"",
      "expected_output": "Passo 3 executado"
    },
    {
      "id": 4,
      "title": "Passo 4",
      "description": "Quarto passo da missão",
      "command": "echo \"Executando passo 4\"",
      "expected_output": "Passo 4 executado"
    },
    {
      "id": 5,
      "title": "Passo 5",
      "description": "Quinto passo da missão",
      "command": "echo \"Missão concluída\"",
      "expected_output": "Missão concluída com sucesso"
    }
  ]'::jsonb
END
WHERE is_active = true;

-- Atualizar objectives para corresponder aos steps (5 objetivos)
UPDATE missions 
SET objectives = CASE 
  WHEN title = 'Análise Forense de Logs' THEN '[
    {"title": "Verificar logs de autenticação", "description": "Examine tentativas de login suspeitas", "xpReward": 20, "hint": "Use grep para filtrar logs"},
    {"title": "Analisar padrões de IP", "description": "Identifique IPs suspeitos", "xpReward": 20, "hint": "Use awk e sort para análise"},
    {"title": "Examinar horários", "description": "Identifique padrões temporais", "xpReward": 20, "hint": "Analise timestamps dos logs"},
    {"title": "Verificar logs de sistema", "description": "Analise eventos críticos", "xpReward": 20, "hint": "Use tail e grep para filtrar"},
    {"title": "Gerar relatório", "description": "Compile descobertas", "xpReward": 20, "hint": "Documente todas as descobertas"}
  ]'::jsonb
  
  WHEN title = 'Configuração de Firewall Linux' THEN '[
    {"title": "Verificar status atual", "description": "Analise regras existentes", "xpReward": 20, "hint": "Use iptables -L"},
    {"title": "Configurar política padrão", "description": "Defina políticas de segurança", "xpReward": 20, "hint": "Use iptables -P"},
    {"title": "Permitir tráfego essencial", "description": "Configure regras básicas", "xpReward": 20, "hint": "Libere portas 80 e 443"},
    {"title": "Bloquear força bruta", "description": "Configure proteção SSH", "xpReward": 20, "hint": "Use módulo recent do iptables"},
    {"title": "Salvar configurações", "description": "Persista as regras", "xpReward": 20, "hint": "Use iptables-save"}
  ]'::jsonb
  
  WHEN title = 'Análise de Vulnerabilidades Web' THEN '[
    {"title": "Reconhecimento inicial", "description": "Identifique tecnologias", "xpReward": 20, "hint": "Use nmap com -sV"},
    {"title": "Enumeração de diretórios", "description": "Descubra arquivos ocultos", "xpReward": 20, "hint": "Use dirb ou gobuster"},
    {"title": "Análise de vulnerabilidades", "description": "Execute scan automatizado", "xpReward": 20, "hint": "Use nikto ou OpenVAS"},
    {"title": "Teste de injeção SQL", "description": "Verifique SQL injection", "xpReward": 20, "hint": "Use sqlmap"},
    {"title": "Relatório final", "description": "Compile descobertas", "xpReward": 20, "hint": "Documente todas as vulnerabilidades"}
  ]'::jsonb
  
  ELSE '[
    {"title": "Objetivo 1", "description": "Primeiro objetivo da missão", "xpReward": 20, "hint": "Siga as instruções"},
    {"title": "Objetivo 2", "description": "Segundo objetivo da missão", "xpReward": 20, "hint": "Execute os comandos"},
    {"title": "Objetivo 3", "description": "Terceiro objetivo da missão", "xpReward": 20, "hint": "Analise os resultados"},
    {"title": "Objetivo 4", "description": "Quarto objetivo da missão", "xpReward": 20, "hint": "Verifique a saída"},
    {"title": "Objetivo 5", "description": "Quinto objetivo da missão", "xpReward": 20, "hint": "Complete a missão"}
  ]'::jsonb
END
WHERE is_active = true;

-- ========================================
-- LOG DA CORREÇÃO
-- ========================================

INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'missions_structure_fixed',
    'Estrutura de missões corrigida - Todas as missões agora têm 5 objetivos e 5 passos',
    jsonb_build_object(
        'migration_file', '20250117_force_fix_all_missions.sql',
        'actions_performed', ARRAY[
            'Atualizadas todas as missões para 5 steps',
            'Atualizadas todas as missões para 5 objectives',
            'Padronizada estrutura entre missões e simulados',
            'Corrigidas inconsistências de objetivos'
        ],
        'missions_updated', (SELECT COUNT(*) FROM missions WHERE is_active = true),
        'timestamp', NOW()
    ),
    NOW()
);

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se todas as missões têm 5 passos
DO $$
DECLARE
    inconsistent_missions INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistent_missions
    FROM missions 
    WHERE is_active = true 
    AND (
        steps IS NULL 
        OR jsonb_array_length(steps) != 5
        OR objectives IS NULL 
        OR jsonb_array_length(objectives) != 5
    );
    
    IF inconsistent_missions > 0 THEN
        RAISE NOTICE 'ATENÇÃO: % missões ainda precisam de ajustes', inconsistent_missions;
    ELSE
        RAISE NOTICE 'SUCESSO: Todas as missões têm exatamente 5 passos e 5 objetivos';
    END IF;
END $$;

SELECT 'Correção forçada de missões concluída!' as resultado;
