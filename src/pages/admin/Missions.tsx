import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function AdminMissions() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [objective, setObjective] = useState('')
  const [courseId, setCourseId] = useState('')
  const [generateAI, setGenerateAI] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const createMission = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, objective, course_id: courseId || null, generate_with_ai: generateAI, is_required: true })
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Erro ao criar missão')
      setSuccess('Missão criada com sucesso!')
      setTitle(''); setDescription(''); setObjective(''); setCourseId('')
    } catch (e: any) {
      setError(e?.message || 'Erro')
    } finally { setLoading(false) }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Missão (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <Label>Objetivo</Label>
          <Input value={objective} onChange={(e) => setObjective(e.target.value)} />
        </div>
        <div>
          <Label>Vincular ao Curso (opcional)</Label>
          <Input placeholder="course_id" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input id="ai" type="checkbox" checked={generateAI} onChange={(e) => setGenerateAI(e.target.checked)} />
          <Label htmlFor="ai">Gerar conteúdo com IA</Label>
        </div>
        <Button onClick={createMission} disabled={loading}>{loading ? 'Criando...' : 'Criar Missão'}</Button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
      </CardContent>
    </Card>
  )
}

