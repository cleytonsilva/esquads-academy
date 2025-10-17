import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Building,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { 
  User, 
  UserSearchFilters, 
  UserSearchResult, 
  Department, 
  Role,
  Permission,
  BulkOperation,
  UserManagementProps 
} from '@/types/admin';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import UserForm from './UserForm';

interface UserTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onViewUser: (user: User) => void;
  isLoading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEditUser,
  onDeleteUser,
  onViewUser,
  isLoading = false
}) => {
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const getStatusBadge = (status: User['status']) => {
    const statusConfig = {
      active: { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'Ativo' },
      inactive: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: 'Inativo' },
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800', text: 'Pendente' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onCheckedChange={onSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left font-medium">Usuário</th>
                  <th className="p-4 text-left font-medium">Função</th>
                  <th className="p-4 text-left font-medium">Departamento</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Último Login</th>
                  <th className="p-4 text-left font-medium">Criado em</th>
                  <th className="p-4 text-center font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => onSelectUser(user.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{user.role.name}</Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {user.department?.name || 'Não definido'}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {formatLastLogin(user.lastLogin)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewUser(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário "{deleteUser?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteUser) {
                  onDeleteUser(deleteUser);
                  setDeleteUser(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@esquads.com',
    name: 'João Silva',
    role: { id: '1', name: 'Administrador', description: 'Acesso total', permissions: [], isCustom: false, isSystemRole: true },
    department: { id: '1', name: 'TI', userCount: 5 },
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'maria@esquads.com',
    name: 'Maria Santos',
    role: { id: '2', name: 'Instrutor', description: 'Criar e gerenciar cursos', permissions: [], isCustom: false, isSystemRole: true },
    department: { id: '2', name: 'Educação', userCount: 12 },
    status: 'active',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  },
  {
    id: '3',
    email: 'carlos@esquads.com',
    name: 'Carlos Oliveira',
    role: { id: '3', name: 'Estudante', description: 'Acesso aos cursos', permissions: [], isCustom: false, isSystemRole: true },
    status: 'pending',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  }
];

const mockDepartments: Department[] = [
  { id: '1', name: 'TI', userCount: 5 },
  { id: '2', name: 'Educação', userCount: 12 },
  { id: '3', name: 'Marketing', userCount: 8 },
  { id: '4', name: 'Vendas', userCount: 15 }
];

const mockRoles: Role[] = [
  { id: '1', name: 'Administrador', description: 'Acesso total', permissions: [], isCustom: false, isSystemRole: true },
  { id: '2', name: 'Instrutor', description: 'Criar e gerenciar cursos', permissions: [], isCustom: false, isSystemRole: true },
  { id: '3', name: 'Estudante', description: 'Acesso aos cursos', permissions: [], isCustom: false, isSystemRole: true }
];

const mockPermissions: Permission[] = [
  { id: 'users.create', name: 'Criar usuários', description: 'Permite criar novos usuários', resource: 'users', action: 'create' },
  { id: 'users.read', name: 'Visualizar usuários', description: 'Permite visualizar lista de usuários', resource: 'users', action: 'read' },
  { id: 'users.update', name: 'Editar usuários', description: 'Permite editar informações de usuários', resource: 'users', action: 'update' },
  { id: 'users.delete', name: 'Excluir usuários', description: 'Permite excluir usuários', resource: 'users', action: 'delete' },
  { id: 'courses.create', name: 'Criar cursos', description: 'Permite criar novos cursos', resource: 'courses', action: 'create' },
  { id: 'courses.read', name: 'Visualizar cursos', description: 'Permite visualizar lista de cursos', resource: 'courses', action: 'read' },
  { id: 'courses.update', name: 'Editar cursos', description: 'Permite editar cursos', resource: 'courses', action: 'update' },
  { id: 'courses.delete', name: 'Excluir cursos', description: 'Permite excluir cursos', resource: 'courses', action: 'delete' }
];

export const UserManagement: React.FC<UserManagementProps> = ({
  organizationId,
  currentUser,
  permissions = []
}) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<UserSearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  
  // User Form state
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [userFormMode, setUserFormMode] = useState<'create' | 'edit'>('create');

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedUsers(selected ? users.map(u => u.id) : []);
  };

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setUserFormMode('create');
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormMode('edit');
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setSelectedUsers(prev => prev.filter(id => id !== user.id));
  };

  const handleViewUser = (user: User) => {
    console.log('View user:', user);
    // Navigate to user details
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (userFormMode === 'create') {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        name: userData.name!,
        role: userData.role!,
        department: userData.department,
        status: userData.status || 'active',
        profile: userData.profile,
        customPermissions: userData.customPermissions,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUsers(prev => [...prev, newUser]);
    } else {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser?.id 
          ? { ...user, ...userData, updatedAt: new Date() }
          : user
      ));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'for users:', selectedUsers);
    // Implement bulk actions
  };

  const filteredUsers = users.filter(user => {
    if (searchFilters.search) {
      const searchTerm = searchFilters.search.toLowerCase();
      if (!user.name.toLowerCase().includes(searchTerm) && 
          !user.email.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }
    
    if (searchFilters.department && user.department?.id !== searchFilters.department) {
      return false;
    }
    
    if (searchFilters.role && user.role.id !== searchFilters.role) {
      return false;
    }
    
    if (searchFilters.status && user.status !== searchFilters.status) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Gerenciamento de Usuários
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie usuários, funções e permissões da plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total de Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Departamentos</p>
                <p className="text-2xl font-bold">{mockDepartments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchFilters.search || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select
              value={searchFilters.department || 'all'}
              onValueChange={(value) => setSearchFilters(prev => ({ 
                ...prev, 
                department: value === 'all' ? undefined : value 
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {mockDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={searchFilters.role || 'all'}
              onValueChange={(value) => setSearchFilters(prev => ({ 
                ...prev, 
                role: value === 'all' ? undefined : value 
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                {mockRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={searchFilters.status || 'all'}
              onValueChange={(value) => setSearchFilters(prev => ({ 
                ...prev, 
                status: value === 'all' ? undefined : (value as any)
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {selectedUsers.length} usuário(s) selecionado(s)
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Ativar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Desativar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onViewUser={handleViewUser}
        isLoading={isLoading}
      />

      {/* Empty State */}
      {filteredUsers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchFilters.search || searchFilters.department || searchFilters.role || searchFilters.status
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando o primeiro usuário da plataforma.'}
            </p>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Usuário
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Form Modal */}
      <UserForm
        user={editingUser}
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSave={handleSaveUser}
        departments={mockDepartments}
        roles={mockRoles}
        permissions={mockPermissions}
        mode={userFormMode}
      />
    </div>
  );
};

export default UserManagement;