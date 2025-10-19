import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Award, Brain, Clock, History, Layers, LineChart, PlayCircle, Shield, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CERTIFICATION_DIFFICULTY, DEFAULT_EXAM_LENGTHS } from '@/utils/constants';
import { useMissions } from '@/hooks/useMissionsRobust';

const difficultyLabels: Record<string, string> = {
  [CERTIFICATION_DIFFICULTY.PRACTITIONER]: 'Praticante',
  [CERTIFICATION_DIFFICULTY.ASSOCIATE]: 'Associate',
  [CERTIFICATION_DIFFICULTY.PROFESSIONAL]: 'Professional',
  [CERTIFICATION_DIFFICULTY.EXPERT]: 'Expert'
};

type Exam = {
  id: string;
  title: string;
  description?: string;
  time_limit?: number; // minutes
  max_attempts?: number;
  questions?: any[];
  total_questions?: number;
  tags?: string[];
  provider?: string;
  certification?: string;
  difficulty?: string;
  metadata?: {
    provider?: string;
    certification?: string;
    difficulty?: string;
    topics?: string[];
    track?: string;
  };
};

type Attempt = {
  id: string;
  exam_id: string;
  user_id: string;
  answers: Record<string, string>;
  score: number;
  passed: boolean;
  attempt_number: number;
  started_at: string;
  completed_at?: string | null;
};

type ExamConfig = {
  provider: string;
  certification: string;
  difficulty: string;
  questionCount: number;
  mode: 'simulator' | 'exam';
  topics: string[];
};

type ExamBlueprint = {
  exam: Exam;
  provider: string;
  certification: string;
  difficulty: string;
  topics: string[];
  track: string;
  questionPool: number;
  timeLimit?: number;
};

type StartedAttempt = {
  attempt: Attempt;
  blueprint: ExamBlueprint;
  questions: any[];
  time_limit?: number;
  config: ExamConfig;
};

type AttemptSummary = {
  attempt: Attempt;
  blueprint: ExamBlueprint;
  config: ExamConfig;
  xpEarned: number;
};

const normalizeExam = (exam: Exam): ExamBlueprint => {
  const provider = exam.metadata?.provider || exam.provider || guessProvider(exam.title);
  const certification = exam.metadata?.certification || exam.certification || exam.title;
  const difficulty = exam.metadata?.difficulty || exam.difficulty || CERTIFICATION_DIFFICULTY.ASSOCIATE;
  const topics = Array.isArray(exam.metadata?.topics)
    ? exam.metadata?.topics ?? []
    : Array.isArray(exam.tags)
      ? exam.tags ?? []
      : [];

  return {
    exam,
    provider,
    certification,
    difficulty,
    topics,
    track: exam.metadata?.track || provider,
    questionPool: exam.total_questions || exam.questions?.length || 0,
    timeLimit: exam.time_limit
  };
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

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case CERTIFICATION_DIFFICULTY.PROFESSIONAL:
    case CERTIFICATION_DIFFICULTY.EXPERT:
      return 'bg-purple-100 text-purple-700';
    case CERTIFICATION_DIFFICULTY.ASSOCIATE:
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-green-100 text-green-700';
  }
};

const sanitizeQuestions = (questions: any[], config: ExamConfig) => {
  if (!Array.isArray(questions) || questions.length === 0) return [];

  const normalizedDifficulty = config.difficulty.toLowerCase();
  const filtered = questions.filter((q) => {
    if (!config.difficulty) return true;
    const qDifficulty = String(q.difficulty || q.level || q.metadata?.difficulty || '').toLowerCase();
    if (!qDifficulty) return true;
    if (normalizedDifficulty === CERTIFICATION_DIFFICULTY.EXPERT && qDifficulty.includes('expert')) return true;
    if (normalizedDifficulty === CERTIFICATION_DIFFICULTY.PROFESSIONAL) {
      return qDifficulty.includes('professional') || qDifficulty.includes('advanced');
    }
    if (normalizedDifficulty === CERTIFICATION_DIFFICULTY.ASSOCIATE) {
      return qDifficulty.includes('associate') || qDifficulty.includes('intermediate');
    }
    if (normalizedDifficulty === CERTIFICATION_DIFFICULTY.PRACTITIONER) {
      return qDifficulty.includes('beginner') || qDifficulty.includes('fundamental');
    }
    return true;
  });

  if (filtered.length < config.questionCount) {
    return questions.slice(0, config.questionCount);
  }

  return filtered.slice(0, config.questionCount);
};

const getMasteryTitle = (score: number) => {
  if (score >= 90) return 'Mestre do SOC';
  if (score >= 80) return 'Defensor Proativo';
  if (score >= 65) return 'Analista em Ascensão';
  return 'Explorador Iniciante';
};

