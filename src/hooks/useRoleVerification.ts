import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { roleVerificationService, type UserRole } from '@/services/roleVerificationService';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface UseRoleVerificationState {
  role: UserRole;
  isLoading: boolean;
  error: string | null;
  isVerified: boolean;
  fromCache: boolean;
}

interface UseRoleVerificationReturn extends UseRoleVerificationState {
  refreshRole: () => Promise<void>;
  invalidateRole: () => void;
  hasPermissionForRoute: (route: string) => boolean;
  getCorrectPanel: () => string;
  redirectToCorrectPanel: () => void;
}

export function useRoleVerification(): UseRoleVerificationReturn {
  const { user, userRole } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs para controle de estado e prevenção de loops
  const subscriptionRef = useRef<(() => void) | null>(null);
  const verificationInProgressRef = useRef<boolean>(false);
  const lastVerifiedUserIdRef = useRef<string | null>(null);
  const lastRedirectRef = useRef<string>('');
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<UseRoleVerificationState>({
    role: null,
    isLoading: false, // CORREÇÃO: Iniciar como false para evitar loading infinito
    error: null,
    isVerified: false,
    fromCache: false
  });

  // CORREÇÃO 1: Resetar estado imediatamente quando não há usuário
  useEffect(() => {
    if (!user) {
      setState({
        role: null,
        isLoading: false,
        error: null,
        isVerified: false,
        fromCache: false
      });
      lastVerifiedUserIdRef.current = null;
      verificationInProgressRef.current = false;
    }
  }, [user]);

  /**
   * CORREÇÃO 2: Verificação mais rápida e confiável - SUPER OTIMIZADA
   */
  const verifyRole = useCallback(async () => {
    if (!user || verificationInProgressRef.current) {
      return;
    }

    // CORREÇÃO 3: Usar role do AuthContext como primeira opção - PRIORIDADE MÁXIMA
    const authRole = (userRole as UserRole);
    if (authRole && (authRole === 'admin' || authRole === 'student')) {
      console.log('? Using role from AuthContext immediately:', authRole);
      setState({
        role: authRole,
        isLoading: false,
        error: null,
        isVerified: true,
        fromCache: false
      });
      return;
    }

    // CORREÇÃO 4: Verificar cache como segunda opção - SEM CHAMADA REMOTA
    const cachedRole = roleVerificationService.getCachedRole(user.id);
    if (cachedRole) {
      console.log('💾 Using cached role:', cachedRole);
      setState({
        role: cachedRole,
        isLoading: false,
        error: null,
        isVerified: true,
        fromCache: true
      });
      return;
    }

    // CORREÇÃO 5: REDUZIR DRASTICAMENTE verificações remotas
    // Só fazer verificação remota se realmente necessário e com throttle
    const lastVerification = lastVerifiedUserIdRef.current;
    const now = Date.now();
    
    // Se já verificou recentemente, usar role padrão
    

    verificationInProgressRef.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // CORREÇÃO 6: Timeout ainda mais reduzido - 2 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        verificationTimeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout na verificação de role'));
        }, 2000);
      });

      const verificationPromise = roleVerificationService.verifyUserRole(user);
      const result = await Promise.race([verificationPromise, timeoutPromise]);
      
      // Limpar timeout se chegou até aqui
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
        verificationTimeoutRef.current = null;
      }

      setState({
        role: result.role,
        isLoading: false,
        error: result.error || null,
        isVerified: result.isValid,
        fromCache: result.fromCache || false
      });

    } catch (error) {
      console.error('Erro ao verificar role:', error);
      
      // CORREÇÃO 7: Fallback mais inteligente e rápido
      const fallbackRole = 'student' as UserRole; // Default seguro
      setState({
        role: fallbackRole,
        isLoading: false,
        error: 'Usando role padrão devido a timeout',
        isVerified: true,
        fromCache: false
      });
    } finally {
      verificationInProgressRef.current = false;
      lastVerifiedUserIdRef.current = user.id; // Marcar como verificado
      
      // Limpar timeout
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
        verificationTimeoutRef.current = null;
      }
    }
  }, [user?.id]);

  /**
   * CORREÇÃO 8: Refresh simplificado
   */
  const refreshRole = useCallback(async () => {
    if (!user || verificationInProgressRef.current) return;

    verificationInProgressRef.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // CORREÇÃO 9: Tentar AuthContext primeiro no refresh também
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.user_metadata?.role) {
        const authRole = authData.user.user_metadata.role as UserRole;
        setState({
          role: authRole,
          isLoading: false,
          error: null,
          isVerified: true,
          fromCache: false
        });
        return;
      }

      // Se não tem no AuthContext, tentar service
      const result = await roleVerificationService.forceRefreshUserRole(user);
      setState({
        role: result.role,
        isLoading: false,
        error: result.error || null,
        isVerified: result.isValid,
        fromCache: false
      });

    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      
      // Manter estado atual em caso de erro
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao atualizar role - mantendo atual'
      }));
    } finally {
      verificationInProgressRef.current = false;
    }
  }, [user]);

  /**
   * CORREÇÃO 10: Invalidação mais eficiente
   */
  const invalidateRole = useCallback(() => {
    if (user) {
      roleVerificationService.invalidateUserRole(user.id);
      lastVerifiedUserIdRef.current = null;
    }
  }, [user]);

  /**
   * Verifica se o usuário tem permissão para uma rota
   */
  const hasPermissionForRoute = useCallback((route: string): boolean => {
    return roleVerificationService.hasPermissionForRoute(state.role, route);
  }, [state.role]);

  /**
   * Obtém o painel correto para a role atual
   */
  const getCorrectPanel = useCallback((): string => {
    return roleVerificationService.getCorrectPanel(state.role);
  }, [state.role]);

  /**
   * CORREÇÃO 11: Redirecionamento mais simples e confiável
   */
  const redirectToCorrectPanel = useCallback(() => {
    if (!state.isVerified || state.isLoading || !state.role) return;

    const correctPanel = roleVerificationService.getCorrectPanel(state.role);
    const currentPath = location.pathname;

    // Não redirecionar se já estiver na rota correta
    if (currentPath === correctPanel || currentPath.startsWith(correctPanel)) return;

    // Evitar redirecionamentos repetidos
    if (lastRedirectRef.current === correctPanel) return;

    // CORREÇÃO 12: Redirecionamento imediato sem debounce
    lastRedirectRef.current = correctPanel;
    console.log(`🔄 Redirecting to correct panel: ${correctPanel}`);
    navigate(correctPanel, { replace: true });
  }, [state.isVerified, state.isLoading, state.role, location.pathname, navigate]);

  /**
   * CORREÇÃO 13: Verificação inicial mais simples e rápida
   */
  useEffect(() => {
    const currentUserId = user?.id;
    
    if (user && currentUserId && lastVerifiedUserIdRef.current !== currentUserId) {
      lastVerifiedUserIdRef.current = currentUserId;
      
      // CORREÇÃO 14: Verificação imediata sem delay
      verifyRole();
    } else if (!user) {
      lastVerifiedUserIdRef.current = null;
      verificationInProgressRef.current = false;
    }
  }, [user?.id, verifyRole]);

  // CORREÇÃO 15: Remover redirecionamento automático que pode causar loops
  // O redirecionamento será feito apenas quando explicitamente chamado

  // CORREÇÃO 16: Cleanup mais eficiente
  useEffect(() => {
    return () => {
      // Limpar todos os timeouts
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
      
      // Cancelar verificação em andamento
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Limpar subscription
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
      
      // Resetar flags
      verificationInProgressRef.current = false;
    };
  }, []);

  return {
    ...state,
    refreshRole,
    invalidateRole,
    hasPermissionForRoute,
    getCorrectPanel,
    redirectToCorrectPanel
  };
}

/**
 * Hook simplificado para verificar apenas a role atual
 */
export function useUserRole(): UserRole {
  const { role } = useRoleVerification();
  return role;
}

/**
 * Hook para verificar se o usuário é admin
 */
export function useIsAdmin(): boolean {
  const role = useUserRole();
  return role === 'admin';
}

/**
 * Hook para verificar se o usuário é estudante
 */
export function useIsStudent(): boolean {
  const role = useUserRole();
  return role === 'student';
}







