import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertCircle,
  BarChart3,
  FileText,
  Layers,
  Plus,
  RefreshCw,
  Shield,
  Target,
  Trash2
} from 'lucide-react';
import { CERTIFICATION_DIFFICULTY } from '@/utils/constants';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

type Course = { id: string; title: string };
type Exam = {
  id: string;
  title: string;
  course_id: string;
  description?: string;
  time_limit?: number;
  max_attempts?: number;
  questions?: any[];
  total_questions?: number;
  metadata?: {
    provider?: string;
    certification?: string;
    difficulty?: string;
  };
};

type Question = {
  id: string;
  question_text: string;
  options?: string[];
  answer?: string;
  tags?: string[];
  difficulty?: string;
  status?: string;
  review_status?: string;
};

type QuestionFilter = {
  q?: string;
  tag?: string;
  difficulty?: string;
};

const difficultyLabels: Record<string, string> = {
  [CERTIFICATION_DIFFICULTY.PRACTITIONER]: 'Fundamental',
  [CERTIFICATION_DIFFICULTY.ASSOCIATE]: 'Associate',
  [CERTIFICATION_DIFFICULTY.PROFESSIONAL]: 'Professional',
  [CERTIFICATION_DIFFICULTY.EXPERT]: 'Expert'
};

const guessProvider = (title: string): string => {
  const normalized = title.toLowerCase();
  if (normalized.includes('aws')) return 'AWS';
  if (normalized.includes('azure')) return 'Azure';
  if (normalized.includes('oracle')) return 'Oracle';
  if (normalized.includes('google') || normalized.includes('gcp')) return 'Google Cloud';
  if (normalized.includes('comptia') || normalized.includes('security+')) return 'CompTIA';
  if (normalized.includes('ibm')) return 'IBM';
  return 'Especializada';
};

const normalizeDifficulty = (value?: string): string => {
  if (!value) return CERTIFICATION_DIFFICULTY.ASSOCIATE;
  const normalized = value.toLowerCase();

  if (normalized.includes('expert') || normalized.includes('senior')) {
    return CERTIFICATION_DIFFICULTY.EXPERT;
  }
  if (normalized.includes('professional') || normalized.includes('advanced')) {
    return CERTIFICATION_DIFFICULTY.PROFESSIONAL;
  }
  if (normalized.includes('associate') || normalized.includes('intermediate')) {
    return CERTIFICATION_DIFFICULTY.ASSOCIATE;
  }
  return CERTIFICATION_DIFFICULTY.PRACTITIONER;
};

