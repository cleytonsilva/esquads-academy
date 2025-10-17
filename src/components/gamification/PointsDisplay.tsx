import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Zap } from 'lucide-react';

interface PointsDisplayProps {
  points: number;
  level: number;
  streak: number;
  variant?: 'card' | 'compact' | 'detailed';
  showLevelProgress?: boolean;
  levelProgress?: number;
  pointsToNext?: number;
}

export function PointsDisplay({ 
  points, 
  level,
  streak,
  variant = 'card',
  showLevelProgress = false,
  levelProgress = 0,
  pointsToNext = 0
}: PointsDisplayProps) {
  const formatPoints = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-semibold text-gray-900">
            {formatPoints(points)}
          </span>
        </div>
        
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Nível {level}
        </Badge>

        {streak > 0 && (
          <div className="flex items-center space-x-1">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600">
              {streak} dias
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="space-y-4">
        {/* Pontos Totais */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pontos Totais</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPoints(points)}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
                Nível {level}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progresso do Nível */}
        {showLevelProgress && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Progresso do Nível</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Nível {level}</span>
                <span className="text-gray-600">Nível {level + 1}</span>
              </div>
              
              <Progress value={levelProgress} className="h-3" />
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Faltam <span className="font-semibold text-blue-600">
                    {formatPoints(pointsToNext)}
                  </span> pontos para o próximo nível
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Streak */}
        {streak > 0 && (
          <Card className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sequência Atual</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {streak} dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Variant 'card' (default)
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>Seus Pontos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pontos e Nível */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {formatPoints(points)}
            </p>
            <p className="text-sm text-gray-600">pontos totais</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
            Nível {level}
          </Badge>
        </div>

        {/* Progresso */}
        {showLevelProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progresso do nível</span>
              <span className="text-gray-600">
                {Math.round(levelProgress)}%
              </span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <p className="text-xs text-gray-500 text-center">
              {formatPoints(pointsToNext)} pontos para o nível {level + 1}
            </p>
          </div>
        )}

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center justify-center space-x-2 pt-2 border-t">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600">
              Sequência de <span className="font-semibold text-orange-600">
                {streak} dias
              </span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
