/**
 * Componente de Output do Terminal
 * Baseado em paineis/src/pages/mission-gameplay/components/SimulatorTerminal.jsx
 */

import React from 'react'
import { TerminalOutputLine } from '@/types/gamification'

interface TerminalOutputProps {
  output: TerminalOutputLine[]
  className?: string
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, className = '' }) => {
  const getOutputColor = (type: string): string => {
    switch (type) {
      case 'system':
        return 'text-cyan-400'
      case 'command':
        return 'text-white'
      case 'output':
        return 'text-gray-300'
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'prompt':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-gray-300'
    }
  }

  const formatContent = (content: string, type: string): string => {
    if (type === 'command' && content.includes('$')) {
      return content
    }
    return content
  }

  return (
    <div className={`font-mono text-sm ${className}`}>
      {output.map((line) => (
        <div key={line.id} className="mb-1">
          <div className={getOutputColor(line.type)}>
            {line.type === 'prompt' ? (
              <span className="inline">{formatContent(line.content, line.type)}</span>
            ) : (
              <div className="whitespace-pre-line">{formatContent(line.content, line.type)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
