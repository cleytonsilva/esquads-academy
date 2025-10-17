import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, ArrowRight, Clock, PlayCircle, Target, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

type Exam = {
  id: string
  title: string
  description?: string
  time_limit?: number // minutes
  max_attempts?: number
  questions?: any[]
  total_questions?: number
}

type Attempt = {
  id: string
  exam_id: string
  user_id: string
  answers: Record<string, string>
  score: number
  passed: boolean
  attempt_number: number
  started_at: string
  completed_at?: string | null
}

type StartedAttempt = {
  attempt: Attempt
  title: string
  questions: any[]
  time_limit?: number
}

export default function StudentExams() {
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState<Exam[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [current, setCurrent] = useState<StartedAttempt | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    let t: any
    if (current && timeRemaining > 0) {
      t = setInterval(() => {
        setTimeRemaining((s) => {
          if (s <= 1) {
            void submit()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => { if (t) clearInterval(t) }
  }, [current, timeRemaining])

  const load = async () => {
    try {
      setLoading(true)
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams`)
      const j = await r.json()
      if (r.ok) setExams(j.exams || [])

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (token) {
        const ra = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/attempts/my`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const ja = await ra.json()
        if (ra.ok) setAttempts(ja.attempts || [])
      }
    } finally { setLoading(false) }
  }

  const bestScore = useMemo(() => {
    const byExam: Record<string, number> = {}
    for (const a of attempts) {
      const prev = byExam[a.exam_id]
      if (typeof prev !== 'number' || a.score > prev) byExam[a.exam_id] = a.score
    }
    return byExam
  }, [attempts])

  const startedCount = useMemo(() => {
    const c: Record<string, number> = {}
    for (const a of attempts) c[a.exam_id] = (c[a.exam_id] || 0) + 1
    return c
  }, [attempts])

  const start = async (exam: Exam) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) return
    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/${exam.id}/attempts`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    })
    const j = await r.json()
    if (!r.ok) return
    const attempt: Attempt = j.attempt
    setCurrent({ attempt, questions: j.questions || [], time_limit: j.time_limit, title: j.title })
    setQuestionIndex(0)
    setAnswers({})
    const seconds = (j.time_limit || 0) * 60
    setTimeRemaining(seconds > 0 ? seconds : 0)
  }

  const answerKeyFor = (q: any) => (q?.q || q?.question_text || String(questionIndex))

  const submit = async () => {
    if (!current) return
    try {
      setIsSubmitting(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) return
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/attempts/${current.attempt.id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ answers })
      })
      const j = await r.json()
      if (r.ok) {
        setAttempts(prev => [j.attempt, ...prev])
        setCurrent(null)
        setAnswers({})
      }
    } finally { setIsSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-sm text-gray-600">Carregando...</div>
      </div>
    )
  }

  // Attempt UI
  if (current) {
    const qs = current.questions
    const q = qs[questionIndex]
    const progress = qs.length ? Math.round(((questionIndex + 1) / qs.length) * 100) : 0
    const timeLabel = `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`

    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Exame</div>
                <div className="text-xl font-semibold">{current.title}</div>
              </div>
              {current.time_limit ? (
                <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /> {timeLabel}</div>
              ) : null}
            </div>
            <div className="mt-3"><Progress value={progress} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Target className="w-5 h-5 mr-2" /> Questão {questionIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{q?.q || q?.question_text || 'Questão'}</h3>
              {Array.isArray(q?.options) ? (
                <RadioGroup value={answers[answerKeyFor(q)] || ''} onValueChange={(v) => setAnswers(prev => ({ ...prev, [answerKeyFor(q)]: v }))}>
                  {(q.options as string[]).map((opt: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`opt-${idx}`} />
                      <Label htmlFor={`opt-${idx}`} className="cursor-pointer flex-1">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-sm text-red-600">Questão inválida: opções não encontradas. Contate o administrador.</div>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setQuestionIndex(i => Math.max(0, i - 1))} disabled={questionIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
              </Button>
              {questionIndex === qs.length - 1 ? (
                <Button onClick={() => void submit()} disabled={isSubmitting}>{isSubmitting ? 'Submetendo...' : 'Finalizar Exame'}</Button>
              ) : (
                <Button onClick={() => setQuestionIndex(i => Math.min(qs.length - 1, i + 1))}>
                  Próxima <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exames Disponíveis</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Exames</CardTitle><Target className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{exams.length}</div><p className="text-xs text-muted-foreground">Publicados</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tentativas</CardTitle><PlayCircle className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{attempts.length}</div><p className="text-xs text-muted-foreground">Total realizadas</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Melhor nota</CardTitle><CheckCircle className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{attempts.length ? Math.max(...attempts.map(a => a.score)) : 0}%</div><p className="text-xs text-muted-foreground">Sua maior pontuação</p></CardContent></Card>
      </div>

      {/* Exam list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((ex) => {
          const used = startedCount[ex.id] || 0
          const limit = typeof ex.max_attempts === 'number' ? ex.max_attempts : 3
          const best = typeof bestScore[ex.id] === 'number' ? bestScore[ex.id] : null
          return (
            <Card key={ex.id} className="hover:shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ex.title}</CardTitle>
                  <Badge variant="secondary">{ex.total_questions || (ex.questions?.length || 0)} questões</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm text-muted-foreground">
                  {ex.time_limit ? (
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2" />{ex.time_limit} minutos</div>
                  ) : null}
                  <div className="flex items-center">Tentativas: {used}/{limit}</div>
                </div>
                {best !== null && (
                  <div className="p-3 bg-muted rounded">
                    <div className="flex items-center justify-between text-sm">
                      <span>Melhor pontuação:</span>
                      <span className={`font-semibold ${best >= 70 ? 'text-green-600' : 'text-red-600'}`}>{best}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Status:</span>
                      {best >= 70 ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                    </div>
                  </div>
                )}
                <Button className="w-full" disabled={used >= limit} onClick={() => void start(ex)}>
                  <PlayCircle className="w-4 h-4 mr-2" /> {used >= limit ? 'Limite atingido' : 'Iniciar Exame'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
