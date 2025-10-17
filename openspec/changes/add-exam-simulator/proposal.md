## Why
Aumentar retenção e validar aprendizado com simulador de exames temporizados, banco de questões e revisão controlada, alinhado ao PRD.

## What Changes
- Nova capacidade `exams` com tentativas temporizadas, pontuação e revisão configurável.
- Admin: gestão de exames e banco de questões (tags/dificuldade).
- Student: iniciar/retomar/encerrar tentativas com autosave e contador.
- Edge/API: iniciar/encerrar tentativa, correção e score, relatórios por tentativa.
- DB: tabelas `exams`, `exam_attempts`, `questions`, `exam_questions`, `attempt_answers` com RLS.

## Impact
- Affected specs: `exams` (nova), `analytics` (eventos), `gamification` (pontos opcionais)
- Affected code: `src/pages/admin/Exams.tsx`, `src/pages/student/Exams.tsx`, `src/services/examsService.ts`, Edge Function `exams`
