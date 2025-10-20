


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_level"("p_total_xp" integer) RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  -- Fórmula: Level = floor(sqrt(XP / 100)) + 1
  -- Level 1: 0-99 XP
  -- Level 2: 100-399 XP
  -- Level 3: 400-899 XP
  -- Level 4: 900-1599 XP
  -- etc.
  RETURN FLOOR(SQRT(p_total_xp::NUMERIC / 100)) + 1;
END;
$$;


ALTER FUNCTION "public"."calculate_level"("p_total_xp" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_speed_bonus"("p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_time_limit_seconds" integer) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  time_taken_seconds INT;
  time_percentage NUMERIC;
BEGIN
  time_taken_seconds := EXTRACT(EPOCH FROM (p_end_time - p_start_time));
  time_percentage := time_taken_seconds::NUMERIC / p_time_limit_seconds;
  
  -- Bônus de velocidade
  IF time_percentage < 0.25 THEN
    RETURN 1.5; -- +50% XP
  ELSIF time_percentage < 0.50 THEN
    RETURN 1.25; -- +25% XP
  ELSIF time_percentage < 0.75 THEN
    RETURN 1.1; -- +10% XP
  ELSE
    RETURN 1.0; -- Sem bônus
  END IF;
END;
$$;


ALTER FUNCTION "public"."calculate_speed_bonus"("p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_time_limit_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_and_award_badges"("p_user_id" "uuid") RETURNS TABLE("badge_id" "uuid", "badge_name" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_badge RECORD;
  v_criteria JSONB;
  v_missions_completed INT;
BEGIN
  -- Para cada badge que o usuário ainda não tem
  FOR v_badge IN 
    SELECT b.id, b.name, b.criteria_jsonb
    FROM badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id AND ub.badge_id = b.id
    )
  LOOP
    v_criteria := v_badge.criteria_jsonb;
    
    -- Verificar critério: mission_count
    IF v_criteria->>'type' = 'mission_count' THEN
      SELECT COUNT(*) INTO v_missions_completed
      FROM mission_attempts
      WHERE user_id = p_user_id
        AND status = 'completed'
        AND (
          v_criteria->>'difficulty' IS NULL
          OR EXISTS (
            SELECT 1 FROM missions m
            WHERE m.id = mission_attempts.mission_id
            AND m.difficulty = v_criteria->>'difficulty'
          )
        );
      
      -- Se atingiu o critério, conceder badge
      IF v_missions_completed >= (v_criteria->>'value')::INT THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (p_user_id, v_badge.id)
        ON CONFLICT DO NOTHING;
        
        -- Adicionar XP bônus (50 XP por badge)
        INSERT INTO xp_transactions (user_id, xp_amount, transaction_type, related_id, description)
        VALUES (p_user_id, 50, 'badge_bonus', v_badge.id, 'Badge conquistada: ' || v_badge.name);
        
        RETURN QUERY SELECT v_badge.id, v_badge.name;
      END IF;
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."check_and_award_badges"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_and_award_badges"("p_user_id" "uuid") IS 'Verificar e conceder badges automaticamente ao usuário';



CREATE OR REPLACE FUNCTION "public"."check_duplicate_profiles"() RETURNS TABLE("user_id" "uuid", "profile_count" bigint, "profile_ids" "uuid"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    COUNT(*) as profile_count,
    ARRAY_AGG(p.id) as profile_ids
  FROM profiles p
  GROUP BY p.user_id
  HAVING COUNT(*) > 1
  ORDER BY profile_count DESC;
END;
$$;


ALTER FUNCTION "public"."check_duplicate_profiles"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_duplicate_profiles"() IS 'Função para identificar perfis duplicados por user_id - usar temporariamente para debug';



CREATE OR REPLACE FUNCTION "public"."check_user_confirmation_status"("user_email" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    profile_record profiles%ROWTYPE;
    result JSON;
BEGIN
    -- Buscar usuário
    SELECT * INTO user_record
    FROM auth.users
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não encontrado',
            'email', user_email
        );
    END IF;
    
    -- Buscar perfil
    SELECT * INTO profile_record
    FROM profiles
    WHERE user_id = user_record.id;
    
    -- Montar resultado
    result := json_build_object(
        'success', true,
        'user_id', user_record.id,
        'email', user_record.email,
        'email_confirmed', user_record.email_confirmed_at IS NOT NULL,
        'email_confirmed_at', user_record.email_confirmed_at,
        'created_at', user_record.created_at,
        'last_sign_in_at', user_record.last_sign_in_at,
        'profile_exists', profile_record.id IS NOT NULL,
        'profile_name', profile_record.name,
        'profile_role', profile_record.role
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."check_user_confirmation_status"("user_email" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_user_confirmation_status"("user_email" "text") IS 'Verifica o status de confirmação de um usuário';



CREATE OR REPLACE FUNCTION "public"."confirm_all_users_dev_only"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    affected_count INTEGER;
    result JSON;
BEGIN
    -- ATENÇÃO: Esta função deve ser usada APENAS em desenvolvimento
    -- Confirmar todos os usuários não confirmados
    UPDATE auth.users
    SET 
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE email_confirmed_at IS NULL;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    result := json_build_object(
        'success', true,
        'message', 'Todos os usuários foram confirmados',
        'affected_users', affected_count,
        'confirmed_at', NOW(),
        'warning', 'Esta função deve ser usada APENAS em desenvolvimento'
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."confirm_all_users_dev_only"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."confirm_all_users_dev_only"() IS 'DESENVOLVIMENTO APENAS: Confirma todos os usuários não confirmados';



CREATE OR REPLACE FUNCTION "public"."confirm_user_email"("user_email" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    result JSON;
BEGIN
    -- Buscar usuário pelo email
    SELECT * INTO user_record
    FROM auth.users
    WHERE email = user_email;
    
    -- Verificar se usuário existe
    IF NOT FOUND THEN
        result := json_build_object(
            'success', false,
            'message', 'Usuário não encontrado',
            'email', user_email
        );
        RETURN result;
    END IF;
    
    -- Verificar se já está confirmado
    IF user_record.email_confirmed_at IS NOT NULL THEN
        result := json_build_object(
            'success', true,
            'message', 'Email já estava confirmado',
            'email', user_email,
            'confirmed_at', user_record.email_confirmed_at
        );
        RETURN result;
    END IF;
    
    -- Confirmar email
    UPDATE auth.users
    SET 
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = user_record.id;
    
    -- Retornar resultado
    result := json_build_object(
        'success', true,
        'message', 'Email confirmado com sucesso',
        'email', user_email,
        'user_id', user_record.id,
        'confirmed_at', NOW()
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."confirm_user_email"("user_email" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."confirm_user_email"("user_email" "text") IS 'Confirma manualmente o email de um usuário específico';



CREATE OR REPLACE FUNCTION "public"."count_unconfirmed_users"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    unconfirmed_count INTEGER;
    total_count INTEGER;
    result JSON;
BEGIN
    -- Contar usuários não confirmados
    SELECT COUNT(*) INTO unconfirmed_count
    FROM auth.users
    WHERE email_confirmed_at IS NULL;
    
    -- Contar total de usuários
    SELECT COUNT(*) INTO total_count
    FROM auth.users;
    
    result := json_build_object(
        'total_users', total_count,
        'unconfirmed_users', unconfirmed_count,
        'confirmed_users', total_count - unconfirmed_count,
        'confirmation_rate', 
            CASE 
                WHEN total_count > 0 THEN 
                    ROUND((total_count - unconfirmed_count)::DECIMAL / total_count * 100, 2)
                ELSE 0
            END
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."count_unconfirmed_users"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."count_unconfirmed_users"() IS 'Conta usuários confirmados e não confirmados';



CREATE OR REPLACE FUNCTION "public"."debug_user_email_status"() RETURNS TABLE("user_id" "uuid", "email" "text", "email_confirmed_at" timestamp with time zone, "confirmed_at" timestamp with time zone, "confirmation_token" "text", "confirmation_sent_at" timestamp with time zone, "created_at" timestamp with time zone, "last_sign_in_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.confirmed_at,
    u.confirmation_token,
    u.confirmation_sent_at,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC
  LIMIT 10;
END;
$$;


ALTER FUNCTION "public"."debug_user_email_status"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."debug_user_email_status"() IS 'Função temporária para debug - remover após resolver problema de confirmação de email';



CREATE OR REPLACE FUNCTION "public"."get_missions_for_students"() RETURNS TABLE("id" "uuid", "course_id" "uuid", "title" "text", "description" "text", "difficulty" "text", "xp_value" integer, "parameters" "jsonb", "time_limit_seconds" integer, "badge_id" "uuid", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.course_id,
    m.title,
    m.description,
    m.difficulty,
    m.xp_value,
    m.parameters,
    m.time_limit_seconds,
    m.badge_id,
    m.created_at
  FROM missions m
  WHERE m.is_published = true;
END;
$$;


ALTER FUNCTION "public"."get_missions_for_students"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_name text;
  profile_exists boolean;
BEGIN
  -- Log de debug
  RAISE LOG 'handle_new_user: Iniciando para user_id %', NEW.id;
  
  -- Verificar se já existe um perfil para este user_id
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  ) INTO profile_exists;
  
  -- Se já existe um perfil, não fazer nada
  IF profile_exists THEN
    RAISE LOG 'handle_new_user: Perfil já existe para user_id %, pulando criação', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Determinar o nome do usuário
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'display_name',
    'Usuário Teste'
  );
  
  -- Usar INSERT ... ON CONFLICT para evitar duplicatas
  INSERT INTO public.profiles (
    user_id,
    email,
    name,
    display_name,
    role,
    xp,
    level
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_name,  -- display_name igual ao name
    'student',
    0,
    1
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RAISE LOG 'handle_new_user: Processamento concluído para user_id % com nome %', NEW.id, user_name;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Erro ao processar user_id %: %', NEW.id, SQLERRM;
    -- Não re-raise o erro para não impedir a criação do usuário
    -- O perfil pode ser criado posteriormente se necessário
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Função que cria perfil automaticamente quando um novo usuário é criado via auth.users';



CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_unconfirmed_users"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
BEGIN
    -- Corrigido: removido json_agg para evitar problema de GROUP BY
    WITH unconfirmed_users AS (
        SELECT 
            id,
            email,
            created_at,
            last_sign_in_at
        FROM auth.users
        WHERE email_confirmed_at IS NULL
        ORDER BY created_at DESC
    )
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', id,
                'email', email,
                'created_at', created_at,
                'last_sign_in_at', last_sign_in_at
            )
        ),
        '[]'::json
    ) INTO result
    FROM unconfirmed_users;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."list_unconfirmed_users"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."list_unconfirmed_users"() IS 'Lista todos os usuários com email não confirmado';



CREATE OR REPLACE FUNCTION "public"."set_speed_bonus_on_complete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_time_limit INT;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Buscar time_limit da missão
    SELECT time_limit_seconds INTO v_time_limit
    FROM missions
    WHERE id = NEW.mission_id;
    
    -- Calcular bônus
    NEW.speed_bonus := calculate_speed_bonus(
      NEW.start_time,
      COALESCE(NEW.end_time, NOW()),
      v_time_limit
    );
    
    -- Atualizar pontos com bônus
    NEW.points_awarded := (
      SELECT (xp_value * NEW.speed_bonus)::INT
      FROM missions
      WHERE id = NEW.mission_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_speed_bonus_on_complete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_missions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_missions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_seasonal_events_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_seasonal_events_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_streak"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_last_activity TIMESTAMPTZ;
    v_current_date TIMESTAMPTZ := NOW();
    v_yesterday TIMESTAMPTZ := NOW() - INTERVAL '1 day';
BEGIN
    -- Buscar última atividade
    SELECT last_activity_date INTO v_last_activity
    FROM profiles
    WHERE user_id = NEW.user_id;
    
    -- Se não há atividade registrada ou foi há mais de 1 dia, resetar streak
    IF v_last_activity IS NULL OR v_last_activity < v_yesterday THEN
        UPDATE profiles
        SET 
            current_daily_streak = 1,
            last_activity_date = v_current_date
        WHERE user_id = NEW.user_id;
    ELSE
        -- Incrementar streak se foi ontem
        UPDATE profiles
        SET 
            current_daily_streak = current_daily_streak + 1,
            longest_daily_streak = GREATEST(longest_daily_streak, current_daily_streak + 1),
            last_activity_date = v_current_date
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_streak"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_xp_and_level"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_new_total_xp INT;
  v_new_level INT;
BEGIN
  -- Calcular novo total_xp
  SELECT COALESCE(SUM(xp_amount), 0) INTO v_new_total_xp
  FROM xp_transactions
  WHERE user_id = NEW.user_id;
  
  -- Calcular novo level
  v_new_level := calculate_level(v_new_total_xp);
  
  -- Atualizar profiles
  UPDATE profiles
  SET 
    total_xp = v_new_total_xp,
    level = v_new_level
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_xp_and_level"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "criteria_jsonb" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


COMMENT ON TABLE "public"."badges" IS 'Definição dos emblemas conquistáveis no sistema';



COMMENT ON COLUMN "public"."badges"."criteria_jsonb" IS 'Critérios para desbloquear o emblema (JSON)';



CREATE TABLE IF NOT EXISTS "public"."certification_exams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "certification_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "question_count" integer NOT NULL,
    "duration_minutes" integer NOT NULL,
    "passing_score" integer NOT NULL,
    "difficulty_level" "text" NOT NULL,
    "topics" "text"[] DEFAULT '{}'::"text"[],
    "xp_reward" integer DEFAULT 100,
    "is_published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "certification_exams_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['entry'::"text", 'intermediate'::"text", 'advanced'::"text", 'expert'::"text"])))
);


ALTER TABLE "public"."certification_exams" OWNER TO "postgres";


COMMENT ON TABLE "public"."certification_exams" IS 'Exames simulados de certificação';



CREATE TABLE IF NOT EXISTS "public"."certification_providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text",
    "website" "text",
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."certification_providers" OWNER TO "postgres";


COMMENT ON TABLE "public"."certification_providers" IS 'Provedores de certificações (CompTIA, ISC², etc.)';



CREATE TABLE IF NOT EXISTS "public"."certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid",
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "difficulty_level" "text" NOT NULL,
    "duration_minutes" integer NOT NULL,
    "passing_score" integer NOT NULL,
    "question_count" integer NOT NULL,
    "cost_usd" integer NOT NULL,
    "validity_years" integer NOT NULL,
    "prerequisites" "text"[] DEFAULT '{}'::"text"[],
    "exam_topics" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "certifications_category_check" CHECK (("category" = ANY (ARRAY['security'::"text", 'cloud'::"text", 'network'::"text", 'forensics'::"text", 'governance'::"text"]))),
    CONSTRAINT "certifications_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['entry'::"text", 'intermediate'::"text", 'advanced'::"text", 'expert'::"text"])))
);


ALTER TABLE "public"."certifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."certifications" IS 'Certificações profissionais disponíveis';



CREATE TABLE IF NOT EXISTS "public"."cosmetics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "rarity" "text" NOT NULL,
    "unlock_requirements" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "cosmetic_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cosmetics_rarity_check" CHECK (("rarity" = ANY (ARRAY['common'::"text", 'rare'::"text", 'epic'::"text", 'legendary'::"text"]))),
    CONSTRAINT "cosmetics_type_check" CHECK (("type" = ANY (ARRAY['avatar_frame'::"text", 'theme'::"text", 'effects'::"text", 'card_borders'::"text", 'mission_icons'::"text", 'particle_effects'::"text"])))
);


ALTER TABLE "public"."cosmetics" OWNER TO "postgres";


COMMENT ON TABLE "public"."cosmetics" IS 'Cosméticos desbloqueáveis para personalização';



COMMENT ON COLUMN "public"."cosmetics"."unlock_requirements" IS 'Requisitos para desbloquear o cosmético';



COMMENT ON COLUMN "public"."cosmetics"."cosmetic_data" IS 'Dados visuais do cosmético (CSS, cores, efeitos)';



CREATE TABLE IF NOT EXISTS "public"."exam_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exam_id" "uuid",
    "user_id" "uuid",
    "score" integer NOT NULL,
    "passing_score" integer NOT NULL,
    "passed" boolean NOT NULL,
    "time_spent_minutes" integer NOT NULL,
    "questions_answered" integer NOT NULL,
    "correct_answers" integer NOT NULL,
    "incorrect_answers" integer NOT NULL,
    "topic_performance" "jsonb" DEFAULT '{}'::"jsonb",
    "recommended_study_areas" "text"[] DEFAULT '{}'::"text"[],
    "next_exam_recommendation" "uuid",
    "xp_earned" integer DEFAULT 0,
    "completed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."exam_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."exam_results" IS 'Resultados dos exames dos usuários';



CREATE TABLE IF NOT EXISTS "public"."institution_competitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "participating_institutions" "uuid"[] DEFAULT '{}'::"uuid"[],
    "rewards" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."institution_competitions" OWNER TO "postgres";


COMMENT ON TABLE "public"."institution_competitions" IS 'Competições entre instituições';



CREATE TABLE IF NOT EXISTS "public"."institution_rankings" (
    "institution_id" "uuid" NOT NULL,
    "ranking_position" integer NOT NULL,
    "total_xp" integer DEFAULT 0,
    "average_xp" integer DEFAULT 0,
    "active_students" integer DEFAULT 0,
    "missions_completed" integer DEFAULT 0,
    "badges_earned" integer DEFAULT 0,
    "performance_score" integer DEFAULT 0,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."institution_rankings" OWNER TO "postgres";


COMMENT ON TABLE "public"."institution_rankings" IS 'Rankings entre instituições';



CREATE TABLE IF NOT EXISTS "public"."institutions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "country" "text" NOT NULL,
    "state" "text",
    "city" "text" NOT NULL,
    "logo_url" "text",
    "website" "text",
    "total_students" integer DEFAULT 0,
    "active_students" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "institutions_type_check" CHECK (("type" = ANY (ARRAY['university'::"text", 'college'::"text", 'institute'::"text", 'school'::"text"])))
);


ALTER TABLE "public"."institutions" OWNER TO "postgres";


COMMENT ON TABLE "public"."institutions" IS 'Instituições educacionais participantes';



CREATE TABLE IF NOT EXISTS "public"."mission_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "mission_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'in_progress'::"text" NOT NULL,
    "points_awarded" integer DEFAULT 0,
    "start_time" timestamp with time zone DEFAULT "now"(),
    "end_time" timestamp with time zone,
    "dicas_used" integer DEFAULT 0,
    "flag_submitted" "text",
    "speed_bonus" numeric(3,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "mission_attempts_status_check" CHECK (("status" = ANY (ARRAY['in_progress'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."mission_attempts" OWNER TO "postgres";


COMMENT ON TABLE "public"."mission_attempts" IS 'Tentativas de missões pelos alunos';



COMMENT ON COLUMN "public"."mission_attempts"."speed_bonus" IS 'Bônus de velocidade (1.0 = sem bônus, 1.5 = +50%)';



CREATE TABLE IF NOT EXISTS "public"."missions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "xp_value" integer DEFAULT 100 NOT NULL,
    "flag_correct" "text" NOT NULL,
    "parameters" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "time_limit_seconds" integer DEFAULT 3600,
    "badge_id" "uuid",
    "is_published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid" NOT NULL,
    "difficulty" "text" DEFAULT 'Básico'::"text" NOT NULL,
    CONSTRAINT "missions_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['Básico'::"text", 'Intermediário'::"text", 'Avançado'::"text"])))
);


ALTER TABLE "public"."missions" OWNER TO "postgres";


COMMENT ON TABLE "public"."missions" IS 'Missões CTF criadas por administradores';



COMMENT ON COLUMN "public"."missions"."flag_correct" IS 'Flag correta (NUNCA expor no frontend)';



COMMENT ON COLUMN "public"."missions"."parameters" IS 'Configuração completa da missão (JSON)';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "name" "text",
    "role" "text" DEFAULT 'student'::"text",
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "lives_remaining" integer DEFAULT 5,
    "total_xp" integer DEFAULT 0,
    "level" integer DEFAULT 1,
    "longest_daily_streak" integer DEFAULT 0,
    "longest_mission_streak" integer DEFAULT 0,
    "current_daily_streak" integer DEFAULT 0,
    "current_mission_streak" integer DEFAULT 0,
    "last_activity_date" timestamp with time zone,
    "institution_id" "uuid",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['student'::"text", 'instructor'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."lives_remaining" IS 'Vidas restantes (plano Free: 5, Pro: ilimitado)';



COMMENT ON COLUMN "public"."profiles"."total_xp" IS 'XP total acumulado pelo usuário';



COMMENT ON COLUMN "public"."profiles"."level" IS 'Nível atual do usuário (calculado a partir do XP)';



COMMENT ON COLUMN "public"."profiles"."longest_daily_streak" IS 'Maior streak diário já alcançado';



COMMENT ON COLUMN "public"."profiles"."longest_mission_streak" IS 'Maior streak de missões já alcançado';



COMMENT ON COLUMN "public"."profiles"."current_daily_streak" IS 'Streak diário atual';



COMMENT ON COLUMN "public"."profiles"."current_mission_streak" IS 'Streak de missões atual';



COMMENT ON COLUMN "public"."profiles"."last_activity_date" IS 'Última data de atividade registrada';



COMMENT ON COLUMN "public"."profiles"."institution_id" IS 'Instituição do usuário';



CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "user_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_badges" IS 'Emblemas conquistados pelos usuários';



CREATE OR REPLACE VIEW "public"."ranking_global" AS
 SELECT "p"."user_id",
    "p"."display_name",
    "p"."avatar_url",
    "p"."total_xp",
    "p"."level",
    "count"(DISTINCT "ma"."mission_id") FILTER (WHERE ("ma"."status" = 'completed'::"text")) AS "missions_completed",
    "count"(DISTINCT "ub"."badge_id") AS "badges_earned",
    "rank"() OVER (ORDER BY "p"."total_xp" DESC) AS "ranking_position"
   FROM (("public"."profiles" "p"
     LEFT JOIN "public"."mission_attempts" "ma" ON (("ma"."user_id" = "p"."user_id")))
     LEFT JOIN "public"."user_badges" "ub" ON (("ub"."user_id" = "p"."user_id")))
  WHERE ("p"."role" = 'student'::"text")
  GROUP BY "p"."user_id", "p"."display_name", "p"."avatar_url", "p"."total_xp", "p"."level"
  ORDER BY "p"."total_xp" DESC;


ALTER VIEW "public"."ranking_global" OWNER TO "postgres";


COMMENT ON VIEW "public"."ranking_global" IS 'Ranking global de todos os alunos por XP';



CREATE TABLE IF NOT EXISTS "public"."seasonal_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."seasonal_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."seasonal_events" IS 'Eventos sazonais com badges especiais';



CREATE TABLE IF NOT EXISTS "public"."user_cosmetics" (
    "user_id" "uuid" NOT NULL,
    "cosmetic_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"(),
    "is_applied" boolean DEFAULT false
);


ALTER TABLE "public"."user_cosmetics" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_cosmetics" IS 'Cosméticos desbloqueados pelos usuários';



CREATE TABLE IF NOT EXISTS "public"."xp_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "xp_amount" integer NOT NULL,
    "transaction_type" "text" NOT NULL,
    "related_id" "uuid",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "xp_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['mission_complete'::"text", 'simulado_high_score'::"text", 'penalty'::"text", 'badge_bonus'::"text", 'daily_login'::"text"])))
);


ALTER TABLE "public"."xp_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."xp_transactions" IS 'Histórico de todas as transações de XP';



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certification_exams"
    ADD CONSTRAINT "certification_exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certification_providers"
    ADD CONSTRAINT "certification_providers_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."certification_providers"
    ADD CONSTRAINT "certification_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cosmetics"
    ADD CONSTRAINT "cosmetics_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."cosmetics"
    ADD CONSTRAINT "cosmetics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_results"
    ADD CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."institution_competitions"
    ADD CONSTRAINT "institution_competitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."institution_rankings"
    ADD CONSTRAINT "institution_rankings_pkey" PRIMARY KEY ("institution_id");



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "institutions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "institutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission_attempts"
    ADD CONSTRAINT "mission_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."missions"
    ADD CONSTRAINT "missions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."seasonal_events"
    ADD CONSTRAINT "seasonal_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("user_id", "badge_id");



ALTER TABLE ONLY "public"."user_cosmetics"
    ADD CONSTRAINT "user_cosmetics_pkey" PRIMARY KEY ("user_id", "cosmetic_id");



ALTER TABLE ONLY "public"."xp_transactions"
    ADD CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_certification_exams_certification" ON "public"."certification_exams" USING "btree" ("certification_id");



CREATE INDEX "idx_certification_exams_published" ON "public"."certification_exams" USING "btree" ("is_published");



CREATE INDEX "idx_certifications_category" ON "public"."certifications" USING "btree" ("category");



CREATE INDEX "idx_certifications_difficulty" ON "public"."certifications" USING "btree" ("difficulty_level");



CREATE INDEX "idx_certifications_provider" ON "public"."certifications" USING "btree" ("provider_id");



CREATE INDEX "idx_cosmetics_active" ON "public"."cosmetics" USING "btree" ("is_active");



CREATE INDEX "idx_cosmetics_rarity" ON "public"."cosmetics" USING "btree" ("rarity");



CREATE INDEX "idx_cosmetics_type" ON "public"."cosmetics" USING "btree" ("type");



CREATE INDEX "idx_exam_results_completed" ON "public"."exam_results" USING "btree" ("completed_at");



CREATE INDEX "idx_exam_results_exam" ON "public"."exam_results" USING "btree" ("exam_id");



CREATE INDEX "idx_exam_results_user" ON "public"."exam_results" USING "btree" ("user_id");



CREATE INDEX "idx_institution_competitions_active" ON "public"."institution_competitions" USING "btree" ("is_active");



CREATE INDEX "idx_institution_competitions_dates" ON "public"."institution_competitions" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_institution_rankings_position" ON "public"."institution_rankings" USING "btree" ("ranking_position");



CREATE INDEX "idx_institution_rankings_score" ON "public"."institution_rankings" USING "btree" ("performance_score");



CREATE INDEX "idx_institutions_country" ON "public"."institutions" USING "btree" ("country");



CREATE INDEX "idx_institutions_type" ON "public"."institutions" USING "btree" ("type");



CREATE INDEX "idx_mission_attempts_mission" ON "public"."mission_attempts" USING "btree" ("mission_id");



CREATE INDEX "idx_mission_attempts_status" ON "public"."mission_attempts" USING "btree" ("status");



CREATE INDEX "idx_mission_attempts_user" ON "public"."mission_attempts" USING "btree" ("user_id");



CREATE INDEX "idx_missions_course" ON "public"."missions" USING "btree" ("course_id");



CREATE INDEX "idx_missions_difficulty" ON "public"."missions" USING "btree" ("difficulty");



CREATE INDEX "idx_missions_published" ON "public"."missions" USING "btree" ("is_published");



CREATE INDEX "idx_profiles_institution" ON "public"."profiles" USING "btree" ("institution_id");



CREATE INDEX "idx_seasonal_events_active" ON "public"."seasonal_events" USING "btree" ("is_active");



CREATE INDEX "idx_seasonal_events_dates" ON "public"."seasonal_events" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_user_badges_user" ON "public"."user_badges" USING "btree" ("user_id");



CREATE INDEX "idx_user_cosmetics_applied" ON "public"."user_cosmetics" USING "btree" ("is_applied");



CREATE INDEX "idx_user_cosmetics_user" ON "public"."user_cosmetics" USING "btree" ("user_id");



CREATE INDEX "idx_xp_transactions_type" ON "public"."xp_transactions" USING "btree" ("transaction_type");



CREATE INDEX "idx_xp_transactions_user" ON "public"."xp_transactions" USING "btree" ("user_id");



CREATE INDEX "profiles_role_idx" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "profiles_user_id_idx" ON "public"."profiles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "calculate_speed_bonus_trigger" BEFORE UPDATE ON "public"."mission_attempts" FOR EACH ROW EXECUTE FUNCTION "public"."set_speed_bonus_on_complete"();



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_certification_exams_updated_at" BEFORE UPDATE ON "public"."certification_exams" FOR EACH ROW EXECUTE FUNCTION "public"."update_seasonal_events_updated_at"();



CREATE OR REPLACE TRIGGER "update_certification_providers_updated_at" BEFORE UPDATE ON "public"."certification_providers" FOR EACH ROW EXECUTE FUNCTION "public"."update_seasonal_events_updated_at"();



CREATE OR REPLACE TRIGGER "update_certifications_updated_at" BEFORE UPDATE ON "public"."certifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_seasonal_events_updated_at"();



CREATE OR REPLACE TRIGGER "update_cosmetics_updated_at" BEFORE UPDATE ON "public"."cosmetics" FOR EACH ROW EXECUTE FUNCTION "public"."update_seasonal_events_updated_at"();



CREATE OR REPLACE TRIGGER "update_institution_competitions_updated_at" BEFORE UPDATE ON "public"."institution_competitions" FOR EACH ROW EXECUTE FUNCTION "public"."update_seasonal_events_updated_at"();



CREATE OR REPLACE TRIGGER "update_institutions_updated_at" BEFORE UPDATE ON "public"."institutions" FOR EACH ROW EXECUTE FUNCTION "public"."update_seasonal_events_updated_at"();



CREATE OR REPLACE TRIGGER "update_missions_updated_at" BEFORE UPDATE ON "public"."missions" FOR EACH ROW EXECUTE FUNCTION "public"."update_missions_updated_at"();



CREATE OR REPLACE TRIGGER "update_seasonal_events_updated_at" BEFORE UPDATE ON "public"."seasonal_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_seasonal_events_updated_at"();



CREATE OR REPLACE TRIGGER "update_streak_on_mission_complete" AFTER UPDATE ON "public"."mission_attempts" FOR EACH ROW WHEN ((("new"."status" = 'completed'::"text") AND ("old"."status" <> 'completed'::"text"))) EXECUTE FUNCTION "public"."update_user_streak"();



CREATE OR REPLACE TRIGGER "update_streak_on_xp_transaction" AFTER INSERT ON "public"."xp_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_streak"();



CREATE OR REPLACE TRIGGER "update_xp_on_transaction" AFTER INSERT ON "public"."xp_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_xp_and_level"();



ALTER TABLE ONLY "public"."certification_exams"
    ADD CONSTRAINT "certification_exams_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "public"."certifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."certification_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_results"
    ADD CONSTRAINT "exam_results_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."certification_exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_results"
    ADD CONSTRAINT "exam_results_next_exam_recommendation_fkey" FOREIGN KEY ("next_exam_recommendation") REFERENCES "public"."certification_exams"("id");



ALTER TABLE ONLY "public"."exam_results"
    ADD CONSTRAINT "exam_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."institution_rankings"
    ADD CONSTRAINT "institution_rankings_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission_attempts"
    ADD CONSTRAINT "mission_attempts_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission_attempts"
    ADD CONSTRAINT "mission_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."missions"
    ADD CONSTRAINT "missions_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."missions"
    ADD CONSTRAINT "missions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cosmetics"
    ADD CONSTRAINT "user_cosmetics_cosmetic_id_fkey" FOREIGN KEY ("cosmetic_id") REFERENCES "public"."cosmetics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cosmetics"
    ADD CONSTRAINT "user_cosmetics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."xp_transactions"
    ADD CONSTRAINT "xp_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



CREATE POLICY "Allow system insert for new profiles" ON "public"."profiles" FOR INSERT WITH CHECK (true);



COMMENT ON POLICY "Allow system insert for new profiles" ON "public"."profiles" IS 'Permite que o sistema crie perfis automaticamente durante o signup';



CREATE POLICY "Enable profile creation" ON "public"."profiles" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") OR ("auth"."role"() = 'service_role'::"text")));



COMMENT ON POLICY "Enable profile creation" ON "public"."profiles" IS 'Permite criação de perfis para usuários autenticados e funções do sistema';



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "badges_admin_insert" ON "public"."badges" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "badges_admin_update" ON "public"."badges" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "badges_select_all" ON "public"."badges" FOR SELECT USING (true);



ALTER TABLE "public"."certification_exams" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "certification_exams_admin_all" ON "public"."certification_exams" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "certification_exams_select_published" ON "public"."certification_exams" FOR SELECT USING (("is_published" = true));



ALTER TABLE "public"."certification_providers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "certification_providers_admin_all" ON "public"."certification_providers" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "certification_providers_select_active" ON "public"."certification_providers" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."certifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "certifications_admin_all" ON "public"."certifications" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "certifications_select_active" ON "public"."certifications" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."cosmetics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cosmetics_admin_all" ON "public"."cosmetics" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "cosmetics_select_active" ON "public"."cosmetics" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."exam_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exam_results_own" ON "public"."exam_results" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "exam_results_system_insert" ON "public"."exam_results" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."institution_competitions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "institution_competitions_admin_all" ON "public"."institution_competitions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "institution_competitions_select_active" ON "public"."institution_competitions" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."institution_rankings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "institution_rankings_select_all" ON "public"."institution_rankings" FOR SELECT USING (true);



ALTER TABLE "public"."institutions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "institutions_admin_all" ON "public"."institutions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "institutions_select_all" ON "public"."institutions" FOR SELECT USING (true);



ALTER TABLE "public"."mission_attempts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "mission_attempts_admin" ON "public"."mission_attempts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "mission_attempts_own" ON "public"."mission_attempts" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."missions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "missions_admin_all" ON "public"."missions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "missions_student_published" ON "public"."missions" FOR SELECT USING (("is_published" = true));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seasonal_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "seasonal_events_admin_all" ON "public"."seasonal_events" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'instructor'::"text"]))))));



