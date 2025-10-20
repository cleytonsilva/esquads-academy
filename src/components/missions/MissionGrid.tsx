/**
 * Grid de Missões
 * Baseado em paineis/src/pages/mission-selection/components/MissionGrid.jsx
 */

import React from 'react'
import { MissionCard } from './MissionCard'
import { MissionWithProgress } from '@/types/gamification'
import { Loader2 } from 'lucide-react'

interface MissionGridProps {
  missions: MissionWithProgress[]
  userPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
  isLoading?: boolean
  onMissionStart?: (mission: MissionWithProgress) => void
}

export const MissionGrid: React.FC<MissionGridProps> = ({
  missions,
  userPlan,
  isLoading = false,
  onMissionStart,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando missões...</p>
        </div>
      </div>
    )
  }

  if (missions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-10 w-10 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma missão encontrada</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou volte mais tarde para novas missões.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          userPlan={userPlan}
          onStart={onMissionStart}
        />
      ))}
    </div>
  )
}
