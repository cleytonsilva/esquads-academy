/**
 * Componente de Sugestões do Terminal
 * Baseado em paineis/src/pages/mission-gameplay/components/SimulatorTerminal.jsx
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface TerminalSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  className?: string
}

export const TerminalSuggestions: React.FC<TerminalSuggestionsProps> = ({
  suggestions,
  onSelect,
  className = '',
}) => {
  if (suggestions.length === 0) return null

  return (
    <div className={`bg-gray-800 border-t border-gray-600 max-h-32 overflow-y-auto ${className}`}>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="w-full text-left px-4 py-2 hover:bg-gray-700 text-green-400 text-sm flex items-center justify-between group transition-colors"
        >
          <span>{suggestion}</span>
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  )
}
