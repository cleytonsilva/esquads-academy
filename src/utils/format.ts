// Esquads Academy - Utilitários de formatação

/**
 * Formatar tempo em segundos para formato legível
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

/**
 * Formatar duração em minutos para formato legível
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Formatar pontos com separadores de milhares
 */
export const formatPoints = (points: number): string => {
  return new Intl.NumberFormat('pt-BR').format(points);
};

/**
 * Formatar valor monetário em reais
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formatar porcentagem
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatar data para formato brasileiro
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Formatar data e hora para formato brasileiro
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Formatar data relativa (ex: "há 2 dias")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  }
  
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  }
  
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `há ${months} mês${months > 1 ? 'es' : ''}`;
  }
  
  const years = Math.floor(diffInSeconds / 31536000);
  return `há ${years} ano${years > 1 ? 's' : ''}`;
};

/**
 * Truncar texto com reticências
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalizar primeira letra
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatar nome para exibição
 */
export const formatName = (fullName: string): string => {
  return fullName
    .split(' ')
    .map(name => capitalize(name))
    .join(' ');
};

/**
 * Obter iniciais do nome
 */
export const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Formatar nível de dificuldade
 */
export const formatDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): string => {
  const difficultyMap = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado'
  };
  
  return difficultyMap[difficulty] || difficulty;
};

/**
 * Formatar role do usuário
 */
export const formatUserRole = (role: 'admin' | 'student'): string => {
  const roleMap = {
    admin: 'Administrador',
    student: 'Estudante'
  } as const;
  
  return roleMap[role] || role;
};

/**
 * Gerar cor baseada em string (para avatars, badges, etc.)
 */
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Validar email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Gerar slug a partir de texto
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
};
