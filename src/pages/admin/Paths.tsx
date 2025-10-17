import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function AdminPaths() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('beginner')
  const [isPublished, setIsPublished] = useState(true)
  const [courseIds, setCourseIds] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const createPath = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      const ids = courseIds.split(',').map(s=>s.trim()).filter(Boolean)
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/paths`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, level, is_published: isPublished, course_ids: ids })
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Erro ao criar trilha')
      setSuccess('Trilha criada!')
      setName(''); setDescription(''); setLevel('beginner'); setIsPublished(true); setCourseIds('')
    } catch (e: any) { setError(e?.message || 'Erro') } finally { setLoading(false) }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Trilha Profissional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Nome</Label>
          <Input value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        <div>
          <Label>Nível</Label>
          <Input value={level} onChange={(e)=>setLevel(e.target.value)} placeholder="beginner|intermediate|advanced" />
        </div>
        <div className="flex items-center gap-2">
          <input id="pub" type="checkbox" checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)} />
          <Label htmlFor="pub">Publicar</Label>
        </div>
        <div>
          <Label>IDs de Cursos (separados por vírgula)</Label>
          <Input value={courseIds} onChange={(e)=>setCourseIds(e.target.value)} placeholder="uuid1, uuid2, uuid3" />
        </div>
        <Button onClick={createPath} disabled={loading}>{loading ? 'Criando...' : 'Criar Trilha'}</Button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
      </CardContent>
    </Card>
  )
}

