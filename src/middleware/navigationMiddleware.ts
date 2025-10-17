// Esquads Academy - Middleware de Navegação
// Sistema de verificação de permissões para interceptar navegações

import { NavigateFunction } from 'react-router-dom';
import { roleVerificationService } from '@/services/roleVerificationService';
import { ROUTES } from '@/utils/constants';
import type { UserRole } from '@/types/database';

/**
 * Interface para configuração do middleware de navegação
 */
interface NavigationMiddlewareConfig {
  navigate: NavigateFunction;
  currentPath: string;
  userId?: string;
  isAuthenticated: boolean;
}

/**
 * Interface para resultado da verificação de navegação
 */
interface NavigationVerificationResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: string;
}

/**
 * OTIMIZAÇÃO: Cache de rotas públicas para evitar verificações repetitivas
 */
const PUBLIC_ROUTES = new Set([
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  '/reset-password',
  '/certificate/verify'
]);

/**
 * OTIMIZAÇÃO: Cache de rotas compartilhadas
 */
const SHARED_ROUTES = new Set([
  '/certificate/verify',
  '/profile',
  '/settings'
]);

/**
 * OTIMIZAÇÃO: Cache de mapeamento de rotas por role
 */
const ROLE_ROUTES = {
  admin: new Set([
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.ADMIN_COURSES,
    ROUTES.ADMIN_BADGES,
    ROUTES.ADMIN_MISSIONS,
    '/admin'
  ]),
  student: new Set([
    ROUTES.STUDENT_DASHBOARD,
    ROUTES.STUDENT_COURSES,
    ROUTES.STUDENT_COURSE_DETAIL,
    ROUTES.STUDENT_GAMIFICATION,
    ROUTES.STUDENT_MISSIONS,
    ROUTES.STUDENT_PROFILE,
    ROUTES.STUDENT_ACHIEVEMENTS,
    ROUTES.STUDENT_LEADERBOARD,
    ROUTES.STUDENT_SOCIAL,
    '/student'
  ])
} as const;

/**
 * Classe para gerenciar middleware de navegação
 */
export class NavigationMiddleware {
  private static instance: NavigationMiddleware;
  private isVerifying = false;
  private verificationQueue: Array<() => void> = [];
  
  // OTIMIZAÇÃO: Cache de verificações recentes para evitar re-verificações
  private recentVerifications = new Map<string, { result: NavigationVerificationResult; timestamp: number }>();
  private readonly CACHE_DURATION = 5000; // 5 segundos
  
  // OTIMIZAÇÃO: Controle de throttling para evitar verificações excessivas
  private lastVerificationTime = 0;
  private readonly THROTTLE_DELAY = 100; // 100ms

  private constructor() {}

  /**
   * Singleton pattern para garantir uma única instância
   */
  public static getInstance(): NavigationMiddleware {
    if (!NavigationMiddleware.instance) {
      NavigationMiddleware.instance = new NavigationMiddleware();
    }
    return NavigationMiddleware.instance;
  }

