BEGIN;

INSERT INTO public.achievements (key, name, description, points, icon_url)
VALUES
  ('first_course', 'Primeiro Curso', 'Complete seu primeiro curso', 200, NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.achievements (key, name, description, points, icon_url)
VALUES
  ('ten_lessons', 'Maratona de Lições', 'Complete 10 lições', 150, NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.achievements (key, name, description, points, icon_url)
VALUES
  ('first_terminal_mission', 'Operador de Terminal', 'Conclua sua primeira missão em terminal', 200, NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.achievements (key, name, description, points, icon_url)
VALUES
  ('final_exam_passed', 'Aprovado no Exame', 'Aproveitamento suficiente na prova final', 300, NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.achievements (key, name, description, points, icon_url)
VALUES
  ('security_track_completed', 'Trilha de Segurança Concluída', 'Conclua uma trilha profissional de cibersegurança', 500, NULL)
ON CONFLICT (key) DO NOTHING;

COMMIT;

