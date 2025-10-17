import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Course = { id: string; title: string }
type Exam = { id: string; title: string; course_id: string; time_limit?: number; max_attempts?: number; questions?: any[]; total_questions?: number }

export default function AdminExams() {
  const [courses, setCourses] = useState<Course[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [courseId, setCourseId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Question bank state
  const [questions, setQuestions] = useState<any[]>([])
  const [qFilter, setQFilter] = useState<{ q?: string; tag?: string; difficulty?: string }>({})
  const [formQ, setFormQ] = useState<{ question_text: string; optionsText: string; answer: string; tagsText: string; difficulty: string }>({
    question_text: '', optionsText: '', answer: '', tagsText: '', difficulty: 'medium'
  })
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set())
  const [examForm, setExamForm] = useState<{ title: string; description: string; time_limit: number; passing_score: number; max_attempts: number }>({
    title: '', description: '', time_limit: 30, passing_score: 70, max_attempts: 3
  })

  useEffect(() => { void load() }, [])

  const load = async () => {
    try {
      setLoading(true); setError(null)
      const rc = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/courses`)
      const jc = await rc.json()
      if (rc.ok) setCourses(jc.courses?.map((c: any) => ({ id: c.id, title: c.title })) || [])
      const re = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams`)
      const je = await re.json()
      if (re.ok) setExams(je.exams || [])
      // Load question bank
      await loadQuestions()
    } catch (e: any) { setError(e?.message || 'Erro ao carregar') }
    finally { setLoading(false) }
  }

  const loadQuestions = async () => {
    const params = new URLSearchParams()
    if (qFilter.q) params.set('q', qFilter.q)
    if (qFilter.tag) params.set('tag', qFilter.tag)
    if (qFilter.difficulty) params.set('difficulty', qFilter.difficulty)
    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/questions?${params.toString()}`)
    const j = await r.json()
    if (r.ok) setQuestions(j.questions || [])
  }

  const generateForCourse = async () => {
    if (!courseId) return
    try {
      setLoading(true); setError(null); setSuccess(null)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/courses/${courseId}/exams/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({})
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Falha ao gerar exame')
      setSuccess('Exame gerado com sucesso!')
      await load()
    } catch (e: any) { setError(e?.message || 'Erro') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exames</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Exame Final por Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="w-72"><SelectValue placeholder="Selecione um curso" /></SelectTrigger>
              <SelectContent>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => void generateForCourse()} disabled={!courseId || loading}>
              <Plus className="w-4 h-4 mr-2" /> Gerar Exame
            </Button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Exames</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {exams.length === 0 ? (
            <div className="text-sm text-gray-600">Nenhum exame cadastrado.</div>
          ) : (
            exams.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 border rounded">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.title}</div>
                  <div className="text-xs text-gray-500">{e.total_questions || (e.questions?.length || 0)} questões • {e.time_limit || 0} min</div>
                </div>
                <div className="text-xs text-gray-500">Curso: {e.course_id.slice(0, 8)}...</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banco de Questões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input className="border rounded px-2 py-1" placeholder="Buscar texto" value={qFilter.q || ''} onChange={(e)=> setQFilter(s=>({ ...s, q: e.target.value }))} />
            <input className="border rounded px-2 py-1" placeholder="Tag" value={qFilter.tag || ''} onChange={(e)=> setQFilter(s=>({ ...s, tag: e.target.value }))} />
            <Select value={qFilter.difficulty || ''} onValueChange={(v)=> setQFilter(s=>({ ...s, difficulty: v }))}>
              <SelectTrigger><SelectValue placeholder="Dificuldade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={()=> void loadQuestions()}>Aplicar Filtros</Button>
          </div>

          {/* Formulário de criação */}
          <div className="border rounded p-3 space-y-3">
            <div className="text-sm font-medium">Nova questão (múltipla escolha)</div>
            <input className="border rounded px-2 py-1 w-full" placeholder="Enunciado" value={formQ.question_text} onChange={(e)=> setFormQ(s=>({ ...s, question_text: e.target.value }))} />
            <textarea className="border rounded px-2 py-1 w-full" placeholder={'Opções (uma por linha)'} value={formQ.optionsText} onChange={(e)=> setFormQ(s=>({ ...s, optionsText: e.target.value }))} />
            <input className="border rounded px-2 py-1 w-full" placeholder="Resposta exata (deve coincidir com uma opção)" value={formQ.answer} onChange={(e)=> setFormQ(s=>({ ...s, answer: e.target.value }))} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={formQ.difficulty} onValueChange={(v)=> setFormQ(s=>({ ...s, difficulty: v }))}>
                <SelectTrigger><SelectValue placeholder="Dificuldade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
              <input className="border rounded px-2 py-1 w-full" placeholder="Tags (separadas por vírgula)" value={formQ.tagsText} onChange={(e)=> setFormQ(s=>({ ...s, tagsText: e.target.value }))} />
              <Button onClick={async ()=>{
                try {
                  setLoading(true); setError(null); setSuccess(null)
                  const { data: sessionData } = await supabase.auth.getSession()
                  const token = sessionData?.session?.access_token
                  const options = formQ.optionsText.split('\n').map(s=>s.trim()).filter(Boolean)
                  const tags = formQ.tagsText.split(',').map(s=>s.trim()).filter(Boolean)
                  const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/questions`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({
                      question_text: formQ.question_text,
                      options,
                      answer: formQ.answer,
                      tags,
                      difficulty: formQ.difficulty,
                    })
                  })
                  const j = await r.json()
                  if (!r.ok) throw new Error(j?.error || 'Erro ao criar questão')
                  setSuccess('Questão criada!')
                  setFormQ({ question_text: '', optionsText: '', answer: '', tagsText: '', difficulty: 'medium' })
                  await loadQuestions()
                } catch (e: any) { setError(e?.message || 'Erro') } finally { setLoading(false) }
              }}>Adicionar</Button>
            </div>
          </div>

          {/* Lista de questões */}
          <div className="space-y-2">
            {questions.length === 0 ? (
              <div className="text-sm text-gray-600">Nenhuma questão encontrada.</div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="p-3 border rounded flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={selectedQIds.has(q.id)} onChange={(e)=>{
                      setSelectedQIds(prev => {
                        const next = new Set(prev)
                        if (e.target.checked) next.add(q.id); else next.delete(q.id)
                        return next
                      })
                    }} />
                    <div className="font-medium truncate">{q.question_text}</div>
                  </div>
                  <div className="text-xs text-gray-500">Dificuldade: {q.difficulty} • Tags: {(q.tags || []).join(', ')}</div>
                  <div className="text-xs text-gray-500">Opções: {(q.options || []).join(' | ')} • Resposta: {q.answer}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={async ()=>{
                  try {
                    const { data: sessionData } = await supabase.auth.getSession()
                    const token = sessionData?.session?.access_token
                    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/questions/${q.id}`, {
                      method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {}
                    })
                    if (!r.ok) { const j = await r.json(); throw new Error(j?.error || 'Erro ao remover') }
                    await loadQuestions()
                    setSelectedQIds(prev => { const n = new Set(prev); n.delete(q.id); return n })
                  } catch (e) { console.error(e) }
                }} title="Remover"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))
          )}
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
          {/* Formulário para criar exame a partir das selecionadas */}
          <div className="mt-4 border rounded p-3 space-y-3">
            <div className="text-sm font-medium">Criar Exame com Selecionadas</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border rounded px-2 py-1" placeholder="Título do exame" value={examForm.title} onChange={(e)=> setExamForm(s=>({ ...s, title: e.target.value }))} />
              <input className="border rounded px-2 py-1" placeholder="Descrição (opcional)" value={examForm.description} onChange={(e)=> setExamForm(s=>({ ...s, description: e.target.value }))} />
              <input type="number" className="border rounded px-2 py-1" placeholder="Tempo (min)" value={examForm.time_limit} onChange={(e)=> setExamForm(s=>({ ...s, time_limit: Number(e.target.value||0) }))} />
              <input type="number" className="border rounded px-2 py-1" placeholder="Nota mínima (%)" value={examForm.passing_score} onChange={(e)=> setExamForm(s=>({ ...s, passing_score: Number(e.target.value||0) }))} />
              <input type="number" className="border rounded px-2 py-1" placeholder="Máx. tentativas" value={examForm.max_attempts} onChange={(e)=> setExamForm(s=>({ ...s, max_attempts: Number(e.target.value||0) }))} />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={()=> setSelectedQIds(new Set())}>Limpar seleção</Button>
              <Button onClick={async ()=>{
                try {
                  if (!courseId) { setError('Selecione um curso'); return }
                  if (!examForm.title.trim()) { setError('Informe um título'); return }
                  if (selectedQIds.size === 0) { setError('Selecione pelo menos uma questão'); return }
                  setLoading(true); setError(null); setSuccess(null)
                  const { data: sessionData } = await supabase.auth.getSession()
                  const token = sessionData?.session?.access_token
                  const payload = {
                    title: examForm.title,
                    description: examForm.description,
                    time_limit: examForm.time_limit,
                    passing_score: examForm.passing_score,
                    max_attempts: examForm.max_attempts,
                    course_id: courseId,
                    question_ids: Array.from(selectedQIds),
                  }
                  const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/exams/create-from-bank`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload)
                  })
                  const j = await r.json()
                  if (!r.ok) throw new Error(j?.error || 'Falha ao criar exame')
                  setSuccess('Exame criado com sucesso!')
                  setSelectedQIds(new Set())
                  setExamForm({ title: '', description: '', time_limit: 30, passing_score: 70, max_attempts: 3 })
                  await load()
                } catch (e: any) { setError(e?.message || 'Erro') } finally { setLoading(false) }
              }} disabled={loading}>
                Criar Exame com Selecionadas
              </Button>
              <div className="text-xs text-gray-500">Selecionadas: {selectedQIds.size}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
