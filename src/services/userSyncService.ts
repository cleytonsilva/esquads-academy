import { supabase } from '@/integrations/supabase/client';

export interface SyncUserData {
  user_id: string;
  email: string;
  full_name?: string;
  role?: 'admin' | 'student' | 'instructor';
}

class UserSyncService {
  private normalizeRole(role?: string | null): 'admin' | 'student' | 'instructor' {
    const value = (role ?? '').toString().toLowerCase();
    if (value === 'admin') return 'admin';
    if (value === 'instructor') return 'instructor';
    if (value === 'student') return 'student';
    if (value === 'moderator') return 'admin';
    return 'student';
  }
  /**
   * Sincronizar usuário do Auth com as tabelas users e user_profiles
   */
  async syncUser(userData: SyncUserData): Promise<any> {
    console.log('🔄 Starting user sync for:', userData.user_id);
    
    try {
      // Primeiro, tentar inserir/atualizar na tabela users
      const userResult = await this.syncToUsersTable(userData);
      
      // Depois, tentar inserir/atualizar na tabela user_profiles
      const profileResult = await this.syncToUserProfilesTable(userData);
      
      // Garantir que o usuário tenha pontos
      await this.ensureUserPoints(userData.user_id);
      
      console.log('✅ User sync completed successfully');
      return userResult || profileResult;
      
    } catch (error) {
      console.error('❌ Error syncing user:', error);
      throw new Error('Não foi possível sincronizar o usuário');
    }
  }

  /**
   * Sincronizar para a tabela users
   */
  private async syncToUsersTable(userData: SyncUserData): Promise<any> {
    try {
      const normalizedRole = this.normalizeRole(userData.role);
      
      const userRecord = {
        id: userData.user_id,
        full_name: userData.full_name || userData.email.split('@')[0] || 'Usuário',
        role: normalizedRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Usar RPC para inserção com casting correto do enum
      const { data, error } = await supabase.rpc('upsert_user_with_role', {
        p_id: userData.user_id,
        p_full_name: userRecord.full_name,
        p_role: normalizedRole,
        p_created_at: userRecord.created_at,
        p_updated_at: userRecord.updated_at
      });

      if (error) {
        console.warn('⚠️ Failed to sync to users table:', error);
        return null;
      }

      console.log('✅ Synced to users table:', data);
      return data;
      
    } catch (error) {
      console.warn('⚠️ Error syncing to users table:', error);
      return null;
    }
  }

  /**
   * Sincronizar para a tabela user_profiles
   */
  private async syncToUserProfilesTable(userData: SyncUserData): Promise<any> {
    try {
      const normalizedRole = this.normalizeRole(userData.role);
      
      const profileRecord = {
        user_id: userData.user_id,
        full_name: userData.full_name || userData.email.split('@')[0] || 'Usuário',
        role: normalizedRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Usar RPC para inserção com casting correto do enum
      const { data, error } = await supabase.rpc('upsert_user_profile_with_role', {
        p_user_id: userData.user_id,
        p_full_name: profileRecord.full_name,
        p_role: normalizedRole,
        p_created_at: profileRecord.created_at,
        p_updated_at: profileRecord.updated_at
      });

      if (error) {
        console.warn('⚠️ Failed to sync to user_profiles table:', error);
        return null;
      }

      console.log('✅ Synced to user_profiles table:', data);
      return data;
      
    } catch (error) {
      console.warn('⚠️ Error syncing to user_profiles table:', error);
      return null;
    }
  }

  /**
   * Garantir que o usuário tenha um registro de pontos
   */
  private async ensureUserPoints(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .upsert({
          user_id: userId,
          total_points: 0,
          level: 1,
          experience_points: 0
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: true 
        });

      if (error) {
        console.warn('⚠️ Failed to ensure user points:', error);
      } else {
        console.log('✅ User points ensured');
      }
    } catch (error) {
      console.warn('⚠️ Error ensuring user points:', error);
    }
  }

  /**
   * Verificar se usuário existe na tabela users
   */
  async checkUserExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false;
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Verificar se usuário existe na tabela user_profiles
   */
  async checkUserProfileExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false;
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error checking user profile existence:', error);
      return false;
    }
  }

  /**
   * Sincronizar usuário atual se necessário
   */
  async syncCurrentUser(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('⚠️ No user logged in');
        return;
      }

      console.log('🔍 Checking if current user needs sync:', user.id);

      // Verificar se existe em ambas as tabelas
      const [userExists, profileExists] = await Promise.all([
        this.checkUserExists(user.id),
        this.checkUserProfileExists(user.id)
      ]);

      if (!userExists || !profileExists) {
        console.log('🔄 User needs sync - users exists:', userExists, 'profile exists:', profileExists);
        
        await this.syncUser({
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          role: this.normalizeRole(user.user_metadata?.role || 'student')
        });
        
        console.log('✅ Current user synced successfully');
      } else {
        console.log('✅ Current user already exists in both tables');
      }
    } catch (error) {
      console.error('❌ Error syncing current user:', error);
    }
  }

  /**
   * Obter dados do usuário atual da tabela users (com fallback para user_profiles)
   */
  async getCurrentUserData(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Tentar buscar na tabela users primeiro
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData && !userError) {
        console.log('✅ User data found in users table');
        return userData;
      }

      // Se não encontrou na tabela users, tentar user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData && !profileError) {
        console.log('✅ User data found in user_profiles table');
        // Converter formato de user_profiles para users
        return {
          id: profileData.user_id,
          full_name: profileData.full_name,
          role: this.normalizeRole(profileData.role),
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        };
      }

      console.warn('⚠️ User not found in any table, attempting sync');
      
      // Se não encontrou em nenhuma tabela, tentar sincronizar
      await this.syncCurrentUser();
      
      // Tentar buscar novamente após sincronização
      const { data: syncedData, error: syncedError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (syncedData && !syncedError) {
        console.log('✅ User data found after sync');
        return syncedData;
      }

      console.error('❌ Failed to get user data even after sync');
      return null;

    } catch (error) {
      console.error('❌ Error getting current user data:', error);
      return null;
    }
  }

  /**
   * Forçar sincronização completa do usuário atual
   */
  async forceSyncCurrentUser(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('⚠️ No user logged in for force sync');
        return;
      }

      console.log('🔄 Force syncing user:', user.id);

      await this.syncUser({
        user_id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        role: this.normalizeRole(user.user_metadata?.role || 'student')
      });

      console.log('✅ Force sync completed');
    } catch (error) {
      console.error('❌ Error in force sync:', error);
      throw error;
    }
  }
}

export const userSyncService = new UserSyncService();
