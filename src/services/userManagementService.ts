import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/utils/supabaseWithRetry';
import { notificationService } from './notificationService';
import { 
  ExtendedUser, 
  UserSearchFilters, 
  UserSearchResult, 
  Department, 
  CustomRole, 
  UserFormData,
  UserActivityLog
} from '@/types/app';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'student';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_sign_in_at?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  points?: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'student';
  phone?: string;
  bio?: string;
}

export interface UpdateUserData {
  full_name?: string;
  role?: 'admin' | 'student';
  status?: 'active' | 'inactive' | 'suspended';
  phone?: string;
  bio?: string;
}

export interface UserFilters {
  role?: 'admin' | 'student';
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UserManagementService {
  /**
   * Buscar lista de usuários com filtros e paginação (versão expandida)
   */
  async getUsers(filters: UserSearchFilters = {}): Promise<UserSearchResult> {
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          department:departments(*),
          customRole:custom_roles(*)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }

      if (filters.roleId) {
        query = query.eq('custom_role_id', filters.roleId);
      }

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Aplicar paginação
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;

      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

      const { data, error, count } = await supabaseWithRetry(() => query);

      if (error) {
        console.error('Erro na consulta de usuários:', error);
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        users: data || [],
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages,
        hasMore: offset + limit < total
      };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw new Error('Não foi possível carregar a lista de usuários');
    }
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseWithRetry(() =>
        supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single()
      );

      if (error) {
        console.error('Erro ao buscar usuário por ID:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw new Error('Não foi possível carregar os dados do usuário');
    }
  }

  /**
   * Criar novo usuário
   */
  async createUser(userData: UserFormData): Promise<ExtendedUser> {
    try {
      // Usar a API local para criar usuário (que tem acesso às credenciais de serviço)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error('Não foi possível criar o usuário');
    }
  }

  /**
   * Atualizar usuário
   */
  async updateUser(id: string, userData: Partial<UserFormData>): Promise<ExtendedUser> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar usuário');
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Não foi possível atualizar o usuário');
    }
  }

  /**
   * Excluir usuário
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw new Error('Não foi possível excluir o usuário');
    }
  }

  /**
   * Suspender/Reativar usuário
   */
  async toggleUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Se suspender, desabilitar no auth
      if (status === 'suspended') {
        await supabase.auth.admin.updateUserById(id, {
          ban_duration: '876000h' // 100 anos
        });
      } else {
        await supabase.auth.admin.updateUserById(id, {
          ban_duration: 'none'
        });
      }

      return data;
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      throw new Error('Não foi possível alterar o status do usuário');
    }
  }

  /**
   * Redefinir senha do usuário
   */
  async resetPassword(id: string): Promise<void> {
    try {
      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: '', // Will be fetched from user ID
        options: {
          redirectTo: `${window.location.origin}/reset-password`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw new Error('Não foi possível redefinir a senha do usuário');
    }
  }

  /**
   * Operações em lote
   */
  async bulkUpdateUsers(userIds: string[], updates: Partial<UserFormData>): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', userIds);

      if (error) throw error;
    } catch (error) {
      console.error('Erro na atualização em lote:', error);
      throw new Error('Não foi possível atualizar os usuários');
    }
  }

  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', userIds);

      if (error) throw error;
    } catch (error) {
      console.error('Erro na exclusão em lote:', error);
      throw new Error('Não foi possível excluir os usuários');
    }
  }

  /**
   * Departamentos
   */
  async getDepartments(organizationId?: string): Promise<Department[]> {
    try {
      let query = supabase
        .from('departments')
        .select('*')
        .order('name');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
      throw new Error('Não foi possível carregar os departamentos');
    }
  }

  async createDepartment(departmentData: Partial<Department>): Promise<Department> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert(departmentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      throw new Error('Não foi possível criar o departamento');
    }
  }

  async updateDepartment(departmentId: string, departmentData: Partial<Department>): Promise<Department> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .update(departmentData)
        .eq('id', departmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      throw new Error('Não foi possível atualizar o departamento');
    }
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir departamento:', error);
      throw new Error('Não foi possível excluir o departamento');
    }
  }

  /**
   * Roles customizados
   */
  async getRoles(organizationId?: string): Promise<CustomRole[]> {
    try {
      let query = supabase
        .from('custom_roles')
        .select('*')
        .order('name');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      throw new Error('Não foi possível carregar os roles');
    }
  }

  async createRole(roleData: Partial<CustomRole>): Promise<CustomRole> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .insert(roleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar role:', error);
      throw new Error('Não foi possível criar o role');
    }
  }

  async updateRole(roleId: string, roleData: Partial<CustomRole>): Promise<CustomRole> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .update(roleData)
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      throw new Error('Não foi possível atualizar o role');
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir role:', error);
      throw new Error('Não foi possível excluir o role');
    }
  }

  /**
   * Logs de atividade
   */
  async getUserActivityLogs(userId: string): Promise<UserActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs de atividade:', error);
      throw new Error('Não foi possível carregar os logs de atividade');
    }
  }

  /**
   * Export/Import
   */
  async exportUsers(filters?: UserSearchFilters): Promise<string> {
    try {
      const response = await fetch('/api/users/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar usuários');
      }

      const result = await response.json();
      return result.downloadUrl;
    } catch (error) {
      console.error('Erro ao exportar usuários:', error);
      throw new Error('Não foi possível exportar os usuários');
    }
  }

  async importUsers(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/users/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao importar usuários');
      }
    } catch (error) {
      console.error('Erro ao importar usuários:', error);
      throw new Error('Não foi possível importar os usuários');
    }
  }

  /**
   * Buscar estatísticas de usuários
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    admins: number;
    students: number;
    newThisMonth: number;
  }> {
    try {
      const [
        { count: total },
        { count: active },
        { count: inactive },
        { count: suspended },
        { count: admins },
        { count: students },
        { count: newThisMonth }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      return {
        total: total || 0,
        active: active || 0,
        inactive: inactive || 0,
        suspended: suspended || 0,
        admins: admins || 0,
        students: students || 0,
        newThisMonth: newThisMonth || 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Não foi possível carregar as estatísticas');
    }
  }
}

export const userManagementService = new UserManagementService();
