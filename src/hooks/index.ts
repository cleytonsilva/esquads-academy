/**
 * Hooks Index
 * Exportações centralizadas dos hooks
 */

// Existing hooks
export { useAuth } from './useAuth'
export { useGamification } from './useGamification'

// New hooks for missions, exams and simulations
export { useMissions } from './useMissions'
export { default as useExams } from './useExams'
export { useSimulations } from './useSimulations'

// Types
export type { UseExamsOptions, UseExamsReturn } from './useExams'