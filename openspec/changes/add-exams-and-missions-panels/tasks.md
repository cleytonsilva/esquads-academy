## 1. Backend
- [x] Add `api/routes/exams.ts` with list/get/start/submit/my attempts
- [x] Register `/api/exams` in `api/app.ts`
 - [x] Remover quaisquer rotas HTTP do Vibe Check (usar apenas MCP no Codex)
- [x] Create `exam_question_bank` table (migration) and CRUD endpoints under `/api/exams/questions`

## 2. Frontend Student
- [x] Implement missions panel in `src/pages/student/Missions.tsx`
- [x] Implement exams simulator in `src/pages/student/Exams.tsx`

## 3. Frontend Admin
- [x] Implement exam generation UI in `src/pages/admin/Exams.tsx`
- [x] Implement question bank UI (list, filters, create, delete) in `src/pages/admin/Exams.tsx`

## 4. Validation
- [x] Run `openspec validate add-exams-and-missions-panels --strict`
- [x] Smoke test: list exams, start attempt, submit, list attempts
- [x] API smoke: missions list and complete
- [ ] Missions panel shows Available/Active/Completed with progress

## 5. Quizzes MC-only
- [x] Enforce multiple-choice only in `ai_generate_final_exam`
- [x] Enforce multiple-choice only in `ai_generate_module_quiz`
