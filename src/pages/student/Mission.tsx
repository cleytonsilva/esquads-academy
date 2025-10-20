import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MissionTerminal } from '@/components/missions/MissionTerminal'
import ChatBlu from '@/components/missions/ChatBlu'
import { useAuth } from '@/contexts/AuthContext'

type Mission = { id: string; title: string; description?: string; type?: string; steps?: any[]; objective?: string }

export default function StudentMission() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
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
    const token = session?.access_token
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
            <div className="h-96">
              <MissionTerminal
                mission={{
                  id: mission.id,
                  title: mission.title,
                  description: mission.description || '',
                  category: 'FIREWALL' as any,
                  categoryIcon: 'Shield',
                  difficultyLevel: 'BASIC' as any,
                  difficulty: 'Iniciante',
                  xpReward: 100,
                  isLocked: false,
                  badgeOnCompletion: 'Mission Complete',
                  duration: '30 min',
                  durationMinutes: 30,
                  tools: [],
                  prerequisites: [],
                  isPremium: false,
                  objectives: steps.map((step: any, index: number) => ({
                    id: `step-${index}`,
                    missionId: mission.id,
                    title: step.prompt || `Step ${index + 1}`,
                    description: step.hint || '',
                    expectedCommand: step.answer,
                    isCompleted: false,
                    order: index,
                    points: 25
                  })),
                  badges: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  status: 'NOT_STARTED' as any
                }}
                onMissionComplete={(score, timeSpent) => {
                  console.log('Mission completed:', score, timeSpent)
                  complete()
                }}
                onMissionProgress={(progress) => {
                  console.log('Mission progress:', progress)
                }}
              />
            </div>
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