const difficultyBadgeClass = (difficulty: string) => {
  switch (difficulty) {
    case CERTIFICATION_DIFFICULTY.EXPERT:
    case CERTIFICATION_DIFFICULTY.PROFESSIONAL:
      return 'border-purple-200 bg-purple-50 text-purple-700';
    case CERTIFICATION_DIFFICULTY.ASSOCIATE:
      return 'border-blue-200 bg-blue-50 text-blue-700';
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
};

export default function AdminExams() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [courseId, setCourseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [qFilter, setQFilter] = useState<QuestionFilter>({});
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set());
  const [formQ, setFormQ] = useState({
    question_text: '',
    optionsText: '',
    answer: '',
    tagsText: '',
    difficulty: 'medium'
  });
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    time_limit: 30,
    passing_score: 70,
    max_attempts: 3
  });

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      const coursesResponse = await fetch(`${apiUrl}/api/courses`);
      const coursesJson = await coursesResponse.json();
      if (coursesResponse.ok) {
        setCourses(
          coursesJson.courses?.map((course: any) => ({ id: course.id, title: course.title })) ?? []
        );
      }

      const examsResponse = await fetch(`${apiUrl}/api/exams`);
      const examsJson = await examsResponse.json();
      if (examsResponse.ok) {
        setExams(examsJson.exams ?? []);
      }

      await loadQuestions();
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    const params = new URLSearchParams();
    if (qFilter.q) params.set('q', qFilter.q);
    if (qFilter.tag) params.set('tag', qFilter.tag);
    if (qFilter.difficulty) params.set('difficulty', qFilter.difficulty);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/exams/questions?${params.toString()}`);
    const json = await response.json();
    if (response.ok) {
      setQuestions(json.questions ?? []);
    }
  };

  const generateForCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/courses/${courseId}/exams/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({})
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Falha ao gerar exame');
      }

      setSuccess('Exame gerado com sucesso!');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Erro ao gerar exame');
    } finally {
      setLoading(false);
    }
  };

  const examStats = useMemo(() => {
    const total = exams.length;
    const uniqueCourses = new Set(exams.map((exam) => exam.course_id)).size;
    const questionCount = exams.reduce(
      (sum, exam) => sum + (exam.total_questions || exam.questions?.length || 0),
      0
    );
    const limitedAttempts = exams.filter((exam) => (exam.max_attempts ?? 0) > 0).length;

    return { total, uniqueCourses, questionCount, limitedAttempts };
  }, [exams]);

  const providerStats = useMemo(() => {
    const stats = new Map<string, { exams: number; questions: number }>();

    exams.forEach((exam) => {
      const provider = exam.metadata?.provider || guessProvider(exam.title);
      const current = stats.get(provider) ?? { exams: 0, questions: 0 };
      current.exams += 1;
      current.questions += exam.total_questions || exam.questions?.length || 0;
      stats.set(provider, current);
    });

    return Array.from(stats.entries())
      .map(([provider, data]) => ({ provider, ...data }))
      .sort((a, b) => b.exams - a.exams);
  }, [exams]);

  const questionStats = useMemo(() => {
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    const tagCounts = new Map<string, number>();
    let pending = 0;
    let approved = 0;

    questions.forEach((question) => {
      const difficulty = String(question.difficulty || '').toLowerCase();
      if (difficulty.includes('hard') || difficulty.includes('advanced') || difficulty.includes('professional')) {
        difficultyCounts.hard += 1;
      } else if (difficulty.includes('easy') || difficulty.includes('beginner') || difficulty.includes('fundamental')) {
        difficultyCounts.easy += 1;
      } else {
        difficultyCounts.medium += 1;
      }

      const reviewStatus = String(question.status || question.review_status || '').toLowerCase();
      if (reviewStatus.includes('pending') || reviewStatus.includes('review')) {
        pending += 1;
      } else {
        approved += 1;
      }

      const tags = Array.isArray(question.tags)
        ? question.tags
        : typeof question.tags === 'string'
          ? question.tags.split(',')
          : [];

      tags.forEach((tag) => {
        const normalized = tag.trim();
        if (!normalized) return;
        tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1);
      });
    });

    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return {
      total: questions.length,
      difficultyCounts,
      pending,
      approved,
      topTags
    };
  }, [questions]);

  const totalProviderExams = providerStats.reduce((sum, stat) => sum + stat.exams, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="bg-white/20 text-white">
              Painel Administrativo
            </Badge>
            <h1 className="text-3xl font-bold">Central de Certificações</h1>
            <p className="max-w-3xl text-indigo-100">
              Organize os simulados oficiais, gerencie o banco de questões e acompanhe a qualidade das certificações gamificadas
              oferecidas para os estudantes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => void load()}
              disabled={loading}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Catálogo
            </Button>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div className="space-y-2">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Shield className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-indigo-100">
          <CardHeader className="flex items-start justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Shield className="h-4 w-4" /> Blueprints ativos
            </CardTitle>
            <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
              {examStats.total}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-semibold text-slate-900">{examStats.total} provas</div>
            <p className="text-xs text-slate-500">
              Cobrem {examStats.uniqueCourses} cursos • {examStats.questionCount} questões disponíveis
            </p>
            <p className="text-xs text-slate-500">
              {examStats.limitedAttempts} blueprints com tentativas limitadas
            </p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100">
          <CardHeader className="flex items-start justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <Layers className="h-4 w-4" /> Banco de questões
            </CardTitle>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              {questionStats.total}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-semibold text-slate-900">{questionStats.total} itens</div>
            <p className="text-xs text-slate-500">
              {questionStats.approved} aprovados • {questionStats.pending} aguardando revisão humana
            </p>
            <div className="flex flex-wrap gap-2">
              {questionStats.topTags.map((tag) => (
                <Badge key={tag.tag} variant="secondary" className="bg-emerald-50 text-emerald-700">
                  #{tag.tag}
                </Badge>
              ))}
              {questionStats.topTags.length === 0 && (
                <span className="text-xs text-slate-400">Sem tags categorizadas ainda</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-100">
          <CardHeader className="flex items-start justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600">
              <BarChart3 className="h-4 w-4" /> Provedores
            </CardTitle>
            <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
              {providerStats.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {providerStats.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum blueprint gerado até o momento.</p>
            ) : (
              providerStats.slice(0, 3).map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">{provider.provider}</span>
                  <span className="text-xs text-slate-500">
                    {provider.exams} provas • {provider.questions} questões
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="blueprints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 gap-2 rounded-xl bg-slate-100 p-1 md:grid-cols-3">
          <TabsTrigger value="blueprints" className="text-sm font-medium">
            Blueprints & Missões
          </TabsTrigger>
          <TabsTrigger value="bank" className="text-sm font-medium">
            Banco de Questões
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm font-medium">
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blueprints" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Blueprints por curso</CardTitle>
                <CardDescription>
                  Gere automaticamente simulados alinhados ao conteúdo oficial de cada trilha de aprendizado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[2fr,auto]">
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => void generateForCourse()} disabled={!courseId || loading} className="h-12">
                    <Target className="mr-2 h-4 w-4" /> Gerar blueprint
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  A geração utiliza IA assistida e marca o blueprint como "Pendente de Revisão" até validação do Arquiteto de Missão.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status de aprovação</CardTitle>
                <CardDescription>Controle rápido da revisão humana das missões e simulados gerados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Blueprints aguardando revisão</span>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                    {questionStats.pending}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Blueprints aprovados</span>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {questionStats.approved}
                  </Badge>
                </div>
                <Separator />
                <p className="text-xs text-slate-500">
                  Use o banco de questões para ajustar os itens antes de liberar a prova para os estudantes.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Catálogo de provas</CardTitle>
              <CardDescription>Visualize os simulados disponíveis para cada certificação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exams.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  <FileText className="h-4 w-4" /> Nenhum exame cadastrado no momento.
                </div>
              ) : (
                exams.map((exam) => {
                  const provider = exam.metadata?.provider || guessProvider(exam.title);
                  const difficulty = normalizeDifficulty(exam.metadata?.difficulty || exam.difficulty);
                  const questionCount = exam.total_questions || exam.questions?.length || 0;

                  return (
                    <div
                      key={exam.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{exam.title}</h3>
                          <p className="text-xs text-slate-500">Curso vinculado: {exam.course_id.slice(0, 8)}...</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                            {provider}
                          </Badge>
                          <Badge variant="outline" className={difficultyBadgeClass(difficulty)}>
                            {difficultyLabels[difficulty] ?? 'Associate'}
                          </Badge>
                          <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
                            {questionCount} questões
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Tempo limite: {exam.time_limit ? `${exam.time_limit} min` : 'Livre'}</span>
                        <span>Máx. tentativas: {exam.max_attempts ?? 'Livre'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.2fr,1.8fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filtros do banco</CardTitle>
                  <CardDescription>Refine a pesquisa para localizar itens específicos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <input
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Buscar texto da questão"
                      value={qFilter.q || ''}
                      onChange={(event) => setQFilter((prev) => ({ ...prev, q: event.target.value }))}
                    />
                    <input
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Tag"
                      value={qFilter.tag || ''}
                      onChange={(event) => setQFilter((prev) => ({ ...prev, tag: event.target.value }))}
                    />
                    <Select
                      value={qFilter.difficulty || ''}
                      onValueChange={(value) => setQFilter((prev) => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Dificuldade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas</SelectItem>
                        <SelectItem value="easy">Fundamental</SelectItem>
                        <SelectItem value="medium">Intermediário</SelectItem>
                        <SelectItem value="hard">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" onClick={() => setQFilter({})}>
                      Limpar filtros
                    </Button>
                    <Button variant="default" onClick={() => void loadQuestions()} disabled={loading}>
                      Aplicar filtros
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                      <span>Total de itens</span>
                      <span className="font-medium text-slate-700">{questionStats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Aguardando revisão</span>
                      <span className="font-medium text-amber-600">{questionStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Aprovados</span>
                      <span className="font-medium text-emerald-600">{questionStats.approved}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nova questão</CardTitle>
                  <CardDescription>Cadastre itens com explicação detalhada para o relatório pós-prova.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Enunciado"
                    value={formQ.question_text}
                    onChange={(event) => setFormQ((prev) => ({ ...prev, question_text: event.target.value }))}
                  />
                  <textarea
                    className="h-28 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder={'Opções (uma por linha)'}
                    value={formQ.optionsText}
                    onChange={(event) => setFormQ((prev) => ({ ...prev, optionsText: event.target.value }))}
                  />
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Resposta correta"
                    value={formQ.answer}
                    onChange={(event) => setFormQ((prev) => ({ ...prev, answer: event.target.value }))}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Select
                      value={formQ.difficulty}
                      onValueChange={(value) => setFormQ((prev) => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Dificuldade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Fundamental</SelectItem>
                        <SelectItem value="medium">Intermediário</SelectItem>
                        <SelectItem value="hard">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Tags (separadas por vírgula)"
                      value={formQ.tagsText}
                      onChange={(event) => setFormQ((prev) => ({ ...prev, tagsText: event.target.value }))}
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        setError(null);
                        setSuccess(null);
                        const { data: sessionData } = await supabase.auth.getSession();
                        const token = sessionData?.session?.access_token;
                        const options = formQ.optionsText
                          .split('\n')
                          .map((option) => option.trim())
                          .filter(Boolean);
                        const tags = formQ.tagsText
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean);

                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                        const response = await fetch(`${apiUrl}/api/exams/questions`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({
                            question_text: formQ.question_text,
                            options,
                            answer: formQ.answer,
                            tags,
                            difficulty: formQ.difficulty
                          })
                        });

                        const json = await response.json();
                        if (!response.ok) {
                          throw new Error(json?.error || 'Erro ao criar questão');
                        }

                        setSuccess('Questão criada com sucesso!');
                        setFormQ({ question_text: '', optionsText: '', answer: '', tagsText: '', difficulty: 'medium' });
                        await loadQuestions();
                      } catch (e: any) {
                        setError(e?.message || 'Erro ao criar questão');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar ao banco
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Questões cadastradas</CardTitle>
                <CardDescription>Selecione itens para montar simulados personalizados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {questions.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                      Nenhuma questão encontrada com os filtros atuais.
                    </div>
                  ) : (
                    questions.map((question) => (
                      <div
                        key={question.id}
                        className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 transition hover:border-slate-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={selectedQIds.has(question.id)}
                              onChange={(event) => {
                                setSelectedQIds((prev) => {
                                  const next = new Set(prev);
                                  if (event.target.checked) {
                                    next.add(question.id);
                                  } else {
                                    next.delete(question.id);
                                  }
                                  return next;
                                });
                              }}
                            />
                            <div>
                              <div className="font-medium text-slate-900">{question.question_text}</div>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>Dificuldade: {question.difficulty || 'indefinida'}</span>
                                <span>Tags: {(question.tags || []).join(', ') || '—'}</span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                Opções: {(question.options || []).join(' | ')}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                const { data: sessionData } = await supabase.auth.getSession();
                                const token = sessionData?.session?.access_token;
                                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                                const response = await fetch(`${apiUrl}/api/exams/questions/${question.id}`, {
                                  method: 'DELETE',
                                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                                });
                                if (!response.ok) {
                                  const json = await response.json();
                                  throw new Error(json?.error || 'Erro ao remover questão');
                                }
                                await loadQuestions();
                                setSelectedQIds((prev) => {
                                  const next = new Set(prev);
                                  next.delete(question.id);
                                  return next;
                                });
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700">Montar simulado com selecionadas</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Título do exame"
                      value={examForm.title}
                      onChange={(event) => setExamForm((prev) => ({ ...prev, title: event.target.value }))}
                    />
                    <input
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Descrição"
                      value={examForm.description}
                      onChange={(event) => setExamForm((prev) => ({ ...prev, description: event.target.value }))}
                    />
                    <input
                      type="number"
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Tempo (min)"
                      value={examForm.time_limit}
                      onChange={(event) =>
                        setExamForm((prev) => ({ ...prev, time_limit: Number(event.target.value || 0) }))
                      }
                    />
                    <input
                      type="number"
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Nota mínima (%)"
                      value={examForm.passing_score}
                      onChange={(event) =>
                        setExamForm((prev) => ({ ...prev, passing_score: Number(event.target.value || 0) }))
                      }
                    />
                    <input
                      type="number"
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Máx. tentativas"
                      value={examForm.max_attempts}
                      onChange={(event) =>
                        setExamForm((prev) => ({ ...prev, max_attempts: Number(event.target.value || 0) }))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" onClick={() => setSelectedQIds(new Set())}>
                      Limpar seleção
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          if (!courseId) {
                            setError('Selecione um curso para vincular o exame.');
                            return;
                          }
                          if (!examForm.title.trim()) {
                            setError('Informe um título para o exame.');
                            return;
                          }
                          if (selectedQIds.size === 0) {
                            setError('Selecione pelo menos uma questão.');
                            return;
                          }
                          setLoading(true);
                          setError(null);
                          setSuccess(null);

                          const { data: sessionData } = await supabase.auth.getSession();
                          const token = sessionData?.session?.access_token;
                          const payload = {
                            title: examForm.title,
                            description: examForm.description,
                            time_limit: examForm.time_limit,
                            passing_score: examForm.passing_score,
                            max_attempts: examForm.max_attempts,
                            course_id: courseId,
                            question_ids: Array.from(selectedQIds)
                          };
                          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                          const response = await fetch(`${apiUrl}/api/exams/create-from-bank`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              ...(token ? { Authorization: `Bearer ${token}` } : {})
                            },
                            body: JSON.stringify(payload)
                          });
                          const json = await response.json();
                          if (!response.ok) {
                            throw new Error(json?.error || 'Falha ao criar exame');
                          }
                          setSuccess('Exame criado com sucesso!');
                          setSelectedQIds(new Set());
                          setExamForm({ title: '', description: '', time_limit: 30, passing_score: 70, max_attempts: 3 });
                          await load();
                        } catch (e: any) {
                          setError(e?.message || 'Erro ao criar exame');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      Publicar simulado
                    </Button>
                    <span className="text-xs text-slate-500">Selecionadas: {selectedQIds.size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de dificuldade</CardTitle>
              <CardDescription>Balanceie o peso das certificações de acordo com o nível profissional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'easy', label: 'Fundamental' },
                { key: 'medium', label: 'Intermediário' },
                { key: 'hard', label: 'Avançado' }
              ].map(({ key, label }) => {
                const count = (questionStats.difficultyCounts as Record<string, number>)[key] ?? 0;
                const percent = questionStats.total ? Math.round((count / questionStats.total) * 100) : 0;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{label}</span>
                      <span className="text-slate-500">{count} questões • {percent}%</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provedores monitorados</CardTitle>
              <CardDescription>Detalhamento por vendor para calibrar os simulados corporativos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providerStats.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  Gere um blueprint para visualizar os dados.
                </div>
              ) : (
                providerStats.map((stat) => {
                  const percent = totalProviderExams ? Math.round((stat.exams / totalProviderExams) * 100) : 0;
                  return (
                    <div key={stat.provider} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{stat.provider}</span>
                        <span className="text-slate-500">{stat.exams} provas • {stat.questions} questões</span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

