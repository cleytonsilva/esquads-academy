// Esquads Academy - Componente de Leaderboard

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Star, Crown } from 'lucide-react';
import { formatPoints, getInitials } from '@/utils/format';
import type { LeaderboardEntry } from '@/types/gamification';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title?: string;
  showBadges?: boolean;
  maxEntries?: number;
}

export function Leaderboard({ 
  entries, 
  currentUserId,
  title = "Ranking",
  showBadges = true,
  maxEntries = 10
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, maxEntries);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum usuário no ranking ainda</p>
          </div>
        ) : (
          displayEntries.map((entry) => (
            <div
              key={entry.user_id}
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${getPositionColor(entry.position)}
                ${isCurrentUser(entry.user_id) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                hover:shadow-md
              `}
            >
              <div className="flex items-center justify-between">
                {/* Posição e Avatar */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getPositionIcon(entry.position) || (
                      <span className="font-bold text-gray-600">
                        {entry.position}
                      </span>
                    )}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url} alt={entry.full_name} />
                    <AvatarFallback>
                      {getInitials(entry.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">
                        {entry.full_name}
                      </h4>
                      {isCurrentUser(entry.user_id) && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Você
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">@{entry.username}</p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold text-gray-900">
                      {formatPoints(entry.total_points)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span>Nível</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.level}
                      </Badge>
                    </div>
                    
                    {showBadges && entry.badges_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3" />
                        <span>{entry.badges_count}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Indicador especial para top 3 */}
              {entry.position <= 3 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    {entry.position === 1 && (
                      <>
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700">
                          Campeão
                        </span>
                      </>
                    )}
                    {entry.position === 2 && (
                      <>
                        <Trophy className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Vice-Campeão
                        </span>
                      </>
                    )}
                    {entry.position === 3 && (
                      <>
                        <Medal className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">
                          Terceiro Lugar
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Indicador de mais entradas */}
        {entries.length > maxEntries && (
          <div className="text-center pt-3 border-t">
            <p className="text-sm text-gray-500">
              E mais {entries.length - maxEntries} usuários...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
