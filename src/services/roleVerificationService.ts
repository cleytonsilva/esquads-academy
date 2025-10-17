import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import type { User } from '@supabase/supabase-js';
import { ROUTES } from '@/utils/constants';

export type UserRole = 'admin' | 'student' | null;

// Validação simples de UUID
function isValidUUID(uuid: string | undefined | null): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validação de usuário
function validateUser(user: User | null | undefined): { isValid: boolean; userId?: string; error?: string } {
  if (!user) {
    return { isValid: false, error: 'Usuário não fornecido' };
  }
  if (!user.id || typeof user.id !== 'string') {
    return { isValid: false, error: 'ID do usuário inválido' };
  }
  if (!isValidUUID(user.id)) {
    return { isValid: false, error: 'UUID do usuário inválido' };
  }
  return { isValid: true, userId: user.id };
}

interface RoleCache {
  [userId: string]: {
    role: UserRole;
    timestamp: number;
    isValid: boolean;
  };
}

interface RoleVerificationResult {
  role: UserRole;
  isValid: boolean;
  fromCache: boolean;
  error?: string;
}

// CORREÇÃO: Configurações de throttle e cache otimizadas
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const VERIFICATION_THROTTLE = 2000; // 2 segundos entre verificações (aumentado)
const MAX_CONCURRENT_VERIFICATIONS = 2; // Reduzido para 2

class RoleVerificationService {
  private cache: RoleCache = {};
  private pendingVerifications = new Map<string, Promise<RoleVerificationResult>>();
  private lastVerificationTime = new Map<string, number>();
  private verificationQueue: Array<{ userId: string; resolve: Function; reject: Function }> = [];
  private activeVerifications = 0;

  // CORREÇÃO: Método para verificar se pode fazer nova verificação
  private canVerify(userId: string): boolean {
    const lastTime = this.lastVerificationTime.get(userId) || 0;
    const now = Date.now();
    
    // Throttle por usuário mais rigoroso
    if (now - lastTime < VERIFICATION_THROTTLE) {
      console.log(`🚫 Verification throttled for user ${userId} (${now - lastTime}ms ago)`);
      return false;
    }

    // Limite de verificações simultâneas
    if (this.activeVerifications >= MAX_CONCURRENT_VERIFICATIONS) {
      console.log(`🚫 Max concurrent verifications reached (${this.activeVerifications})`);
      return false;
    }

    return true;
  }

  // CORREÇÃO: Método para processar fila de verificações
  private processQueue(): void {
    if (this.verificationQueue.length === 0 || this.activeVerifications >= MAX_CONCURRENT_VERIFICATIONS) {
      return;
    }

    const next = this.verificationQueue.shift();
    if (next) {
      this.performVerificationInternal(next.userId)
        .then(next.resolve)
        .catch(next.reject)
        .finally(() => {
          this.activeVerifications--;
          this.processQueue(); // Processar próximo da fila
        });
    }
  }

  // CORREÇÃO: Cache com TTL melhorado
  /**
   * Verifica se a role está em cache e ainda é válida
   */
  getCachedRole(userId: string): UserRole | null {
    if (!userId) return null;
    
    const cached = this.cache[userId];
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > CACHE_DURATION;
    
    if (isExpired) {
      console.log(`💾 Cache expired for user ${userId}`);
      delete this.cache[userId];
      return null;
    }

    console.log(`💾 Using cached role: ${cached.role}`);
    return cached.role;
  }

  // CORREÇÃO: Método para definir cache
  setCachedRole(userId: string, role: UserRole): void {
    if (!userId || !role) return;
    
    this.cache[userId] = {
      role,
      timestamp: Date.now(),
      isValid: true
    };
    console.log(`💾 Cached role ${role} for user ${userId}`);
  }

