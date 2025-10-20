-- ============================================================================
-- SINCRONIZAÇÃO ESTRUTURAL ENTRE MISSÕES E SIMULADOS
-- ============================================================================
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Garante estrutura idêntica entre missões e simulados (5 objetivos)

-- ========================================
-- PADRONIZAÇÃO DE SIMULAÇÕES
-- ========================================

-- Adicionar campo objectives às simulações (se não existir)
ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS objectives jsonb DEFAULT '[]'::jsonb;

-- Adicionar campo steps às simulações (se não existir)
ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS steps jsonb DEFAULT '[]'::jsonb;

-- Adicionar campo validation_criteria às simulações (se não existir)
ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS validation_criteria jsonb DEFAULT '{}'::jsonb;

-- Adicionar campo checkpoints às simulações (se não existir)
ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS checkpoints jsonb DEFAULT '[]'::jsonb;

-- Adicionar campo tags às simulações (se não existir)
ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;

-- Adicionar campo max_attempts às simulações (se não existir)
ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 3;

-- Adicionar campo time_limit às simulações (se não existir)
ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS time_limit integer DEFAULT 60;

-- Adicionar campo points às simulações (se não existir)
ALTER TABLE simulations 
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;

-- ========================================
-- FUNÇÃO PARA PADRONIZAR OBJETIVOS (5 OBJETIVOS)
-- ========================================

CREATE OR REPLACE FUNCTION standardize_objectives()
RETURNS void AS $$
DECLARE
    mission_record RECORD;
    simulation_record RECORD;
    standardized_objectives jsonb;
BEGIN
    -- Padronizar objetivos das missões para 5 objetivos
    FOR mission_record IN 
        SELECT id, objectives, title, description 
        FROM missions 
        WHERE objectives IS NULL OR jsonb_array_length(objectives) != 5
    LOOP
        -- Criar 5 objetivos padrão baseados no título e descrição
        standardized_objectives := jsonb_build_array(
            jsonb_build_object(
                'id', 1,
                'title', 'Iniciar ' || mission_record.title,
                'description', 'Comece a missão e familiarize-se com o ambiente',
                'completed', false,
                'required', true
            ),
            jsonb_build_object(
                'id', 2,
                'title', 'Analisar o Cenário',
                'description', 'Examine o contexto e identifique os requisitos',
                'completed', false,
                'required', true
            ),
            jsonb_build_object(
                'id', 3,
                'title', 'Executar Comandos',
                'description', 'Execute os comandos necessários para completar a tarefa',
                'completed', false,
                'required', true
            ),
            jsonb_build_object(
                'id', 4,
                'title', 'Validar Resultados',
                'description', 'Verifique se os resultados estão corretos',
                'completed', false,
                'required', true
            ),
            jsonb_build_object(
                'id', 5,
                'title', 'Finalizar Missão',
                'description', 'Complete a missão e receba as recompensas',
                'completed', false,
                'required', true
            )
        );

        UPDATE missions 
        SET objectives = standardized_objectives,
            updated_at = NOW()
        WHERE id = mission_record.id;
    END LOOP;

    -- Padronizar objetivos das simulações para 5 objetivos
    FOR simulation_record IN 
        SELECT id, objectives, title, description 
        FROM simulations 
        WHERE objectives IS NULL OR jsonb_array_length(objectives) != 5
    LOOP
        -- Criar 5 objetivos padrão baseados no título e descrição
        standardized_objectives := jsonb_build_array(
            jsonb_build_object(
                'id', 1,
                'title', 'Iniciar Simulação',
                'description', 'Configure o ambiente e inicie a simulação',
                'completed', false,
                'required', true
            ),
            jsonb_build_object(
                'id', 2,
                'title', 'Reconhecimento',
                'description', 'Realize o reconhecimento inicial do ambiente',
                'completed', false,
                'required', true
            ),
            jsonb_build_object(
                'id', 3,
                'title', 'Exploração',
                'description', 'Explore vulnerabilidades e execute ataques',
                'completed', false,
                'required', true
            ),
            jsonb_build_object(
                'id', 4,
                'title', 'Capturar Flag',
                'description', 'Encontre e capture a flag do desafio',
                'completed', false,
                'required', true
            ),
            jsonb_build_object(
                'id', 5,
                'title', 'Documentar Solução',
                'description', 'Documente a solução e finalize a simulação',
                'completed', false,
                'required', true
            )
        );

        UPDATE simulations 
        SET objectives = standardized_objectives,
            updated_at = NOW()
        WHERE id = simulation_record.id;
    END LOOP;

    RAISE NOTICE 'Objetivos padronizados para 5 objetivos em todas as missões e simulações';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FUNÇÃO PARA PADRONIZAR STEPS (5 PASSOS)
-- ========================================

CREATE OR REPLACE FUNCTION standardize_steps()
RETURNS void AS $$
DECLARE
    mission_record RECORD;
    simulation_record RECORD;
    standardized_steps jsonb;