  /**
   * OTIMIZAÇÃO: Verificação rápida se a rota é pública
   */
  private isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.has(path) || path.startsWith('/certificate/verify/');
  }

  /**
   * OTIMIZAÇÃO: Verificação rápida se a rota é compartilhada
   */
  private isSharedRoute(path: string): boolean {
    return SHARED_ROUTES.has(path) || Array.from(SHARED_ROUTES).some(route => path.startsWith(route));
  }

  /**
   * OTIMIZAÇÃO: Verificação rápida de permissão sem consulta ao banco
   */
  private hasQuickPermission(path: string, role: UserRole): boolean {
    // Rotas compartilhadas são sempre permitidas
    if (this.isSharedRoute(path)) {
      return true;
    }

    // Verificar se a role tem acesso à rota
    const allowedRoutes = ROLE_ROUTES[role];
    if (!allowedRoutes) return false;

    return allowedRoutes.has(path) || Array.from(allowedRoutes).some(route => path.startsWith(route));
  }

  /**
   * OTIMIZAÇÃO: Cache de verificações para evitar re-verificações
   */
  private getCachedVerification(cacheKey: string): NavigationVerificationResult | null {
    const cached = this.recentVerifications.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.result;
    }
    return null;
  }

  /**
   * OTIMIZAÇÃO: Armazenar resultado no cache
   */
  private setCachedVerification(cacheKey: string, result: NavigationVerificationResult): void {
    this.recentVerifications.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    // Limpar cache antigo
    if (this.recentVerifications.size > 50) {
      const now = Date.now();
      for (const [key, value] of this.recentVerifications.entries()) {
        if (now - value.timestamp > this.CACHE_DURATION) {
          this.recentVerifications.delete(key);
        }
      }
    }
  }

  /**
   * OTIMIZAÇÃO: Intercepta e verifica navegações com cache e throttling
   */
  public async interceptNavigation(config: NavigationMiddlewareConfig): Promise<NavigationVerificationResult> {
    const { currentPath, userId, isAuthenticated } = config;

    // OTIMIZAÇÃO 1: Throttling para evitar verificações excessivas
    const now = Date.now();
    if (now - this.lastVerificationTime < this.THROTTLE_DELAY) {
      return { allowed: true }; // Permitir durante throttling
    }
    this.lastVerificationTime = now;

    // OTIMIZAÇÃO 2: Verificação rápida de rotas públicas
    if (this.isPublicRoute(currentPath)) {
      return { allowed: true };
    }

    // OTIMIZAÇÃO 3: Cache de verificações recentes
    const cacheKey = `${userId || 'anonymous'}-${currentPath}-${isAuthenticated}`;
    const cachedResult = this.getCachedVerification(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      let result: NavigationVerificationResult;

      // OTIMIZAÇÃO 4: Verificação rápida para usuários não autenticados
      if (!isAuthenticated) {
        result = this.handleUnauthenticatedNavigation(currentPath);
        this.setCachedVerification(cacheKey, result);
        return result;
      }

      // OTIMIZAÇÃO 5: Verificação rápida para usuários sem ID
      if (!userId) {
        if (this.isSharedRoute(currentPath)) {
          result = { allowed: true };
        } else {
          result = {
            allowed: false,
            redirectTo: ROUTES.LOGIN,
            reason: 'User ID not found'
          };
        }
        this.setCachedVerification(cacheKey, result);
        return result;
      }

      // OTIMIZAÇÃO 6: Usar role em cache se disponível para verificação rápida
      const cachedRole = roleVerificationService.getCachedRole(userId);
      if (cachedRole) {
        const hasPermission = this.hasQuickPermission(currentPath, cachedRole);
        if (hasPermission) {
          result = { allowed: true };
          this.setCachedVerification(cacheKey, result);
          return result;
        } else {
          // Se não tem permissão, redirecionar para painel correto
          result = {
            allowed: false,
            redirectTo: roleVerificationService.getCorrectPanel(cachedRole),
            reason: `Access denied. Redirecting to ${cachedRole} panel`
          };
          this.setCachedVerification(cacheKey, result);
          return result;
        }
      }

      // OTIMIZAÇÃO 7: Se não há role em cache, permitir navegação (evita bounce)
      // A verificação de role será feita pelo useRoleVerification
      result = { allowed: true };
      this.setCachedVerification(cacheKey, result);
      return result;

    } catch (error) {
      console.warn('Navigation middleware error:', error);
      
      // OTIMIZAÇÃO 8: Fallback mais inteligente em caso de erro
      const cachedRole = roleVerificationService.getCachedRole(userId || '');
      if (cachedRole && this.hasQuickPermission(currentPath, cachedRole)) {
        return { allowed: true };
      }

      // Se não há cache ou permissão, redirecionar para login
      const result = {
        allowed: false,
        redirectTo: ROUTES.LOGIN,
        reason: 'Navigation verification failed'
      };
      this.setCachedVerification(cacheKey, result);
      return result;
    }
  }

  /**
   * OTIMIZAÇÃO: Verificação de role simplificada e com timeout
   */
  private async verifyUserRole(userId: string): Promise<UserRole | null> {
    // OTIMIZAÇÃO 9: Verificar cache primeiro
    const cachedRole = roleVerificationService.getCachedRole(userId);
    if (cachedRole) {
      return cachedRole;
    }

    // Se já está verificando, aguardar na fila com timeout
    if (this.isVerifying) {
      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve(null); // Timeout após 3 segundos
        }, 3000);

        this.verificationQueue.push(() => {
          clearTimeout(timeoutId);
          resolve(this.verifyUserRole(userId));
        });
      });
    }

    this.isVerifying = true;

    try {
      // OTIMIZAÇÃO 10: Timeout reduzido para verificação
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 4000); // 4 segundos
      });

      const mockUser = { id: userId };
      const verificationPromise = roleVerificationService.verifyUserRole(mockUser as any);
      
      const result = await Promise.race([verificationPromise, timeoutPromise]);
      return result?.role || null;

    } catch (error) {
      console.warn('Role verification error in middleware:', error);
      return null;
    } finally {
      this.isVerifying = false;
      
      // Processar fila de verificações
      const nextVerification = this.verificationQueue.shift();
      if (nextVerification) {
        setTimeout(nextVerification, 0);
      }
    }
  }

  /**
   * OTIMIZAÇÃO: Verificação otimizada para usuários não autenticados
   */
  private handleUnauthenticatedNavigation(currentPath: string): NavigationVerificationResult {
    if (this.isPublicRoute(currentPath)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      redirectTo: ROUTES.LOGIN,
      reason: 'Authentication required'
    };
  }

  /**
   * OTIMIZAÇÃO: Verificação de permissões otimizada
   */
  private verifyRoutePermissions(currentPath: string, userRole: UserRole): NavigationVerificationResult {
    // Verificar se é rota compartilhada
    if (this.isSharedRoute(currentPath)) {
      return { allowed: true };
    }

    // Verificar se a rota é permitida para a role do usuário
    if (this.hasQuickPermission(currentPath, userRole)) {
      return { allowed: true };
    }

    // Se não tem acesso, redirecionar para o painel correto
    const correctPanel = roleVerificationService.getCorrectPanel(userRole);
    
    return {
      allowed: false,
      redirectTo: correctPanel,
      reason: `Access denied. Redirecting to ${userRole} panel`
    };
  }

  /**
   * OTIMIZAÇÃO: Redirecionamento automático otimizado
   */
  public async executeAutoRedirect(config: NavigationMiddlewareConfig): Promise<void> {
    const { navigate, userId, isAuthenticated } = config;

    if (!isAuthenticated || !userId) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    try {
      // OTIMIZAÇÃO 11: Usar role em cache se disponível
      let userRole = roleVerificationService.getCachedRole(userId);
      
      if (!userRole) {
        userRole = await this.verifyUserRole(userId);
      }

      if (userRole) {
        const correctPanel = roleVerificationService.getCorrectPanel(userRole);
        navigate(correctPanel, { replace: true });
      } else {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    } catch (error) {
      console.warn('Auto redirect error:', error);
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }

  /**
   * OTIMIZAÇÃO: Invalidação e refresh otimizados
   */
  public async invalidateAndRefresh(userId: string): Promise<void> {
    // Limpar cache de verificações
    this.recentVerifications.clear();
    
    // Invalidar role no serviço
    roleVerificationService.invalidateUserRole(userId);
    
    // Forçar nova verificação
    await this.verifyUserRole(userId);
  }

  /**
   * OTIMIZAÇÃO: Verificação rápida de permissão para rota
   */
  public hasPermissionForRoute(userRole: UserRole | null, route: string): boolean {
    if (!userRole) return this.isPublicRoute(route);
    return this.hasQuickPermission(route, userRole);
  }

  /**
   * OTIMIZAÇÃO: Limpar cache periodicamente
   */
  public clearCache(): void {
    this.recentVerifications.clear();
  }
}

/**
 * Instância singleton do middleware de navegação
 */
export const navigationMiddleware = NavigationMiddleware.getInstance();

/**
 * Hook para usar o middleware de navegação
 */
export const useNavigationMiddleware = () => {
  return {
    interceptNavigation: navigationMiddleware.interceptNavigation.bind(navigationMiddleware),
    executeAutoRedirect: navigationMiddleware.executeAutoRedirect.bind(navigationMiddleware),
    invalidateAndRefresh: navigationMiddleware.invalidateAndRefresh.bind(navigationMiddleware),
    hasPermissionForRoute: navigationMiddleware.hasPermissionForRoute.bind(navigationMiddleware),
    clearCache: navigationMiddleware.clearCache.bind(navigationMiddleware)
  };
};
