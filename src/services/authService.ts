import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { userSyncService } from '@/services/userSyncService';
import { roleVerificationService } from '@/services/roleVerificationService';

export type SignInResult = {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
};

export type SignUpOptions = {
  full_name?: string;
  role?: 'admin' | 'student' | 'instructor';
  phone?: string | null;
};

export type SignUpResult = {
  success: boolean;
  user?: User | null;
  error?: string;
};

class AuthService {
  /**
   * Realiza login com email e senha e sincroniza o usuário nas tabelas.
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      const user = data.user ?? null;
      const session = data.session ?? null;

      // Sincronizar usuário e garantir role em cache
      await userSyncService.forceSyncCurrentUser();
      if (user) {
        await roleVerificationService.forceRefreshUserRole(user);
      }

      return { success: true, user, session };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Falha ao efetuar login' };
    }
  }

  /**
   * Realiza registro no Supabase com metadados mínimos e sincroniza usuário.
   */
  async signUp(email: string, password: string, options?: SignUpOptions): Promise<SignUpResult> {
    try {
      const metadata = {
        full_name: options?.full_name || email.split('@')[0],
        role: options?.role || 'student',
        phone: options?.phone ?? null,
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const user = data.user ?? null;

      // Sincronizar usuário recém-criado
      await userSyncService.forceSyncCurrentUser();
      if (user) {
        await roleVerificationService.forceRefreshUserRole(user);
      }

      return { success: true, user };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Falha ao registrar usuário' };
    }
  }

  /**
   * Realiza logout e limpa caches de role.
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }

      // Limpar cache de roles após signOut
      roleVerificationService.invalidateAllRoles();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Falha ao sair' };
    }
  }

  /**
   * Envia email para redefinição de senha.
   */
  async resetPassword(email: string, redirectTo?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const redirect = redirectTo || `${window.location.origin}/auth/reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirect });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Falha ao enviar email de recuperação' };
    }
  }

  /**
   * Obtém o usuário atual da sessão.
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  }

  /**
   * Obtém a sessão atual.
   */
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
  }
}

export const authService = new AuthService();