BEGIN
    -- Padronizar steps das missões para 5 passos
    FOR mission_record IN 
        SELECT id, steps, title, type 
        FROM missions 
        WHERE steps IS NULL OR jsonb_array_length(steps) != 5
    LOOP
        standardized_steps := jsonb_build_array(
            jsonb_build_object(
                'id', 1,
                'title', 'Preparação',
                'description', 'Prepare o ambiente e ferramentas necessárias',
                'command', '',
                'expected_output', '',
                'completed', false
            ),
            jsonb_build_object(
                'id', 2,
                'title', 'Análise Inicial',
                'description', 'Analise o problema e planeje a abordagem',
                'command', '',
                'expected_output', '',
                'completed', false
            ),
            jsonb_build_object(
                'id', 3,
                'title', 'Execução Principal',
                'description', 'Execute a tarefa principal da missão',
                'command', '',
                'expected_output', '',
                'completed', false
            ),
            jsonb_build_object(
                'id', 4,
                'title', 'Verificação',
                'description', 'Verifique os resultados obtidos',
                'command', '',
                'expected_output', '',
                'completed', false
            ),
            jsonb_build_object(
                'id', 5,
                'title', 'Conclusão',
                'description', 'Finalize e documente os resultados',
                'command', '',
                'expected_output', '',
                'completed', false
            )
        );

        UPDATE missions 
        SET steps = standardized_steps,
            updated_at = NOW()
        WHERE id = mission_record.id;
    END LOOP;

    -- Padronizar steps das simulações
    FOR simulation_record IN 
        SELECT id, steps, title, category 
        FROM simulations 
        WHERE steps IS NULL OR jsonb_array_length(steps) != 5
    LOOP
        standardized_steps := jsonb_build_array(
            jsonb_build_object(
                'id', 1,
                'title', 'Setup Ambiente',
                'description', 'Configure o ambiente de simulação',
                'command', '',
                'expected_output', '',
                'completed', false
            ),
            jsonb_build_object(
                'id', 2,
                'title', 'Reconhecimento',
                'description', 'Realize scan e reconhecimento do alvo',
                'command', '',
                'expected_output', '',
                'completed', false
            ),
            jsonb_build_object(
                'id', 3,
                'title', 'Exploração',
                'description', 'Execute a exploração das vulnerabilidades',
                'command', '',
                'expected_output', '',
                'completed', false
            ),
            jsonb_build_object(
                'id', 4,
                'title', 'Pós-Exploração',
                'description', 'Realize atividades pós-exploração',
                'command', '',
                'expected_output', '',
                'completed', false
            ),
            jsonb_build_object(
                'id', 5,
                'title', 'Relatório',
                'description', 'Documente e finalize a simulação',
                'command', '',
                'expected_output', '',
                'completed', false
            )
        );

        UPDATE simulations 
        SET steps = standardized_steps,
            updated_at = NOW()
        WHERE id = simulation_record.id;
    END LOOP;

    RAISE NOTICE 'Steps padronizados para 5 passos em todas as missões e simulações';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- EXECUTAR PADRONIZAÇÃO
-- ========================================

-- Executar padronização de objetivos
SELECT standardize_objectives();

-- Executar padronização de steps
SELECT standardize_steps();

-- ========================================
-- CRIAR CONSTRAINTS PARA MANTER PADRÃO
-- ========================================

-- Constraint para garantir 5 objetivos nas missões
ALTER TABLE missions 
ADD CONSTRAINT check_missions_objectives_count 
CHECK (jsonb_array_length(objectives) = 5);

-- Constraint para garantir 5 objetivos nas simulações
ALTER TABLE simulations 
ADD CONSTRAINT check_simulations_objectives_count 
CHECK (jsonb_array_length(objectives) = 5);

-- Constraint para garantir 5 steps nas missões
ALTER TABLE missions 
ADD CONSTRAINT check_missions_steps_count 
CHECK (jsonb_array_length(steps) = 5);

-- Constraint para garantir 5 steps nas simulações
ALTER TABLE simulations 
ADD CONSTRAINT check_simulations_steps_count 
CHECK (jsonb_array_length(steps) = 5);

-- ========================================
-- DOCUMENTAÇÃO DA SINCRONIZAÇÃO
-- ========================================

INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'structure_synchronization',
    'Estrutura sincronizada entre missões e simulados - 5 objetivos e 5 passos padronizados',
    jsonb_build_object(
        'migration_file', '20250117_sync_missions_simulations.sql',
        'synchronization_completed', true,
        'standardized_structure', jsonb_build_object(
            'objectives_count', 5,
            'steps_count', 5,
            'fields_added_to_simulations', ARRAY[
                'objectives',
                'steps', 
                'validation_criteria',
                'checkpoints',
                'tags',
                'max_attempts',
                'time_limit',
                'points'
            ],
            'constraints_added', ARRAY[
                'check_missions_objectives_count',
                'check_simulations_objectives_count',
                'check_missions_steps_count',
                'check_simulations_steps_count'
            ]
        ),
        'functions_created', ARRAY[
            'standardize_objectives()',
            'standardize_steps()'
        ],
        'consistency_achieved', true,
        'timestamp', NOW()
    ),
    NOW()
);

-- Verificação final
SELECT 
    'Sincronização concluída' as status,
    (SELECT COUNT(*) FROM missions WHERE jsonb_array_length(objectives) = 5) as missions_with_5_objectives,
    (SELECT COUNT(*) FROM simulations WHERE jsonb_array_length(objectives) = 5) as simulations_with_5_objectives,
    (SELECT COUNT(*) FROM missions WHERE jsonb_array_length(steps) = 5) as missions_with_5_steps,
    (SELECT COUNT(*) FROM simulations WHERE jsonb_array_length(steps) = 5) as simulations_with_5_steps;

SELECT 'Estrutura de missões e simulados sincronizada com sucesso!' as resultado;