  // CORREÇÃO: Verificação principal com controle de concorrência OTIMIZADO
  async verifyUserRole(user: any): Promise<RoleVerificationResult> {
    if (!user?.id) {
      console.log('🚫 No user ID provided');
      return {
        role: null, isValid: false, fromCache: false, error: 'No user ID provided'
      };
    }

    const userId = user.id;
    console.log(`🔐 verifyUserRole called`);

    // OTIMIZAÇÃO 1: Verificar cache primeiro - SEMPRE
    const cachedRole = this.getCachedRole(userId);
    if (cachedRole) {
      console.log(`💾 Using cached role: ${cachedRole}`);
      return {
        role: cachedRole,
        isValid: true,
        fromCache: true
      };
    }

    // OTIMIZAÇÃO 2: Verificar se já há verificação pendente
    const pendingVerification = this.pendingVerifications.get(userId);
    if (pendingVerification) {
      console.log(`⏳ Waiting for pending verification`);
      return await pendingVerification;
    }

    // OTIMIZAÇÃO 3: Verificar throttle - MAIS RIGOROSO
    if (!this.canVerify(userId)) {
      // FALLBACK: Usar role padrão quando throttled
      console.log(`🔄 Using default role due to throttle`);
      return { role: null, isValid: false, fromCache: false, error: 'Verification throttled with no cache' };
    }

    // OTIMIZAÇÃO 4: Criar promise de verificação
    const verificationPromise = this.performVerificationWithQueue(userId, user);
    this.pendingVerifications.set(userId, verificationPromise);

    try {
      const result = await verificationPromise;
      return result;
    } finally {
      this.pendingVerifications.delete(userId);
    }
  }

