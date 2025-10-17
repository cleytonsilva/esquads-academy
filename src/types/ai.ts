// Tipos para o Sistema de IA da Plataforma Esquads

// Enums para categorização
export type AIGenerationStatus = 'idle' | 'generating' | 'completed' | 'error' | 'cancelled';
export type AIContentType = 'course' | 'lesson' | 'quiz' | 'exam' | 'assignment';
export type AIQualityStatus = 'pending' | 'approved' | 'rejected' | 'needs_review';
export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type AILanguage = 'pt-BR' | 'en-US' | 'es-ES';

// Interface para parâmetros de geração de curso
export interface AICourseGenerationParams {
  topic: string;
  description?: string;
  difficulty: AIDifficulty;
  targetAudience: string;
  duration: number; // em horas
  language: AILanguage;
  includeQuizzes: boolean;
  includeFinalExam: boolean;
  moduleCount: number;
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
}

// Interface para progresso de geração
export interface AIGenerationProgress {
  id: string;
  status: AIGenerationStatus;
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number; // em segundos
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  generatedContent?: any;
}

// Interface para templates de IA
export interface AITemplate {
  id: string;
  name: string;
  description: string;
  type: AIContentType;
  prompt: string;
  variables: AITemplateVariable[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  category: string;
  tags: string[];
}

// Interface para variáveis de template
export interface AITemplateVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // para select/multiselect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Interface para métricas de qualidade
export interface AIQualityMetrics {
  id: string;
  contentId: string;
  contentType: AIContentType;
  overallScore: number; // 0-100
  metrics: {
    clarity: number;
    accuracy: number;
    engagement: number;
    pedagogicalValue: number;
    grammarScore: number;
    coherence: number;
  };
  issues: AIQualityIssue[];
  suggestions: string[];
  reviewedBy?: string;
  reviewedAt?: Date;
  status: AIQualityStatus;
  autoApproved: boolean;
}

// Interface para problemas de qualidade
export interface AIQualityIssue {
  type: 'grammar' | 'content' | 'structure' | 'accuracy' | 'engagement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string; // localização no conteúdo
  suggestion?: string;
}

// Interface para configurações de qualidade
export interface AIQualityConfig {
  id: string;
  name: string;
  minOverallScore: number;
  autoApproveThreshold: number;
  requiredMetrics: {
    clarity: number;
    accuracy: number;
    engagement: number;
    pedagogicalValue: number;
    grammarScore: number;
    coherence: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para histórico de geração
export interface AIGenerationHistory {
  id: string;
  userId: string;
  params: AICourseGenerationParams;
  progress: AIGenerationProgress;
  qualityMetrics?: AIQualityMetrics;
  finalContent?: any;
  createdAt: Date;
  templateUsed?: string;
}

// Interface para estatísticas do sistema de IA
export interface AISystemStats {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageGenerationTime: number;
  averageQualityScore: number;
  templatesCount: number;
  activeTemplates: number;
  pendingReviews: number;
  autoApprovedContent: number;
  manuallyApprovedContent: number;
  rejectedContent: number;
}

// Interface para configurações do sistema de IA
export interface AISystemConfig {
  maxConcurrentGenerations: number;
  defaultLanguage: AILanguage;
  autoApproveEnabled: boolean;
  qualityThresholds: AIQualityConfig;
  templateCategories: string[];
  supportedContentTypes: AIContentType[];
  maxGenerationTime: number; // em segundos
  retryAttempts: number;
}

// Interface para feedback do usuário sobre conteúdo gerado
export interface AIContentFeedback {
  id: string;
  contentId: string;
  userId: string;
  rating: number; // 1-5
  feedback: string;
  categories: string[]; // ex: ['helpful', 'accurate', 'engaging']
  createdAt: Date;
}

// Interface para análise de performance de templates
export interface AITemplatePerformance {
  templateId: string;
  usageCount: number;
  averageQualityScore: number;
  averageUserRating: number;
  successRate: number;
  averageGenerationTime: number;
  lastUsed: Date;
  topIssues: AIQualityIssue[];
}