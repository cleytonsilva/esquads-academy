## 1. Esquema de Dados (Supabase)
- [ ] 1.1 Criar `exams` (id, title, duration_minutes, tags[], difficulty, settings jsonb)
- [ ] 1.2 Criar `questions` (id, prompt, type, options jsonb, answer_key jsonb, tags[], difficulty)
- [ ] 1.3 Relacionar `exam_questions` (exam_id, question_id, order)
- [ ] 1.4 Criar `exam_attempts` (id, user_id, exam_id, started_at, ends_at, submitted_at, score, status)
- [ ] 1.5 Criar `attempt_answers` (attempt_id, question_id, answer jsonb, correct bool)
- [ ] 1.6 RLS estrita: owner-only em attempts/answers; leitura controlada de questions via contexto de exame

## 2. Edge/API
- [ ] 2.1 `POST /exams/start` (iniciar tentativa; calcular `ends_at`)
- [ ] 2.2 `POST /exams/submit` (submeter, corrigir, gravar `score`)
- [ ] 2.3 `GET /exams/attempt/:id` (consultar status, tempo restante)
- [ ] 2.4 Rate limits básicos por user/ip

## 3. Frontend Admin
- [ ] 3.1 Página `AdminExams` (CRUD exames)
- [ ] 3.2 CRUD `questions` com tags/dificuldade
- [ ] 3.3 Montagem de exame (seleção por filtros e ordenação)

## 4. Frontend Student
- [ ] 4.1 Página `StudentExams` (listar, iniciar/retomar)
- [ ] 4.2 Tela de tentativa (timer, autosave, navegação)
- [ ] 4.3 Tela de revisão (configurável)

## 5. Integrações
- [ ] 5.1 Analytics: `exams.started`, `exams.submitted`, `exams.reviewed`
- [ ] 5.2 Gamification: pontos por aprovação (opcional/config)

## 6. Testes
- [ ] 6.1 Unit: serviços/correção
- [ ] 6.2 Integração: fluxo iniciar→responder→submeter→revisar
