import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleVerification } from '@/hooks/useRoleVerification';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'student')[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

export function RoleProtectedRoute({
  children,
  allowedRoles = ['admin', 'student'],
  requireAuth = true,
  fallbackPath
}: RoleProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const {
    role,
    isLoading: roleLoading,
    error: roleError,
    isVerified,
    refreshRole,
    hasPermissionForRoute,
    getCorrectPanel
  } = useRoleVerification();

  // Estado para controlar tentativas de retry
  const [isRetrying, setIsRetrying] = useState(false);

  // Detectar sessão direta do Supabase para evitar bounce quando o contexto ainda não carregou
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setHasSession(!!data?.user);
    };
    check();
    return () => { mounted = false; };
  }, [location.pathname]);

  /**
   * Função para tentar novamente a verificação de role
   */
  const handleRetry = async () => {
    if (retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await refreshRole();
    } catch (error) {
      console.error('Erro ao tentar novamente:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * Reset do contador de retry quando a verificação é bem-sucedida
   */
  useEffect(() => {
    if (isVerified && !roleError) {
      setRetryCount(0);
    }
  }, [isVerified, roleError]);

  // Mostrar loading enquanto autentica ou verifica role
  if (authLoading || roleLoading || isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {authLoading ? 'Verificando autenticação...' : 
               isRetrying ? 'Tentando novamente...' : 
               'Verificando permissões...'}
            </p>
            <p className="text-sm text-gray-500">
              Aguarde enquanto validamos seu acesso
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirecionar para login se autenticação é obrigatória e usuário não está logado
  if (requireAuth && !user && hasSession === false) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Se ainda não temos user em contexto mas já há sessão, permitir renderizar (evita bounce)
  if (requireAuth && !user && hasSession === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600">Carregando seu acesso...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver problema na verificação de role
  if (roleError && !isVerified) {
    const canRetry = retryCount < maxRetries;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="max-w-md w-full space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-4">
              <div>
                <p className="font-medium">Erro ao verificar permissões</p>
                <p className="text-sm mt-1">{roleError}</p>
              </div>
              
              {canRetry && (
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isRetrying}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                  Tentar Novamente ({retryCount}/{maxRetries})
                </Button>
              )}
              
              {!canRetry && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    Máximo de tentativas excedido. Redirecionando...
                  </p>
                  <Navigate to="/login" replace />
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Verificar se o usuário tem permissão para a rota atual
  if (isVerified && role) {
    const hasPermission = allowedRoles.includes(role) && 
                         hasPermissionForRoute(location.pathname);

    if (!hasPermission) {
      // Redirecionar para o painel correto baseado na role
      const correctPanel = getCorrectPanel();
      
      // Se já está no painel correto mas não tem permissão, mostrar erro
      if (location.pathname === correctPanel) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
            <div className="max-w-md w-full">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Acesso Negado</p>
                  <p className="text-sm mt-1">
                    Você não tem permissão para acessar esta página.
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Role atual: {role}
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );
      }

      // Redirecionar para o painel correto
      return (
        <Navigate 
          to={fallbackPath || correctPanel} 
          replace 
        />
      );
    }
  }

  // Se chegou até aqui, o usuário tem permissão
  return <>{children}</>;
}

/**
 * Componente para proteger rotas administrativas
 */
export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={['admin']}>
      {children}
    </RoleProtectedRoute>
  );
}

/**
 * Componente para proteger rotas de estudante
 */
export function StudentProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={['student']}>
      {children}
    </RoleProtectedRoute>
  );
}

/**
 * Componente para rotas que requerem apenas autenticação
 */
export function AuthProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={['admin', 'student']}>
      {children}
    </RoleProtectedRoute>
  );
}

/**
 * Componente para rotas públicas que redirecionam usuários autenticados
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { role, isLoading, isVerified, getCorrectPanel } = useRoleVerification();

  // Evitar spinner em rotas públicas quando não autenticado
  if (isLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Se usuário está logado e role verificada, redirecionar para o painel correto
  if (user && isVerified && role) {
    return <Navigate to={getCorrectPanel()} replace />;
  }

  return <>{children}</>;
}
