import { supabase } from '@/integrations/supabase/client';

export type Exam = {
  id: string;
  title: string;
  duration_minutes: number;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
};

export type ExamAttempt = {
  id: string;
  exam_id: string;
  user_id: string;
  started_at: string;
  ends_at: string;
  submitted_at?: string | null;
  score?: number | null;
  status: 'active' | 'submitted' | 'expired';
};

export async function listExams(): Promise<Exam[]> {
  // Placeholder: ajustar para fetch via Supabase table `exams`
  const { data, error } = await supabase.from('exams').select('*').limit(50);
  if (error) throw error;
  return (data as unknown as Exam[]) || [];
}

export async function startExamAttempt(examId: string): Promise<ExamAttempt> {
  // Placeholder: preferível via Edge Function `exams` (POST /exams/start)
  const { data, error } = await supabase.functions.invoke('exams', {
    body: { action: 'start', examId },
  });
  if (error) throw error;
  return data as ExamAttempt;
}

export async function submitExamAttempt(attemptId: string, answers: Record<string, unknown>): Promise<ExamAttempt> {
  // Placeholder: preferível via Edge Function `exams` (POST /exams/submit)
  const { data, error } = await supabase.functions.invoke('exams', {
    body: { action: 'submit', attemptId, answers },
  });
  if (error) throw error;
  return data as ExamAttempt;
}

export async function getExamAttempt(attemptId: string): Promise<ExamAttempt> {
  const { data, error } = await supabase.functions.invoke('exams', {
    body: { action: 'getAttempt', attemptId },
  });
  if (error) throw error;
  return data as ExamAttempt;
}