const calculateXp = (score: number, mode: 'simulator' | 'exam') => {
  const base = mode === 'exam' ? 20 : 10;
  return Math.round(score * base);
};

export default function StudentExams() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [current, setCurrent] = useState<StartedAttempt | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedCertification, setSelectedCertification] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(CERTIFICATION_DIFFICULTY.ASSOCIATE);
  const [questionCount, setQuestionCount] = useState<number>(DEFAULT_EXAM_LENGTHS[1]);
  const [mode, setMode] = useState<'simulator' | 'exam'>('simulator');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<AttemptSummary | null>(null);

  const { missions } = useMissions();

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (current && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((seconds) => {
          if (seconds <= 1) {
            void submit();
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [current, timeRemaining]);

  const load = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams`);
      const j = await r.json();
      if (r.ok) setExams(j.exams || []);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token) {
        const ra = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/attempts/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ja = await ra.json();
        if (ra.ok) setAttempts(ja.attempts || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const blueprints = useMemo(() => exams.map(normalizeExam), [exams]);

  const providers = useMemo(() => {
    const unique = new Set<string>();
    blueprints.forEach((bp) => unique.add(bp.provider));
    return Array.from(unique);
  }, [blueprints]);

  const certifications = useMemo(() => {
    const filtered = selectedProvider === 'all'
      ? blueprints
      : blueprints.filter((bp) => bp.provider === selectedProvider);
    const unique = new Set<string>();
    filtered.forEach((bp) => unique.add(bp.certification));
    return Array.from(unique);
  }, [blueprints, selectedProvider]);

  const visibleBlueprints = useMemo(() => {
    return blueprints.filter((bp) => {
      if (selectedProvider !== 'all' && bp.provider !== selectedProvider) return false;
      if (selectedCertification !== 'all' && bp.certification !== selectedCertification) return false;
      return true;
    });
  }, [blueprints, selectedProvider, selectedCertification]);

  useEffect(() => {
    if (!selectedBlueprintId || !visibleBlueprints.some((bp) => bp.exam.id === selectedBlueprintId)) {
      setSelectedBlueprintId(visibleBlueprints[0]?.exam.id ?? null);
    }
  }, [visibleBlueprints, selectedBlueprintId]);

  const activeBlueprint = useMemo(() => {
    if (!selectedBlueprintId) return visibleBlueprints[0] ?? null;
    return visibleBlueprints.find((bp) => bp.exam.id === selectedBlueprintId) ?? visibleBlueprints[0] ?? null;
  }, [visibleBlueprints, selectedBlueprintId]);

  const bestScore = useMemo(() => {
    const byExam: Record<string, number> = {};
    for (const a of attempts) {
      const prev = byExam[a.exam_id];
      if (typeof prev !== 'number' || a.score > prev) byExam[a.exam_id] = a.score;
    }
    return byExam;
  }, [attempts]);

  const startedCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of attempts) counts[a.exam_id] = (counts[a.exam_id] || 0) + 1;
    return counts;
  }, [attempts]);

  const recommendedMissions = useMemo(() => {
    if (!lastSummary) return [];
    const topics = lastSummary.config.topics.map((topic) => topic.toLowerCase());
    if (!topics.length) return [];

    return missions.filter((mission) => {
      const missionTags = (mission.tags || []).map((tag) => tag.toLowerCase());
      const missionCategory = mission.category?.toLowerCase?.() ?? '';
      return topics.some((topic) => missionTags.includes(topic) || missionCategory.includes(topic));
    }).slice(0, 3);
  }, [missions, lastSummary]);

  const start = async (blueprint: ExamBlueprint) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;

    const exam = blueprint.exam;
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/${exam.id}/attempts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    const payload = await response.json();
    if (!response.ok) return;

    const attempt: Attempt = payload.attempt;
    const config: ExamConfig = {
      provider: blueprint.provider,
      certification: blueprint.certification,
      difficulty: selectedDifficulty,
      questionCount,
      mode,
      topics: blueprint.topics
    };

    const sanitized = sanitizeQuestions(payload.questions || [], config);

    setCurrent({
      attempt,
      blueprint,
      questions: sanitized,
      time_limit: payload.time_limit || blueprint.timeLimit,
      config
    });
    setQuestionIndex(0);
    setAnswers({});
    const seconds = (payload.time_limit || blueprint.timeLimit || 0) * 60;
    setTimeRemaining(seconds > 0 ? seconds : 0);
    setLastSummary(null);
  };

  const answerKeyFor = (q: any) => (q?.q || q?.question_text || String(questionIndex));

  const submit = async () => {
    if (!current) return;
    try {
      setIsSubmitting(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/attempts/${current.attempt.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers })
      });
      const j = await r.json();
      if (r.ok) {
        setAttempts((prev) => [j.attempt, ...prev]);
        const xpEarned = calculateXp(j.attempt.score, current.config.mode);
        setLastSummary({ attempt: j.attempt, blueprint: current.blueprint, config: current.config, xpEarned });
        setCurrent(null);
        setAnswers({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-sm text-gray-600">Carregando módulo de certificações...</div>
      </div>
    );
  }

  if (current) {
    const qs = current.questions;
    const q = qs[questionIndex];
    const progress = qs.length ? Math.round(((questionIndex + 1) / qs.length) * 100) : 0;
    const timeLabel = `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`;

    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="text-xs uppercase text-gray-500 tracking-wide">{current.config.mode === 'simulator' ? 'Simulado Personalizado' : 'Exame de Certificação'}</div>
                <div className="text-2xl font-semibold text-gray-900">{current.blueprint.certification}</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{current.blueprint.provider}</Badge>
                  <Badge variant="outline" className={getDifficultyColor(current.config.difficulty)}>
                    {difficultyLabels[current.config.difficulty] || current.config.difficulty}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                    {current.config.questionCount} questões
                  </Badge>
                </div>
              </div>
              {current.time_limit ? (
                <div className="flex items-center gap-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4" /> {timeLabel}
                </div>
              ) : null}
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-blue-600" /> Questão {questionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{q?.q || q?.question_text || 'Questão'}</h3>
              {Array.isArray(q?.options) ? (
                <RadioGroup value={answers[answerKeyFor(q)] || ''} onValueChange={(v) => setAnswers((prev) => ({ ...prev, [answerKeyFor(q)]: v }))}>
                  {(q.options as string[]).map((opt: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition">
                      <RadioGroupItem value={opt} id={`opt-${idx}`} />
                      <Label htmlFor={`opt-${idx}`} className="cursor-pointer flex-1 text-base text-gray-800">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-sm text-red-600">Questão inválida: opções não encontradas. Contate o administrador.</div>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))} disabled={questionIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
              </Button>
              {questionIndex === qs.length - 1 ? (
                <Button onClick={() => void submit()} disabled={isSubmitting}>
                  {isSubmitting ? 'Submetendo...' : 'Finalizar Prova'}
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setQuestionIndex((i) => Math.min(qs.length - 1, i + 1))}>
                  Próxima <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeBestScore = activeBlueprint ? bestScore[activeBlueprint.exam.id] : undefined;
  const activeAttempts = activeBlueprint ? startedCount[activeBlueprint.exam.id] || 0 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {lastSummary && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-5 h-5" /> Relatório Gamificado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white shadow-sm border border-blue-100">
                <div className="text-xs uppercase text-blue-500 font-semibold">Título conquistado</div>
                <div className="text-xl font-bold text-blue-900">{getMasteryTitle(lastSummary.attempt.score)}</div>
                <div className="text-sm text-blue-600 mt-1">Score: {lastSummary.attempt.score}%</div>
              </div>
              <div className="p-4 rounded-lg bg-white shadow-sm border border-blue-100">
                <div className="text-xs uppercase text-blue-500 font-semibold">XP Ganho</div>
                <div className="text-xl font-bold text-blue-900">{lastSummary.xpEarned} XP</div>
                <div className="text-sm text-blue-600 mt-1">{lastSummary.config.mode === 'simulator' ? 'Modo Treino' : 'Modo Exame'}</div>
              </div>
              <div className="p-4 rounded-lg bg-white shadow-sm border border-blue-100">
                <div className="text-xs uppercase text-blue-500 font-semibold">Próximos passos</div>
                <div className="text-sm text-blue-600 mt-1">Reforce tópicos: {lastSummary.config.topics.slice(0, 3).join(', ') || 'Personalizados pela IA'}</div>
              </div>
            </div>

            {recommendedMissions.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Missões Recomendadas</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {recommendedMissions.map((mission) => (
                    <div key={mission.id} className="rounded-lg bg-white border border-blue-100 p-3 shadow-sm">
                      <div className="text-sm font-medium text-blue-900">{mission.title}</div>
                      <div className="text-xs text-blue-600 mt-1">{mission.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setLastSummary(null)}>
                Refazer Configuração
              </Button>
              {activeBlueprint && (
                <Button onClick={() => void start(activeBlueprint)}>
                  Iniciar Nova Prova <PlayCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="text-xs uppercase text-slate-500 tracking-wide">Hub de Certificações</div>
              <h1 className="text-3xl font-bold text-slate-900">Simulados e Exames Gamificados</h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                Configure provas alinhadas com certificações oficiais (AWS, Azure, Oracle, CompTIA e outras). Escolha provedor, tópicos, dificuldade e deixe a IA montar o questionário ideal.
              </p>
            </div>
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'simulator' | 'exam')} className="w-full max-w-sm">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="simulator">Modo Simulado</TabsTrigger>
                <TabsTrigger value="exam">Modo Exame</TabsTrigger>
              </TabsList>
              <TabsContent value="simulator" className="text-xs text-slate-500 mt-2">
                Feedback imediato, vidas ilimitadas e foco em aprendizado iterativo.
              </TabsContent>
              <TabsContent value="exam" className="text-xs text-slate-500 mt-2">
                Ambiente rígido, tempo controlado e XP bonificado por performance.
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Brain className="w-5 h-5 text-blue-600" /> Configuração da Prova
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provedor</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Certificação</Label>
                <Select value={selectedCertification} onValueChange={setSelectedCertification}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a certificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {certifications.map((cert) => (
                      <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dificuldade alvo</Label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CERTIFICATION_DIFFICULTY).map((level) => (
                      <SelectItem key={level} value={level}>{difficultyLabels[level]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade de questões</Label>
                <Select value={String(questionCount)} onValueChange={(v) => setQuestionCount(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_EXAM_LENGTHS.map((len) => (
                      <SelectItem key={len} value={String(len)}>{len} questões</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
              <p>
                A IA garantirá distribuição equilibrada de tópicos e alternância entre cenários de incidente, firewall e resposta forense para avaliar habilidade prática e velocidade de reação.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => activeBlueprint && void start(activeBlueprint)} disabled={!activeBlueprint}>
                Iniciar {mode === 'simulator' ? 'Simulado' : 'Exame'} <PlayCircle className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => setLastSummary(null)}>
                Limpar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <LineChart className="w-5 h-5 text-emerald-600" /> Status da Preparação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Melhor score</span>
                <span>{activeBestScore ? `${activeBestScore}%` : '—'}</span>
              </div>
              <Progress value={activeBestScore || 0} className="h-2" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              <div className="flex items-center gap-2"><History className="w-4 h-4" /> Tentativas realizadas</div>
              <span className="font-semibold">{activeAttempts}</span>
            </div>
            <div className="space-y-2 text-xs text-slate-500">
              <p>Os relatórios detalhados ficam disponíveis após cada tentativa com análise de tópicos, badges e recomendações de missões.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Layers className="w-5 h-5 text-indigo-600" /> Catálogo de Certificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visibleBlueprints.length === 0 ? (
            <div className="text-sm text-slate-500">Nenhuma certificação encontrada para o filtro selecionado.</div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleBlueprints.map((bp) => {
                const isActive = activeBlueprint?.exam.id === bp.exam.id;
                return (
                  <button
                    key={bp.exam.id}
                    type="button"
                    onClick={() => setSelectedBlueprintId(bp.exam.id)}
                    className={`text-left rounded-xl border p-4 transition hover:shadow-md ${isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase text-slate-500">{bp.provider}</div>
                        <div className="text-base font-semibold text-slate-900 mt-1">{bp.certification}</div>
                      </div>
                      <Badge variant="outline" className={getDifficultyColor(bp.difficulty)}>
                        {difficultyLabels[bp.difficulty] || bp.difficulty}
                      </Badge>
                    </div>
                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-2"><Target className="w-3 h-3" /> Pool: {bp.questionPool} questões</div>
                      <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> Tempo padrão: {bp.timeLimit ? `${bp.timeLimit} min` : 'Adaptável'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Award className="w-5 h-5 text-amber-600" /> Histórico de Tentativas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {attempts.length === 0 ? (
            <div className="text-sm text-slate-500">Ainda não há tentativas registradas. Inicie um simulado para gerar seu primeiro relatório.</div>
          ) : (
            attempts.slice(0, 10).map((attempt) => {
              const blueprint = blueprints.find((bp) => bp.exam.id === attempt.exam_id);
              return (
                <div key={attempt.id} className="border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{blueprint?.certification || 'Certificação personalizada'}</div>
                    <div className="text-xs text-slate-500 mt-1">Tentativa #{attempt.attempt_number} • {new Date(attempt.started_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={attempt.passed ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}>
                      {attempt.passed ? 'Aprovado' : 'Em evolução'}
                    </Badge>
                    <div className="text-sm font-semibold text-slate-900">{attempt.score}%</div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
