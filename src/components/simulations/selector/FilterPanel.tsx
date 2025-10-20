import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FilterOptions {
  search: string;
  provider: string;
  difficulty: string;
  status: string;
  sortBy: string;
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  certificationCounts?: {
    total: number;
    available: number;
    completed: number;
    inProgress: number;
  };
  isMobile?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFiltersChange, 
  certificationCounts = {},
  isMobile = false 
}) => {
  const providerOptions = [
    { value: 'all', label: 'Todos os Provedores' },
    { value: 'AWS', label: 'Amazon Web Services' },
    { value: 'Azure', label: 'Microsoft Azure' },
    { value: 'CompTIA', label: 'CompTIA' },
    { value: 'Oracle', label: 'Oracle' },
    { value: 'Cisco', label: 'Cisco' },
    { value: 'ISC2', label: 'ISC²' },
    { value: 'EC-Council', label: 'EC-Council' },
    { value: 'ISACA', label: 'ISACA' }
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
    { value: 'provider-asc', label: 'Provedor: A → Z' },
    { value: 'provider-desc', label: 'Provedor: Z → A' },
    { value: 'questions-asc', label: 'Questões: Menos → Mais' },
    { value: 'questions-desc', label: 'Questões: Mais → Menos' }
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      provider: 'all',
      difficulty: 'all',
      status: 'all',
      sortBy: 'recommended'
    });
  };

  const hasActiveFilters = filters.search || 
    filters.provider !== 'all' || 
    filters.difficulty !== 'all' || 
    filters.status !== 'all' ||
    filters.sortBy !== 'recommended';

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">Buscar Certificações</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Buscar por nome, provedor ou tópico..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Provider Filter */}
          <div>
            <Label htmlFor="provider">Provedor</Label>
            <Select 
              value={filters.provider} 
              onValueChange={(value) => handleFilterChange('provider', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select 
              value={filters.difficulty} 
              onValueChange={(value) => handleFilterChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div>
            <Label htmlFor="sortBy">Ordenar por</Label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters & Clear */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros ativos</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              <X className="w-4 h-4 mr-1" />
              Limpar Filtros
            </Button>
          </div>
        )}

        {/* Certification Counts */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span>Total: {certificationCounts.total || 0} certificações</span>
            <span>Disponíveis: {certificationCounts.available || 0}</span>
            <span>Concluídas: {certificationCounts.completed || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
