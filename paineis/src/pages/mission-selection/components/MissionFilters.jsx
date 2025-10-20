import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const MissionFilters = ({ 
  filters, 
  onFiltersChange, 
  missionCounts = {},
  isMobile = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const categoryOptions = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'firewall', label: 'Firewall' },
    { value: 'cloud-security', label: 'Segurança em Nuvem' },
    { value: 'forensics', label: 'Forense Digital' },
    { value: 'network-security', label: 'Segurança de Rede' },
    { value: 'incident-response', label: 'Resposta a Incidentes' },
    { value: 'penetration-testing', label: 'Teste de Penetração' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediário', label: 'Intermediário' },
    { value: 'avançado', label: 'Avançado' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'available', label: 'Disponíveis' },
    { value: 'in-progress', label: 'Em Progresso' },
    { value: 'completed', label: 'Concluídas' },
    { value: 'locked', label: 'Bloqueadas' }
  ];

  const sortOptions = [
    { value: 'recommended', label: 'Recomendado' },
    { value: 'difficulty-asc', label: 'Dificuldade: Fácil → Difícil' },
    { value: 'difficulty-desc', label: 'Dificuldade: Difícil → Fácil' },
    { value: 'xp-asc', label: 'XP: Menor → Maior' },
    { value: 'xp-desc', label: 'XP: Maior → Menor' },
    { value: 'duration-asc', label: 'Duração: Curta → Longa' },
    { value: 'duration-desc', label: 'Duração: Longa → Curta' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      difficulty: 'all',
      status: 'all',
      sortBy: 'recommended'
    });
  };

  const hasActiveFilters = filters?.search || 
    filters?.category !== 'all' || 
    filters?.difficulty !== 'all' || 
    filters?.status !== 'all' ||
    filters?.sortBy !== 'recommended';

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <Input
          type="search"
          placeholder="Buscar missões por tópico ou habilidade..."
          value={filters?.search}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="w-full"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <Select
          label="Categoria"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => handleFilterChange('category', value)}
        />

        {/* Difficulty Filter */}
        <Select
          label="Dificuldade"
          options={difficultyOptions}
          value={filters?.difficulty}
          onChange={(value) => handleFilterChange('difficulty', value)}
        />

        {/* Status Filter */}
        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        {/* Sort Filter */}
        <Select
          label="Ordenar por"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />
      </div>

      {/* Active Filters & Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Filter" size={14} />
            <span>Filtros ativos</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            iconName="X"
            iconPosition="left"
          >
            Limpar Filtros
          </Button>
        </div>
      )}

      {/* Mission Counts */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-muted-foreground">
          <span>Total: {missionCounts?.total || 0} missões</span>
          <span>Disponíveis: {missionCounts?.available || 0}</span>
          <span>Concluídas: {missionCounts?.completed || 0}</span>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="bg-card border border-border rounded-lg">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={16} />
            <span className="font-medium">Filtros</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </button>

        {/* Mobile Filter Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-border">
            <div className="pt-4">
              <FilterContent />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <FilterContent />
    </div>
  );
};

export default MissionFilters;