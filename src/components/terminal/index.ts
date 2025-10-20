/**
 * Terminal Components
 * Componentes de terminal interativo para missões e simulações
 */

export { TerminalCore } from './TerminalCore'
export { CommandProcessor } from './CommandProcessor'
export type { CommandResult, CommandConfig } from './CommandProcessor'

// Re-export dos componentes auxiliares de terminal
export { TerminalOutput } from '../missions/terminal/TerminalOutput'
export { TerminalSuggestions } from '../missions/terminal/TerminalSuggestions'
export { TerminalCommand } from '../missions/terminal/TerminalCommand'