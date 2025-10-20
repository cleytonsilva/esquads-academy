SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict XxIiThzzf2fdn4DdxrLWOmPCaZxDXtJm3LfhN986hNDyrfeyyIdvUBSSFrCatPw

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '1d01da05-cd96-4472-b7e0-1dbca954991e', 'authenticated', 'authenticated', 'admin@test.com', '$2a$06$BaFwjgnYwEnpHTpxr7H...3TTeEtS/7Uy3H7hrkpfA8d16IF9NUQC', '2025-10-04 01:26:48.389144+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-04 01:26:48.389144+00', '{"provider": "email", "providers": ["email"]}', '{"name": "Admin Test", "display_name": "Admin Test"}', NULL, '2025-10-04 01:26:48.389144+00', '2025-10-04 01:26:48.389144+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cab1c045-88f2-48c8-ad5d-e639badc0c72', 'authenticated', 'authenticated', 'student@test.com', '$2a$06$3pThjj5YuPId/8Kpx.BR5.2tm3QVWNa0700U5fanPmZFgK8TUwkmK', '2025-10-04 01:26:48.389144+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-04 01:26:48.389144+00', '{"provider": "email", "providers": ["email"]}', '{"name": "Student Test", "display_name": "Student Test"}', NULL, '2025-10-04 01:26:48.389144+00', '2025-10-04 01:26:48.389144+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."badges" ("id", "name", "description", "image_url", "created_at", "criteria_jsonb") VALUES
	('0fbba638-8d71-4be4-84ff-e805ef6766ea', 'Iniciante CTF', 'Complete 5 missões nível Básico', '/badges/iniciante-ctf.png', '2025-10-04 01:26:47.542474+00', '{"type": "mission_count", "value": 5, "difficulty": "Básico"}'),
	('d8276d3e-8392-4a4d-8f0b-470cf428357a', 'Perfeição', 'Complete uma missão sem usar dicas', '/badges/perfeicao.png', '2025-10-04 01:26:47.542474+00', '{"type": "no_hints", "value": true}'),
	('d4c98e22-c77c-4492-8090-5478f436fb96', 'Mestre Hacker', 'Complete 20 missões nível Avançado', '/badges/mestre-hacker.png', '2025-10-04 01:26:47.542474+00', '{"type": "mission_count", "value": 20, "difficulty": "Avançado"}'),
	('86f136bf-6bd4-4b30-b4b0-a9185586361e', 'Velocista', 'Complete uma missão em menos de 25% do tempo', '/badges/velocista.png', '2025-10-04 01:26:47.542474+00', '{"type": "speed_bonus", "threshold": 0.25}'),
	('3f44cc7c-6a8e-4567-8af9-dcd58955ee25', 'Primeiro Passo', 'Complete sua primeira missão', '/badges/primeiro-passo.png', '2025-10-04 01:26:47.542474+00', '{"type": "mission_count", "value": 1}'),
	('aa2bac5e-7329-4cf1-9bb2-de41a6a34d23', 'Caçador de Bugs', 'Complete 10 missões nível Intermediário', '/badges/cacador-bugs.png', '2025-10-04 01:26:47.542474+00', '{"type": "mission_count", "value": 10, "difficulty": "Intermediário"}');


--
-- Data for Name: certification_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: certification_exams; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: cosmetics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: institutions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("user_id", "display_name", "name", "role", "avatar_url", "bio", "created_at", "updated_at", "lives_remaining", "total_xp", "level", "longest_daily_streak", "longest_mission_streak", "current_daily_streak", "current_mission_streak", "last_activity_date", "institution_id") VALUES
	('1d01da05-cd96-4472-b7e0-1dbca954991e', 'Admin Test', 'Admin Test', 'admin', NULL, 'Usuário de teste para desenvolvimento', '2025-10-04 01:26:48.389144+00', '2025-10-04 01:26:48.389144+00', 5, 0, 1, 0, 0, 0, 0, NULL, NULL),
	('cab1c045-88f2-48c8-ad5d-e639badc0c72', 'Student Test', 'Student Test', 'student', NULL, 'Estudante de teste para desenvolvimento', '2025-10-04 01:26:48.389144+00', '2025-10-04 01:26:48.389144+00', 5, 0, 1, 0, 0, 0, 0, NULL, NULL);


--
-- Data for Name: exam_results; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: institution_competitions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: institution_rankings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: missions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: mission_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: seasonal_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_badges; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_cosmetics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: xp_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict XxIiThzzf2fdn4DdxrLWOmPCaZxDXtJm3LfhN986hNDyrfeyyIdvUBSSFrCatPw

RESET ALL;
