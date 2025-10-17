import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

export default function StudentPaths() {
  const [paths, setPaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{ load() },[])
  const load = async () => {
    try {
      setLoading(true); setError(null)
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/paths?published=true`)
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Erro')
      setPaths(j.paths || [])
    } catch (e: any) { setError(e?.message || 'Erro') } finally { setLoading(false) }
  }

  if (loading) return <div className="p-4">Carregando...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {paths.map((p:any)=> (
        <Card key={p.id} className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle>{p.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-700 line-clamp-3">{p.description}</p>
            <div className="text-xs text-gray-500">Nível: {p.level}</div>
            <Button asChild className="w-full"><Link to={ROUTES.STUDENT_PATHS.replace('/paths','') + `/paths/${p.id}`}>Ver Trilha</Link></Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

