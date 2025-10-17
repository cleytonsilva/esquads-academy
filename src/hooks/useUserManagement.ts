import { useState, useEffect, useCallback } from 'react';
import { 
  ExtendedUser, 
  UserSearchFilters, 
  UserSearchResult, 
  Department, 
  CustomRole, 
  BulkOperation,
  UserFormData,
  UserActivityLog
} from '@/types/app';
import { userManagementService } from '@/services/userManagementService';
import { toast } from 'sonner';

export interface UseUserManagementOptions {
  organizationId?: string;
  initialFilters?: UserSearchFilters;
  pageSize?: number;
}

export interface UseUserManagementReturn {
  // Data
  users: ExtendedUser[];
  departments: Department[];
  roles: CustomRole[];
  searchResult: UserSearchResult | null;
  selectedUsers: string[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBulkOperating: boolean;
  
  // Search and filters
  filters: UserSearchFilters;
  setFilters: (filters: UserSearchFilters) => void;
  searchUsers: (filters?: UserSearchFilters) => Promise<void>;
  
  // User operations
  createUser: (userData: UserFormData) => Promise<ExtendedUser>;
  updateUser: (userId: string, userData: Partial<UserFormData>) => Promise<ExtendedUser>;
  deleteUser: (userId: string) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  resetUserPassword: (userId: string) => Promise<void>;
  
  // Bulk operations
  selectUser: (userId: string) => void;
  selectAllUsers: (selected: boolean) => void;
  bulkUpdateStatus: (userIds: string[], status: 'active' | 'inactive') => Promise<void>;
  bulkUpdateDepartment: (userIds: string[], departmentId: string) => Promise<void>;
  bulkUpdateRole: (userIds: string[], roleId: string) => Promise<void>;
  bulkDeleteUsers: (userIds: string[]) => Promise<void>;
  
  // Department operations
  createDepartment: (departmentData: Partial<Department>) => Promise<Department>;
  updateDepartment: (departmentId: string, departmentData: Partial<Department>) => Promise<Department>;
  deleteDepartment: (departmentId: string) => Promise<void>;
  
  // Role operations
  createRole: (roleData: Partial<CustomRole>) => Promise<CustomRole>;
  updateRole: (roleId: string, roleData: Partial<CustomRole>) => Promise<CustomRole>;
  deleteRole: (roleId: string) => Promise<void>;
  
  // Activity logs
  getUserActivityLogs: (userId: string) => Promise<UserActivityLog[]>;
  
  // Export/Import
  exportUsers: (filters?: UserSearchFilters) => Promise<string>;
  importUsers: (file: File) => Promise<void>;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useUserManagement(options: UseUserManagementOptions = {}): UseUserManagementReturn {
  const { organizationId, initialFilters = {}, pageSize = 20 } = options;
  
  // State
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserSearchFilters>(initialFilters);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [organizationId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [usersData, departmentsData, rolesData] = await Promise.all([
        userManagementService.getUsers({ ...filters, limit: pageSize }),
        userManagementService.getDepartments(organizationId),
        userManagementService.getRoles(organizationId)
      ]);
      
      setUsers(usersData.users);
      setSearchResult(usersData);
      setDepartments(departmentsData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = useCallback(async (searchFilters?: UserSearchFilters) => {
    const currentFilters = searchFilters || filters;
    setIsLoading(true);
    
    try {
      const result = await userManagementService.getUsers({
        ...currentFilters,
        limit: pageSize
      });
      
      setUsers(result.users);
      setSearchResult(result);
      setSelectedUsers([]); // Clear selection on new search
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize]);

  // User operations
  const createUser = async (userData: UserFormData): Promise<ExtendedUser> => {
    setIsCreating(true);
    try {
      const newUser = await userManagementService.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
      toast.success('Usuário criado com sucesso');
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erro ao criar usuário');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<UserFormData>): Promise<ExtendedUser> => {
    setIsUpdating(true);
    try {
      const updatedUser = await userManagementService.updateUser(userId, userData);
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
      toast.success('Usuário atualizado com sucesso');
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await userManagementService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      toast.success('Usuário excluído com sucesso');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleUserStatus = async (userId: string): Promise<void> => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateUser(userId, { status: newStatus });
  };

  const resetUserPassword = async (userId: string): Promise<void> => {
    try {
      await userManagementService.resetPassword(userId);
      toast.success('Email de redefinição de senha enviado');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Erro ao redefinir senha');
      throw error;
    }
  };

  // Selection operations
  const selectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = (selected: boolean) => {
    setSelectedUsers(selected ? users.map(u => u.id) : []);
  };

  // Bulk operations
  const bulkUpdateStatus = async (userIds: string[], status: 'active' | 'inactive'): Promise<void> => {
    setIsBulkOperating(true);
    try {
      await userManagementService.bulkUpdateUsers(userIds, { status });
      setUsers(prev => prev.map(user => 
        userIds.includes(user.id) ? { ...user, status } : user
      ));
      setSelectedUsers([]);
      toast.success(`Status de ${userIds.length} usuário(s) atualizado`);
    } catch (error) {
      console.error('Error bulk updating status:', error);
      toast.error('Erro ao atualizar status em lote');
      throw error;
    } finally {
      setIsBulkOperating(false);
    }
  };

  const bulkUpdateDepartment = async (userIds: string[], departmentId: string): Promise<void> => {
    setIsBulkOperating(true);
    try {
      const department = departments.find(d => d.id === departmentId);
      await userManagementService.bulkUpdateUsers(userIds, { departmentId });
      setUsers(prev => prev.map(user => 
        userIds.includes(user.id) ? { ...user, department } : user
      ));
      setSelectedUsers([]);
      toast.success(`Departamento de ${userIds.length} usuário(s) atualizado`);
    } catch (error) {
      console.error('Error bulk updating department:', error);
      toast.error('Erro ao atualizar departamento em lote');
      throw error;
    } finally {
      setIsBulkOperating(false);
    }
  };

  const bulkUpdateRole = async (userIds: string[], roleId: string): Promise<void> => {
    setIsBulkOperating(true);
    try {
      const role = roles.find(r => r.id === roleId);
      await userManagementService.bulkUpdateUsers(userIds, { roleId });
      setUsers(prev => prev.map(user => 
        userIds.includes(user.id) ? { ...user, customRole: role } : user
      ));
      setSelectedUsers([]);
      toast.success(`Função de ${userIds.length} usuário(s) atualizada`);
    } catch (error) {
      console.error('Error bulk updating role:', error);
      toast.error('Erro ao atualizar função em lote');
      throw error;
    } finally {
      setIsBulkOperating(false);
    }
  };

  const bulkDeleteUsers = async (userIds: string[]): Promise<void> => {
    setIsBulkOperating(true);
    try {
      await userManagementService.bulkDeleteUsers(userIds);
      setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
      setSelectedUsers([]);
      toast.success(`${userIds.length} usuário(s) excluído(s)`);
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      toast.error('Erro ao excluir usuários em lote');
      throw error;
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Department operations
  const createDepartment = async (departmentData: Partial<Department>): Promise<Department> => {
    try {
      const newDepartment = await userManagementService.createDepartment(departmentData);
      setDepartments(prev => [...prev, newDepartment]);
      toast.success('Departamento criado com sucesso');
      return newDepartment;
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Erro ao criar departamento');
      throw error;
    }
  };

  const updateDepartment = async (departmentId: string, departmentData: Partial<Department>): Promise<Department> => {
    try {
      const updatedDepartment = await userManagementService.updateDepartment(departmentId, departmentData);
      setDepartments(prev => prev.map(dept => dept.id === departmentId ? updatedDepartment : dept));
      toast.success('Departamento atualizado com sucesso');
      return updatedDepartment;
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Erro ao atualizar departamento');
      throw error;
    }
  };

  const deleteDepartment = async (departmentId: string): Promise<void> => {
    try {
      await userManagementService.deleteDepartment(departmentId);
      setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
      toast.success('Departamento excluído com sucesso');
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Erro ao excluir departamento');
      throw error;
    }
  };

  // Role operations
  const createRole = async (roleData: Partial<CustomRole>): Promise<CustomRole> => {
    try {
      const newRole = await userManagementService.createRole(roleData);
      setRoles(prev => [...prev, newRole]);
      toast.success('Função criada com sucesso');
      return newRole;
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Erro ao criar função');
      throw error;
    }
  };

  const updateRole = async (roleId: string, roleData: Partial<CustomRole>): Promise<CustomRole> => {
    try {
      const updatedRole = await userManagementService.updateRole(roleId, roleData);
      setRoles(prev => prev.map(role => role.id === roleId ? updatedRole : role));
      toast.success('Função atualizada com sucesso');
      return updatedRole;
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar função');
      throw error;
    }
  };

  const deleteRole = async (roleId: string): Promise<void> => {
    try {
      await userManagementService.deleteRole(roleId);
      setRoles(prev => prev.filter(role => role.id !== roleId));
      toast.success('Função excluída com sucesso');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Erro ao excluir função');
      throw error;
    }
  };

  // Activity logs
  const getUserActivityLogs = async (userId: string): Promise<UserActivityLog[]> => {
    try {
      return await userManagementService.getUserActivityLogs(userId);
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      toast.error('Erro ao carregar logs de atividade');
      throw error;
    }
  };

  // Export/Import
  const exportUsers = async (exportFilters?: UserSearchFilters): Promise<string> => {
    try {
      const downloadUrl = await userManagementService.exportUsers(exportFilters || filters);
      toast.success('Exportação iniciada');
      return downloadUrl;
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Erro ao exportar usuários');
      throw error;
    }
  };

  const importUsers = async (file: File): Promise<void> => {
    try {
      await userManagementService.importUsers(file);
      await refresh(); // Reload data after import
      toast.success('Importação concluída com sucesso');
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error('Erro ao importar usuários');
      throw error;
    }
  };

  // Refresh
  const refresh = async (): Promise<void> => {
    await loadInitialData();
  };

  return {
    // Data
    users,
    departments,
    roles,
    searchResult,
    selectedUsers,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkOperating,
    
    // Search and filters
    filters,
    setFilters,
    searchUsers,
    
    // User operations
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    
    // Bulk operations
    selectUser,
    selectAllUsers,
    bulkUpdateStatus,
    bulkUpdateDepartment,
    bulkUpdateRole,
    bulkDeleteUsers,
    
    // Department operations
    createDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Role operations
    createRole,
    updateRole,
    deleteRole,
    
    // Activity logs
    getUserActivityLogs,
    
    // Export/Import
    exportUsers,
    importUsers,
    
    // Refresh
    refresh
  };
}