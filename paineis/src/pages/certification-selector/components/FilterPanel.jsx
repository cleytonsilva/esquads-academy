import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const providerOptions = [
    { value: 'all', label: 'Todos os Provedores' },
    { value: 'comptia', label: 'CompTIA' },
    { value: 'cisco', label: 'Cisco' },
    { value: 'ec-council', label: 'EC-Council' },
    { value: 'isc2', label: '(ISC)²' },
    { value: 'sans', label: 'SANS' },
    { value: 'microsoft', label: 'Microsoft' },
    { value: 'amazon', label: 'Amazon Web Services' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'Todos os Níveis' },
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' }
  ];

  const careerPathOptions = [
    { value: 'all', label: 'Todas as Carreiras' },
    { value: 'security-analyst', label: 'Analista de Segurança' },
    { value: 'penetration-tester', label: 'Pentester' },
    { value: 'security-architect', label: 'Arquiteto de Segurança' },
    { value: 'incident-responder', label: 'Resposta a Incidentes' },
    { value: 'compliance', label: 'Compliance e Auditoria' },
    { value: 'cloud-security', label: 'Segurança em Nuvem' }
  ];

  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleCheckboxChange = (field, checked) => {
    onFiltersChange({
      ...filters,
      [field]: checked
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      provider: 'all',
      difficulty: 'all',
      careerPath: 'all',
      showPremiumOnly: false,
      showFreeOnly: false,
      hasPrerequisites: false
    });
  };

  const activeFiltersCount = Object.values(filters)?.filter(value => 
    value !== 'all' && value !== false && value !== ''
  )?.length;

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <div>
            <h3 className="font-medium text-foreground">Filtros</h3>
            {activeFiltersCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e?.stopPropagation();
                clearFilters();
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar
            </button>
          )}
          <Icon 
            name={isCollapsed ? "ChevronDown" : "ChevronUp"} 
            size={16} 
            className="text-muted-foreground" 
          />
        </div>
      </div>
      {/* Filter Content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">
          {/* Provider Filter */}
          <Select
            label="Provedor"
            options={providerOptions}
            value={filters?.provider}
            onChange={(value) => handleFilterChange('provider', value)}
          />

          {/* Difficulty Filter */}
          <Select
            label="Nível de Dificuldade"
            options={difficultyOptions}
            value={filters?.difficulty}
            onChange={(value) => handleFilterChange('difficulty', value)}
          />

          {/* Career Path Filter */}
          <Select
            label="Carreira"
            options={careerPathOptions}
            value={filters?.careerPath}
            onChange={(value) => handleFilterChange('careerPath', value)}
            searchable
          />

          {/* Checkbox Filters */}
          <div className="space-y-3 pt-2">
            <div className="text-sm font-medium text-foreground">Opções Adicionais</div>
            
            <Checkbox
              label="Apenas Premium"
              description="Mostrar somente certificações premium"
              checked={filters?.showPremiumOnly}
              onChange={(e) => handleCheckboxChange('showPremiumOnly', e?.target?.checked)}
            />

            <Checkbox
              label="Apenas Gratuitas"
              description="Mostrar somente certificações gratuitas"
              checked={filters?.showFreeOnly}
              onChange={(e) => handleCheckboxChange('showFreeOnly', e?.target?.checked)}
            />

            <Checkbox
              label="Com Pré-requisitos"
              description="Mostrar certificações que exigem experiência prévia"
              checked={filters?.hasPrerequisites}
              onChange={(e) => handleCheckboxChange('hasPrerequisites', e?.target?.checked)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;