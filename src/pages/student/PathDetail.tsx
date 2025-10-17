import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PathDetail() {
  const { id } = useParams<{ id: string }>()
  const [path, setPath] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{ load() },[id])
  const load = async () => {
    try {
      setLoading(true); setError(null)
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/paths/${id}`)
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Erro')
      setPath(j.path); setCourses(j.courses || [])
    } catch (e: any) { setError(e?.message || 'Erro') } finally { setLoading(false) }
  }

  if (loading) return <div className="p-4">Carregando...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!path) return <div className="p-4">Trilha não encontrada.</div>

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{path.name}</h1>
      <p className="text-gray-700">{path.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c:any)=> (
          <Card key={c.id}>
            <div className="aspect-video overflow-hidden">
              {c.thumbnail_url && <img src={c.thumbnail_url} className="w-full h-full object-cover" />}
            </div>
            <CardHeader>
              <CardTitle className="text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full"><Link to={`/student/courses/${c.id}`}>Ir para o curso</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