CREATE POLICY "seasonal_events_select_active" ON "public"."seasonal_events" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_badges_own" ON "public"."user_badges" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "user_badges_system_insert" ON "public"."user_badges" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."user_cosmetics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_cosmetics_own" ON "public"."user_cosmetics" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "user_cosmetics_system_insert" ON "public"."user_cosmetics" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."xp_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "xp_transactions_own" ON "public"."xp_transactions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "xp_transactions_system_insert" ON "public"."xp_transactions" FOR INSERT WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."calculate_level"("p_total_xp" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_level"("p_total_xp" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_level"("p_total_xp" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_speed_bonus"("p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_time_limit_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_speed_bonus"("p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_time_limit_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_speed_bonus"("p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_time_limit_seconds" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_and_award_badges"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_award_badges"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_award_badges"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_duplicate_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_duplicate_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_duplicate_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_confirmation_status"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_confirmation_status"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_confirmation_status"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."confirm_all_users_dev_only"() TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_all_users_dev_only"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_all_users_dev_only"() TO "service_role";



GRANT ALL ON FUNCTION "public"."confirm_user_email"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_user_email"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_user_email"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."count_unconfirmed_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."count_unconfirmed_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_unconfirmed_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_user_email_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_user_email_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_user_email_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_missions_for_students"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_missions_for_students"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_missions_for_students"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."list_unconfirmed_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."list_unconfirmed_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_unconfirmed_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_speed_bonus_on_complete"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_speed_bonus_on_complete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_speed_bonus_on_complete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_missions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_missions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_missions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_seasonal_events_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_seasonal_events_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_seasonal_events_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_streak"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_streak"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_streak"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_xp_and_level"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_xp_and_level"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_xp_and_level"() TO "service_role";


















GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON TABLE "public"."certification_exams" TO "anon";
GRANT ALL ON TABLE "public"."certification_exams" TO "authenticated";
GRANT ALL ON TABLE "public"."certification_exams" TO "service_role";



GRANT ALL ON TABLE "public"."certification_providers" TO "anon";
GRANT ALL ON TABLE "public"."certification_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."certification_providers" TO "service_role";



GRANT ALL ON TABLE "public"."certifications" TO "anon";
GRANT ALL ON TABLE "public"."certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."certifications" TO "service_role";



GRANT ALL ON TABLE "public"."cosmetics" TO "anon";
GRANT ALL ON TABLE "public"."cosmetics" TO "authenticated";
GRANT ALL ON TABLE "public"."cosmetics" TO "service_role";



GRANT ALL ON TABLE "public"."exam_results" TO "anon";
GRANT ALL ON TABLE "public"."exam_results" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_results" TO "service_role";



GRANT ALL ON TABLE "public"."institution_competitions" TO "anon";
GRANT ALL ON TABLE "public"."institution_competitions" TO "authenticated";
GRANT ALL ON TABLE "public"."institution_competitions" TO "service_role";



GRANT ALL ON TABLE "public"."institution_rankings" TO "anon";
GRANT ALL ON TABLE "public"."institution_rankings" TO "authenticated";
GRANT ALL ON TABLE "public"."institution_rankings" TO "service_role";



GRANT ALL ON TABLE "public"."institutions" TO "anon";
GRANT ALL ON TABLE "public"."institutions" TO "authenticated";
GRANT ALL ON TABLE "public"."institutions" TO "service_role";



GRANT ALL ON TABLE "public"."mission_attempts" TO "anon";
GRANT ALL ON TABLE "public"."mission_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."mission_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."missions" TO "anon";
GRANT ALL ON TABLE "public"."missions" TO "authenticated";
GRANT ALL ON TABLE "public"."missions" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."ranking_global" TO "anon";
GRANT ALL ON TABLE "public"."ranking_global" TO "authenticated";
GRANT ALL ON TABLE "public"."ranking_global" TO "service_role";



GRANT ALL ON TABLE "public"."seasonal_events" TO "anon";
GRANT ALL ON TABLE "public"."seasonal_events" TO "authenticated";
GRANT ALL ON TABLE "public"."seasonal_events" TO "service_role";



GRANT ALL ON TABLE "public"."user_cosmetics" TO "anon";
GRANT ALL ON TABLE "public"."user_cosmetics" TO "authenticated";
GRANT ALL ON TABLE "public"."user_cosmetics" TO "service_role";



GRANT ALL ON TABLE "public"."xp_transactions" TO "anon";
GRANT ALL ON TABLE "public"."xp_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."xp_transactions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
