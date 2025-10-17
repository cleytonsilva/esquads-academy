// Esquads Academy - Utilitários de validação

/**
 * Validar email
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email é obrigatório';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }
  
  return null;
};

/**
 * Validar senha
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Senha é obrigatória';
  }
  
  if (password.length < 6) {
    return 'Senha deve ter pelo menos 6 caracteres';
  }
  
  if (password.length > 128) {
    return 'Senha deve ter no máximo 128 caracteres';
  }
  
  // Verificar se contém pelo menos uma letra e um número
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return 'Senha deve conter pelo menos uma letra e um número';
  }
  
  return null;
};

/**
 * Validar confirmação de senha
 */
export const validatePasswordConfirmation = (
  password: string, 
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'Confirmação de senha é obrigatória';
  }
  
  if (password !== confirmPassword) {
    return 'Senhas não coincidem';
  }
  
  return null;
};

/**
 * Validar nome completo
 */
export const validateFullName = (fullName: string): string | null => {
  if (!fullName) {
    return 'Nome completo é obrigatório';
  }
  
  if (fullName.trim().length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres';
  }
  
  if (fullName.trim().length > 100) {
    return 'Nome deve ter no máximo 100 caracteres';
  }
  
  // Verificar se contém pelo menos um espaço (nome e sobrenome)
  if (!fullName.trim().includes(' ')) {
    return 'Digite seu nome completo';
  }
  
  // Verificar caracteres válidos (letras, espaços, acentos, hífens)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(fullName)) {
    return 'Nome contém caracteres inválidos';
  }
  
  return null;
};

/**
 * Validar título de curso
 */
export const validateCourseTitle = (title: string): string | null => {
  if (!title) {
    return 'Título é obrigatório';
  }
  
  if (title.trim().length < 3) {
    return 'Título deve ter pelo menos 3 caracteres';
  }
  
  if (title.trim().length > 200) {
    return 'Título deve ter no máximo 200 caracteres';
  }
  
  return null;
};

/**
 * Validar descrição
 */
export const validateDescription = (description: string, required: boolean = true): string | null => {
  if (required && !description) {
    return 'Descrição é obrigatória';
  }
  
  if (description && description.trim().length > 1000) {
    return 'Descrição deve ter no máximo 1000 caracteres';
  }
  
  return null;
};

/**
 * Validar URL
 */
export const validateUrl = (url: string, required: boolean = false): string | null => {
  if (!url && !required) {
    return null;
  }
  
  if (!url && required) {
    return 'URL é obrigatória';
  }
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL inválida';
  }
};

/**
 * Validar duração em minutos
 */
export const validateDuration = (duration: number): string | null => {
  if (!duration || duration <= 0) {
    return 'Duração deve ser maior que zero';
  }
  
  if (duration > 10080) { // 7 dias em minutos
    return 'Duração não pode exceder 7 dias';
  }
  
  return null;
};

/**
 * Validar pontos
 */
export const validatePoints = (points: number): string | null => {
  if (points < 0) {
    return 'Pontos não podem ser negativos';
  }
  
  if (points > 10000) {
    return 'Pontos não podem exceder 10.000';
  }
  
  return null;
};

/**
 * Validar arquivo de imagem
 */
export const validateImageFile = (file: File): string | null => {
  // Verificar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Formato de arquivo não suportado. Use JPEG, PNG ou WebP';
  }
  
  // Verificar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB em bytes
  if (file.size > maxSize) {
    return 'Arquivo muito grande. Máximo 5MB';
  }
  
  return null;
};

/**
 * Validar arquivo de vídeo
 */
export const validateVideoFile = (file: File): string | null => {
  // Verificar tipo de arquivo
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (!allowedTypes.includes(file.type)) {
    return 'Formato de vídeo não suportado. Use MP4, WebM ou OGG';
  }
  
  // Verificar tamanho (máximo 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB em bytes
  if (file.size > maxSize) {
    return 'Arquivo muito grande. Máximo 100MB';
  }
  
  return null;
};

/**
 * Validar múltiplos campos de uma vez
 */
export const validateForm = (validations: Array<string | null>): { isValid: boolean; errors: string[] } => {
  const errors = validations
    .filter(validation => validation !== null)
    .filter(Boolean) as string[];
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizar entrada de texto
 */
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Substituir múltiplos espaços por um único espaço
    .replace(/[<>]/g, ''); // Remover caracteres potencialmente perigosos
};

/**
 * Validar role de usuário
 */
export const validateUserRole = (role: string): string | null => {
  const validRoles = ['admin', 'student'];
  
  if (!validRoles.includes(role)) {
    return 'Role de usuário inválida';
  }
  
  return null;
};

/**
 * Validar nível de dificuldade
 */
export const validateDifficultyLevel = (level: string): string | null => {
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  
  if (!validLevels.includes(level)) {
    return 'Nível de dificuldade inválido';
  }
  
  return null;
};
