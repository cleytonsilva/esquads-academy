import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Interfaces
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  sessionExpiry: Date | null;
  mfaRequired: boolean;
  mfaError: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updatePassword: (password: string) => Promise<{ error?: AuthError }>;
  updateProfile: (updates: any) => Promise<{ error?: AuthError }>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>;
  verifyOtp: (email: string, token: string, type: 'signup' | 'recovery' | 'email_change') => Promise<{ error?: AuthError }>;
  resendOtp: (email: string, type: 'signup' | 'recovery') => Promise<{ error?: AuthError }>;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  // Refs para controle
  const navigate = useNavigate();
  const initializationRef = useRef(false);
  const authSubscriptionRef = useRef<any>(null);
  const userProfileCacheRef = useRef<Map<string, string>>(new Map());
  const fetchingProfileRef = useRef<Set<string>>(new Set());

  // Função para buscar perfil do usuário com cache
  const fetchUserProfile = async (userId: string) => {
    if (import.meta.env.DEV) {
      console.log('[AuthContext] fetchUserProfile start', { userId });
    }

    // Verificar cache primeiro
    if (userProfileCacheRef.current.has(userId)) {
      const cachedRole = userProfileCacheRef.current.get(userId) || 'student';
      if (import.meta.env.DEV) {
        console.log('[AuthContext] fetchUserProfile cache hit', { userId, role: cachedRole });
      }
      return cachedRole;
    }

    // Evitar múltiplas chamadas simultâneas para o mesmo usuário
    if (fetchingProfileRef.current.has(userId)) {
      if (import.meta.env.DEV) {
        console.log('[AuthContext] fetchUserProfile already fetching', { userId });
      }
      return 'student'; // Retorna padrão enquanto busca
    }

    try {
      fetchingProfileRef.current.add(userId);
      
      if (import.meta.env.DEV) {
        console.log('[AuthContext] fetchUserProfile querying database', { userId });
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Erro ao buscar perfil:', error);
        if (import.meta.env.DEV) {
          console.log('[AuthContext] fetchUserProfile error details', { userId, error });
        }
        return 'student';
      }

      const role = data?.role || 'student';
      
      if (import.meta.env.DEV) {
        console.log('[AuthContext] fetchUserProfile success', { userId, role, data });
      }
      
      // Armazenar no cache
      userProfileCacheRef.current.set(userId, role);
      
      return role;
    } catch (error) {
      console.error('[AuthContext] Erro ao buscar perfil:', error);
      if (import.meta.env.DEV) {
        console.log('[AuthContext] fetchUserProfile exception', { userId, error });
      }
      return 'student';
    } finally {
      fetchingProfileRef.current.delete(userId);
    }
  };

  // Função para processar sessão
  const processSession = async (session: Session | null) => {
    if (import.meta.env.DEV) {
      console.log('[AuthContext] processSession start', { session: !!session, userId: session?.user?.id });
    }

    if (session?.user) {
      // Verificar se é a mesma sessão para evitar re-renders desnecessários
      const isSameUser = user?.id === session.user.id;
      const isSameSession = session?.access_token === session?.access_token;
      
      if (import.meta.env.DEV) {
        console.log('[AuthContext] processSession user check', { isSameUser, isSameSession, currentUserId: user?.id, sessionUserId: session.user.id });
      }
      
      if (!isSameUser) {
        if (import.meta.env.DEV) {
          console.log('[AuthContext] processSession setting new user', { userId: session.user.id });
        }
        setUser(session.user);
        setIsAuthenticated(true);
        
        // Buscar role do usuário apenas se for um usuário diferente
        const role = await fetchUserProfile(session.user.id);
        if (import.meta.env.DEV) {
          console.log('[AuthContext] processSession role fetched', { userId: session.user.id, role });
        }
        setUserRole(role);
      }
      
      // Atualizar sessão apenas se for diferente
      if (!isSameSession) {
        if (import.meta.env.DEV) {
          console.log('[AuthContext] processSession setting new session', { userId: session.user.id });
        }
        setSession(session);
        
        // Configurar expiração da sessão
        if (session.expires_at) {
          setSessionExpiry(new Date(session.expires_at * 1000));
        }
      }
    } else {
      // Limpar estado apenas se havia um usuário antes
      if (user || session) {
        if (import.meta.env.DEV) {
          console.log('[AuthContext] processSession clearing state');
        }
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setSessionExpiry(null);
      }
    }
    setLoading(false);
    
    if (import.meta.env.DEV) {
      console.log('[AuthContext] processSession completed');
    }
  };

  // Inicialização da autenticação
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        // Obter sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setError(error.message);
        }

        await processSession(session);

        // Configurar listener de mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT') {
              // Limpar cache ao fazer logout
              userProfileCacheRef.current.clear();
              fetchingProfileRef.current.clear();
              
              setUser(null);
              setSession(null);
              setIsAuthenticated(false);
              setUserRole(null);
              setSessionExpiry(null);
              setMfaRequired(false);
              setMfaError(null);
              setLoading(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // Processar apenas eventos relevantes
              await processSession(session);
            }
          }
        );

        authSubscriptionRef.current = subscription;
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        setError('Erro ao inicializar autenticação');
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      setMfaError(null);

      if (import.meta.env.DEV) {
        console.log('[AuthContext] signIn start', { email });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (import.meta.env.DEV) {
        console.log('[AuthContext] signIn supabase response', { data, error });
      }

      if (error) {
        setError(error.message);
        return { error };
      }

      if (data.session) {
        await processSession(data.session);
        if (import.meta.env.DEV) {
          console.log('[AuthContext] processSession completed for user', data.session.user?.id);
        }
        toast.success('Login realizado com sucesso!');
      }

      return { error: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      setError(errorMessage);
      console.error('[AuthContext] signIn caught error:', error);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
      if (import.meta.env.DEV) {
        console.log('[AuthContext] signIn finished');
      }
    }
  };

  // Função de registro
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        setError(error.message);
        return { error };
      }

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return { error: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar conta';
      setError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Limpar estado local primeiro
      setUser(null);
      setSession(null);
      setUserRole(null);
      setSessionExpiry(null);
      setIsAuthenticated(false);
      
      // Tentar logout no Supabase com timeout
      const logoutPromise = supabase.auth.signOut({ scope: 'local' });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      try {
        await Promise.race([logoutPromise, timeoutPromise]);
      } catch (logoutError) {
        console.warn('[AuthContext] Logout error (continuing anyway):', logoutError);
        // Continuar mesmo se o logout remoto falhar
      }
      
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      console.error('[AuthContext] signOut error:', error);
      setError(error.message || 'Erro ao fazer logout');
      // Mesmo com erro, limpar estado local e redirecionar
      setUser(null);
      setSession(null);
      setUserRole(null);
      setSessionExpiry(null);
      setIsAuthenticated(false);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // Função de reset de senha
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { error };
      }

      toast.success('Email de recuperação enviado!');
      return { error: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao enviar email de recuperação';
      setError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Função de atualização de senha
  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        return { error };
      }

      toast.success('Senha atualizada com sucesso!');
      return { error: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao atualizar senha';
      setError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Função de atualização de perfil
  const updateProfile = async (updates: any) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        setError(error.message);
        return { error };
      }

      toast.success('Perfil atualizado com sucesso!');
      return { error: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Função de refresh da sessão
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setError(error.message);
      } else if (data.session) {
        await processSession(data.session);
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar sessão');
    }
  };

  // Função para limpar erro
  const clearError = () => {
    setError(null);
    setMfaError(null);
  };

  // Função para reenviar confirmação
  const resendConfirmation = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        setError(error.message);
        return { error };
      }

      toast.success('Email de confirmação reenviado!');
      return { error: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao reenviar confirmação';
      setError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar OTP
  const verifyOtp = async (email: string, token: string, type: 'signup' | 'recovery' | 'email_change') => {
    try {
      setLoading(true);
      setMfaError(null);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });

      if (error) {
        setMfaError(error.message);
        return { error };
      }

      if (data.session) {
        await processSession(data.session);
        setMfaRequired(false);
        toast.success('Verificação realizada com sucesso!');
      }

      return { error: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro na verificação';
      setMfaError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Função para reenviar OTP
  const resendOtp = async (email: string, type: 'signup' | 'recovery') => {
    try {
      setLoading(true);
      setMfaError(null);

      const { error } = await supabase.auth.resend({
        type,
        email,
      });

      if (error) {
        setMfaError(error.message);
        return { error };
      }

      toast.success('Código reenviado!');
      return { error: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao reenviar código';
      setMfaError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Valor do contexto
  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    userRole,
    sessionExpiry,
    mfaRequired,
    mfaError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    clearError,
    resendConfirmation,
    verifyOtp,
    resendOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};