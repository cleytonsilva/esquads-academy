import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  X, 
  Cloud, 
  CloudSnow, 
  Shield,
  Zap,
  Clock,
  Trophy
} from 'lucide-react';
import { MissionFilters as MissionFiltersType, MissionCategory } from '@/types/missions';
import { cn } from '@/lib/utils';

interface MissionFiltersProps {
  filters: MissionFiltersType;
  onFiltersChange: (filters: MissionFiltersType) => void;
  categories?: MissionCategory[];
  className?: string;
}

export function MissionFilters({ 
  filters, 
  onFiltersChange, 
  categories = [],
  className 
}: MissionFiltersProps) {
  const difficulties = [
    { value: 'easy', label: 'Fácil', color: 'text-green-400 border-green-500/30' },
    { value: 'medium', label: 'Médio', color: 'text-yellow-400 border-yellow-500/30' },
    { value: 'hard', label: 'Difícil', color: 'text-red-400 border-red-500/30' }
  ];

  const statuses = [
    { value: 'not_started', label: 'Não Iniciada', icon: Clock },
    { value: 'in_progress', label: 'Em Progresso', icon: Zap },
    { value: 'completed', label: 'Concluída', icon: Trophy }
  ];

  const getCategoryIcon = (provider: string) => {
    switch (provider) {
      case 'aws': return Cloud;
      case 'azure': return CloudSnow;
      case 'comptia': return Shield;
      default: return Shield;
    }
  };

  const updateFilters = (key: keyof MissionFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof MissionFiltersType];
    return value !== undefined && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <Card className={cn("bg-gray-900/50 border-gray-700", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar missões..."
            value={filters.search || ''}
            onChange={(e) => updateFilters('search', e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Categorias/Certificações */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Certificações
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.id);
                const isSelected = filters.certification === category.id;
                
                return (
                  <Badge
                    key={category.id}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:scale-105",
                      isSelected 
                        ? "bg-purple-600 text-white border-purple-500" 
                        : "border-gray-600 text-gray-300 hover:border-purple-500/50"
                    )}
                    onClick={() => updateFilters('certification', 
                      isSelected ? undefined : category.id
                    )}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {category.name}
                    <span className="ml-1 text-xs opacity-70">
                      ({category.missions_count})
                    </span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Dificuldade */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300">Dificuldade</h4>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => {
              const isSelected = filters.difficulty === difficulty.value;
              
              return (
                <Badge
                  key={difficulty.value}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105",
                    isSelected 
                      ? "bg-purple-600 text-white border-purple-500" 
                      : cn("border-gray-600 hover:border-purple-500/50", difficulty.color)
                  )}
                  onClick={() => updateFilters('difficulty', 
                    isSelected ? undefined : difficulty.value
                  )}
                >
                  {difficulty.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300">Status</h4>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => {
              const Icon = status.icon;
              const isSelected = filters.status === status.value;
              
              return (
                <Badge
                  key={status.value}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105",
                    isSelected 
                      ? "bg-purple-600 text-white border-purple-500" 
                      : "border-gray-600 text-gray-300 hover:border-purple-500/50"
                  )}
                  onClick={() => updateFilters('status', 
                    isSelected ? undefined : status.value
                  )}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full border-gray-600 text-gray-300 hover:border-red-500/50 hover:text-red-400"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        )}

        {/* Resumo dos filtros ativos */}
        {hasActiveFilters && (
          <div className="text-xs text-gray-400 font-mono">
            {Object.entries(filters).filter(([_, value]) => 
              value !== undefined && value !== '' && 
              (Array.isArray(value) ? value.length > 0 : true)
            ).length} filtro(s) ativo(s)
          </div>
        )}
      </CardContent>
    </Card>
  );
}