  // CORREÇÃO: Verificação com fila de espera
  private async performVerificationWithQueue(userId: string, user: any): Promise<RoleVerificationResult> {
    return new Promise((resolve, reject) => {
      if (this.activeVerifications < MAX_CONCURRENT_VERIFICATIONS) {
        // Executar imediatamente
        this.activeVerifications++;
        this.performVerificationInternal(userId, user)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.activeVerifications--;
            this.processQueue();
          });
      } else {
        // Adicionar à fila
        console.log(`📋 Adding user ${userId} to verification queue`);
        this.verificationQueue.push({ userId, resolve, reject });
      }
    });
  }

  // CORREÇÃO: Verificação interna otimizada
  private async performVerificationInternal(userId: string, user?: any): Promise<RoleVerificationResult> {
    this.lastVerificationTime.set(userId, Date.now());
    
    try {
      console.log(`🔍 Performing verification for user ${userId}`);

      // OTIMIZAÇÃO 1: Verificar role do objeto user primeiro
      if (user?.role && (user.role === 'admin' || user.role === 'student')) {
        const role = user.role as UserRole;
        this.setCachedRole(userId, role);
        return {
          role,
          isValid: true,
          fromCache: false
        };
      }

      // OTIMIZAÇÃO 2: Verificar no banco com timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 5000);
      });

      const queryPromise = supabaseWithRetry(() => 
        supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single()
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error(`❌ Database error for user ${userId}:`, error);
        
        // FALLBACK: Usar role padrão
        const fb = this.getFallbackRole(userId); if (fb) { this.setCachedRole(userId, fb); return { role: fb, isValid: true, fromCache: true, error: 'Database error - using fallback storage' }; } return { role: null, isValid: false, fromCache: false, error: 'Database error' };
      }

      if (data?.role) {
        const role = this.normalizeRole(data.role);
        this.setCachedRole(userId, role);
        return {
          role,
          isValid: true,
          fromCache: false
        };
      }

      // FALLBACK: Role padrão se não encontrado
      const defaultRole = 'student' as UserRole;
      this.setCachedRole(userId, defaultRole);
      return {
        role: defaultRole,
        isValid: true,
        fromCache: false,
        error: 'User not found in database'
      };

    } catch (error) {
      console.error(`❌ Verification error for user ${userId}:`, error);
      
      // return { role: null, isValid: false, fromCache: false, error: (error instanceof Error ? error.message : 'Unknown verification error') };
    }
  }

  /**
   * Normaliza a role para valores válidos
   */
  private normalizeRole(role: string | UserRole | undefined | null): UserRole {
    if (role === 'admin' || role === 'student') {
      return role;
    }
    return null;
  }

  // CORREÇÃO: Invalidação melhorada
  invalidateUserRole(userId: string): void {
    if (this.cache[userId]) {
      delete this.cache[userId];
      console.log(`🗑️ Invalidated cache for user ${userId}`);
    }
    
    // Limpar verificação pendente
    this.pendingVerifications.delete(userId);
    
    // Limpar throttle
    this.lastVerificationTime.delete(userId);
  }

  // CORREÇÃO: Invalidação completa
  invalidateAllRoles(): void {
    this.cache = {};
    this.pendingVerifications.clear();
    this.lastVerificationTime.clear();
    this.verificationQueue = [];
    this.activeVerifications = 0;
    console.log('🗑️ Invalidated all role cache');
  }

  // CORREÇÃO: Refresh forçado com controle
  async forceRefreshUserRole(user: any): Promise<RoleVerificationResult> {
    if (!user?.id) {
      return {
        role: null, isValid: false, fromCache: false, error: 'No user ID provided'
      };
    }

    // Invalidar cache e throttle para este usuário
    this.invalidateUserRole(user.id);
    
    // Forçar nova verificação
    return await this.verifyUserRole(user);
  }





  /**
   * Obtém a role de fallback do localStorage
   */
  private getFallbackRole(userId: string): UserRole {
    if (!isValidUUID(userId)) {
      return null;
    }

    try {
      const stored = localStorage.getItem(`${this.FALLBACK_ROLE_KEY}_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;
        
        // Fallback válido por 24 horas
        if (age < 24 * 60 * 60 * 1000) {
          return this.normalizeRole(parsed.role);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error reading fallback role:', error);
    }
    
    return null;
  }

  /**
   * Armazena a role de fallback no localStorage
   */
  private setFallbackRole(userId: string, role: UserRole): void {
    if (!isValidUUID(userId) || !role) {
      return;
    }

    try {
      const fallbackData = {
        role: role,
        timestamp: Date.now(),
        userId: userId
      };
      localStorage.setItem(`${this.FALLBACK_ROLE_KEY}_${userId}`, JSON.stringify(fallbackData));
    } catch (error) {
      console.warn('⚠️ Error storing fallback role:', error);
    }
  }

  /**
   * Obtém o painel correto baseado na role
   */
  getCorrectPanel(role: UserRole): string {
    switch (role) {
      case 'admin':
        return ROUTES.ADMIN_DASHBOARD;
      case 'student':
        return ROUTES.STUDENT_DASHBOARD;
      default:
        return ROUTES.LOGIN;
    }
  }

  /**
   * Verifica se o usuário tem permissão para acessar uma rota
   */
  hasPermissionForRoute(userRole: UserRole, routePath: string): boolean {
    if (!userRole) return false;

    // Rotas públicas
    const publicRoutes = [
      ROUTES.LOGIN,
      ROUTES.REGISTER,
      ROUTES.HOME,
      '/certificate-verification'
    ];

    if (publicRoutes.includes(routePath)) {
      return true;
    }

    // Rotas de admin
    if (userRole === 'admin') {
      return routePath.startsWith('/admin');
    }

    // Rotas de estudante
    if (userRole === 'student') {
      return routePath.startsWith('/student');
    }

    return false;
  }

  /**
   * Subscreve a mudanças de role em tempo real
   */
  subscribeToRoleChanges(userId: string, callback: (role: UserRole) => void): () => void {
    if (!isValidUUID(userId)) {
      return () => {};
    }

    console.log('🔔 Setting up role change subscription for user:', userId);

    const subscription = supabase
      .channel(`role_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 Role change detected:', payload);
          const newRole = this.normalizeRole(payload.new?.role);
          if (newRole) {
            this.setCachedRole(userId, newRole);
            callback(newRole);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Unsubscribing from role changes');
      subscription.unsubscribe();
    };
  }
}

export const roleVerificationService = new RoleVerificationService();











