-- ============================================================================
-- CORREÇÃO DE INCONSISTÊNCIA: PADRONIZAR MISSÕES COM 5 OBJETIVOS
-- ============================================================================
-- Problema identificado: Protótipo usa 5 passos, banco tem 3 passos
-- Solução: Padronizar todas as missões para 5 objetivos consistentes

-- Log da correção (comentado devido a restrições de UUID)
-- INSERT INTO system_activities (
--     activity_type,
--     activity_description,
--     user_id,
--     metadata,
--     created_at
-- ) VALUES (
--     'database_correction',
--     'Correção de inconsistência: Padronizando missões para 5 objetivos (protótipo usa 5 passos, banco tinha 3)',
--     NULL,
--     jsonb_build_object(
--         'issue', 'Inconsistência entre protótipo (5 passos) e banco de dados (3 passos)',
--         'solution', 'Padronizar todas as missões para 5 objetivos',
--         'affected_missions', ARRAY['Análise Forense de Logs', 'Configuração de Firewall Linux', 'Análise de Vulnerabilidades Web'],
--         'timestamp', NOW()
--     ),
--     NOW()
-- );

-- ============================================================================
-- ATUALIZAR MISSÃO: Análise Forense de Logs (expandir de 3 para 5 passos)
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
  ]'::jsonb
WHERE title = 'Análise Forense de Logs';

-- ============================================================================
-- ATUALIZAR MISSÃO: Configuração de Firewall Linux (expandir de 3 para 5 passos)
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
  ]'::jsonb
WHERE title = 'Configuração de Firewall Linux';

-- ============================================================================
-- ATUALIZAR MISSÃO: Análise de Vulnerabilidades Web (expandir de 3 para 5 passos)
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
  ]'::jsonb
WHERE title = 'Análise de Vulnerabilidades Web';

-- ============================================================================
-- VERIFICAR TODAS AS MISSÕES PARA GARANTIR 5 PASSOS
-- ============================================================================

-- Verificar quantos passos cada missão tem
SELECT 
    title,
    jsonb_array_length(steps) as num_steps,
    category,
    difficulty
FROM missions 
WHERE steps IS NOT NULL
ORDER BY num_steps, title;

-- Log de verificação (comentado)
-- Verificação: Todas as missões agora têm estrutura consistente de 5 passos

-- ============================================================================
-- ATUALIZAR OBJETIVOS PARA CORRESPONDER AOS 5 PASSOS
-- ============================================================================

-- Função para gerar objetivos padrão baseados nos passos
CREATE OR REPLACE FUNCTION generate_mission_objectives(mission_steps jsonb)
RETURNS jsonb AS $$
DECLARE
    objectives jsonb := '[]'::jsonb;
    step_item jsonb;
    objective jsonb;
    step_counter int := 1;
BEGIN
    FOR step_item IN SELECT * FROM jsonb_array_elements(mission_steps)
    LOOP
        objective := jsonb_build_object(
            'id', step_counter,
            'title', step_item->>'title',
            'description', step_item->>'description',
            'expectedCommand', step_item->>'command',
            'points', 20,
            'completed', false
        );
        objectives := objectives || objective;
        step_counter := step_counter + 1;
    END LOOP;
    
    RETURN objectives;
END;
$$ LANGUAGE plpgsql;

-- Atualizar objetivos para todas as missões baseado nos passos
UPDATE missions 
SET objectives = generate_mission_objectives(steps)
WHERE steps IS NOT NULL AND jsonb_array_length(steps) = 5;

-- Remover função temporária
DROP FUNCTION generate_mission_objectives(jsonb);

-- Log final (comentado)
-- Correção concluída: Todas as missões agora têm 5 passos e objetivos correspondentes

-- ============================================================================
-- VALIDAÇÃO FINAL
-- ============================================================================

-- Verificar se todas as missões têm exatamente 5 passos
DO $$
DECLARE
    inconsistent_missions int;
BEGIN
    SELECT COUNT(*) INTO inconsistent_missions
    FROM missions 
    WHERE steps IS NOT NULL AND jsonb_array_length(steps) != 5;
    
    IF inconsistent_missions > 0 THEN
        RAISE EXCEPTION 'ERRO: % missões ainda têm número inconsistente de passos', inconsistent_missions;
    ELSE
        RAISE NOTICE 'SUCESSO: Todas as missões têm exatamente 5 passos';
    END IF;
END $$;
