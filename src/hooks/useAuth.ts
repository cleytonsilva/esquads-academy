/**
 * useAuth.ts
 * 
 * Finalidade: Hook customizado para gerenciamento de autenticação de usuários
 * Conecta-se com: Supabase Auth, React Router, componentes de toast
 * Função principal: Fornece estado de autenticação, login, logout, registro e recuperação de senha
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
const DEBOUNCE_TIME = 300;

// Implementação nativa de debounce
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export function useAuth() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  // Debounced function to update auth state
  const debouncedSetAuthState = useMemo(
    () => debounce((newState: Partial<AuthState>) => {
      setAuthState(prev => ({ ...prev, ...newState }));
    }, DEBOUNCE_TIME),
    []
  );

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthState({
              user: null,
              session: null,
              loading: false,
              isAuthenticated: false,
            });
          }
          return;
        }

        if (mounted) {
          setAuthState({
            user: session?.user || null,
            session,
            loading: false,
            isAuthenticated: !!session?.user,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          isAuthenticated: !!session?.user,
        });

        // Handle navigation based on auth state
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in - redirect to appropriate dashboard
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/student');
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out - redirect to home
          navigate('/');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      debouncedSetAuthState.cancel();
    };
  }, [navigate, debouncedSetAuthState]);

  // Login function
  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Login realizado com sucesso!');
      return { data, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
      return { data: null, error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Register function
  const register = useCallback(async ({ email, password, fullName }: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return { data, error: null };
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.message || 'Erro ao criar conta');
      return { data: null, error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      toast.success('Logout realizado com sucesso!');
      return { error: null };
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Erro ao fazer logout');
      return { error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success('Email de recuperação enviado!');
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Erro ao enviar email de recuperação');
      return { error };
    }
  }, []);

  // Update password function
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('Senha atualizada com sucesso!');
      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      toast.error(error.message || 'Erro ao atualizar senha');
      return { error };
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
  };
}