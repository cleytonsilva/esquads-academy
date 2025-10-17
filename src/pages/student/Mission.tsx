import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TerminalMission from '@/components/missions/TerminalMission'
import ChatBlu from '@/components/missions/ChatBlu'
import { supabase } from '@/integrations/supabase/client'

type Mission = { id: string; title: string; description?: string; type?: string; steps?: any[]; objective?: string }

export default function StudentMission() {
  const { id } = useParams<{ id: string }>()
  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [id])

  const load = async () => {
    try {
      setLoading(true); setError(null)
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/missions/${id}`)
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Erro')
      setMission(j.mission)
    } catch (e: any) { setError(e?.message || 'Erro') } finally { setLoading(false) }
  }

  const complete = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/missions/${id}/complete`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} })
  }

  if (loading) return <div className="p-4">Carregando...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!mission) return <div className="p-4">Missão não encontrada.</div>

  const steps = (mission.steps || []).length ? mission.steps : [{ id: 's1', prompt: mission.objective || 'Resolva a tarefa', answer: 'concluido' }]

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{mission.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {(!mission.type || mission.type === 'terminal' || mission.type === 'ctf') ? (
            <TerminalMission title={mission.title} steps={steps} onComplete={complete} />
          ) : (
            <div>Tipo de missão não suportado</div>
          )}
        </div>
        <div className="min-h-[22rem]">
          <ChatBlu context={{ missionId: mission.id, objective: mission.objective }} />
        </div>
      </div>
    </div>
  )
}

