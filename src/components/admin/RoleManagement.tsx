import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search,
  MoreHorizontal,
  Lock,
  Unlock,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { Role, Permission } from '@/types/admin';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  level: number;
}

interface RoleManagementProps {
  organizationId?: string;
  onRoleChange?: (roles: Role[]) => void;
}

const mockPermissions: Permission[] = [
  { id: 'users.view', name: 'Visualizar Usuários', description: 'Permite visualizar lista de usuários', resource: 'users', action: 'view' },
  { id: 'users.create', name: 'Criar Usuários', description: 'Permite criar novos usuários', resource: 'users', action: 'create' },
  { id: 'users.edit', name: 'Editar Usuários', description: 'Permite editar dados de usuários', resource: 'users', action: 'edit' },
  { id: 'users.delete', name: 'Excluir Usuários', description: 'Permite excluir usuários', resource: 'users', action: 'delete' },
  { id: 'courses.view', name: 'Visualizar Cursos', description: 'Permite visualizar cursos', resource: 'courses', action: 'view' },
  { id: 'courses.create', name: 'Criar Cursos', description: 'Permite criar novos cursos', resource: 'courses', action: 'create' },
  { id: 'courses.edit', name: 'Editar Cursos', description: 'Permite editar cursos', resource: 'courses', action: 'edit' },
  { id: 'courses.delete', name: 'Excluir Cursos', description: 'Permite excluir cursos', resource: 'courses', action: 'delete' },
  { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Permite visualizar relatórios', resource: 'reports', action: 'view' },
  { id: 'reports.export', name: 'Exportar Relatórios', description: 'Permite exportar relatórios', resource: 'reports', action: 'export' },
  { id: 'admin.access', name: 'Acesso Admin', description: 'Permite acesso ao painel administrativo', resource: 'admin', action: 'access' },
  { id: 'settings.manage', name: 'Gerenciar Configurações', description: 'Permite gerenciar configurações do sistema', resource: 'settings', action: 'manage' }
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acesso completo ao sistema',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'reports.view', 'reports.export', 'admin.access', 'settings.manage'],
    userCount: 3,
    isActive: true,
    level: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Instrutor',
    description: 'Pode gerenciar cursos e visualizar relatórios',
    permissions: ['courses.view', 'courses.create', 'courses.edit', 'reports.view', 'users.view'],
    userCount: 15,
    isActive: true,
    level: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Estudante',
    description: 'Acesso básico aos cursos',
    permissions: ['courses.view'],
    userCount: 150,
    isActive: true,
    level: 3,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    name: 'Moderador',
    description: 'Pode moderar conteúdo e usuários',
    permissions: ['users.view', 'users.edit', 'courses.view', 'courses.edit', 'reports.view'],
    userCount: 8,
    isActive: true,
    level: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

const RoleManagement: React.FC<RoleManagementProps> = ({
  organizationId,
  onRoleChange
}) => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
    isActive: true,
    level: 3
  });
  const [loading, setLoading] = useState(false);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCreateRole = async () => {
    setLoading(true);
    try {
      const newRole: Role = {
        id: Date.now().toString(),
        ...formData,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setRoles(prev => [...prev, newRole]);
      setIsCreateDialogOpen(false);
      resetForm();
      onRoleChange?.(roles);
    } catch (error) {
      console.error('Erro ao criar papel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      const updatedRole: Role = {
        ...selectedRole,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id ? updatedRole : role
      ));
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      onRoleChange?.(roles);
    } catch (error) {
      console.error('Erro ao editar papel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      setRoles(prev => prev.filter(role => role.id !== selectedRole.id));
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
      onRoleChange?.(roles);
    } catch (error) {
      console.error('Erro ao excluir papel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRoleStatus = async (role: Role) => {
    setLoading(true);
    try {
      const updatedRole = { ...role, isActive: !role.isActive };
      setRoles(prev => prev.map(r => r.id === role.id ? updatedRole : r));
      onRoleChange?.(roles);
    } catch (error) {
      console.error('Erro ao alterar status do papel:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
      isActive: true,
      level: 3
    });
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
      level: role.level
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const getRoleLevelBadge = (level: number) => {
    const levelConfig = {
      1: { label: 'Alto', variant: 'destructive' as const },
      2: { label: 'Médio', variant: 'default' as const },
      3: { label: 'Básico', variant: 'secondary' as const }
    };
    
    return levelConfig[level as keyof typeof levelConfig] || levelConfig[3];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Papéis</h2>
          <p className="text-gray-600">Gerencie papéis e permissões do sistema</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Papel
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar papéis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <Card key={role.id} className={cn(
            "transition-all duration-200 hover:shadow-lg",
            !role.isActive && "opacity-60"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(role)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleRoleStatus(role)}>
                      {role.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(role)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{role.userCount} usuários</span>
                </div>
                <Badge {...getRoleLevelBadge(role.level)}>
                  {getRoleLevelBadge(role.level).label}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Permissões ({role.permissions.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permissionId) => {
                    const permission = permissions.find(p => p.id === permissionId);
                    return permission ? (
                      <Badge key={permissionId} variant="outline" className="text-xs">
                        {permission.name}
                      </Badge>
                    ) : null;
                  })}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  {role.isActive ? (
                    <>
                      <Unlock className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Ativo</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Inativo</span>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(role)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Papel</DialogTitle>
            <DialogDescription>
              Defina um novo papel com suas respectivas permissões
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Papel</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Instrutor"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Nível de Acesso</Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: Number(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={1}>Alto (Administrador)</option>
                    <option value={2}>Médio (Moderador)</option>
                    <option value={3}>Básico (Usuário)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva as responsabilidades deste papel..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                />
                <Label htmlFor="isActive">Papel ativo</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                  <div key={resource} className="space-y-3">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {resource === 'users' ? 'Usuários' :
                       resource === 'courses' ? 'Cursos' :
                       resource === 'reports' ? 'Relatórios' :
                       resource === 'admin' ? 'Administração' :
                       resource === 'settings' ? 'Configurações' : resource}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {resourcePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={permission.id} className="font-medium">
                              {permission.name}
                            </Label>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Papel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Papel</DialogTitle>
            <DialogDescription>
              Modifique as informações e permissões do papel
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Papel</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Instrutor"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Nível de Acesso</Label>
                  <select
                    id="edit-level"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: Number(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={1}>Alto (Administrador)</option>
                    <option value={2}>Médio (Moderador)</option>
                    <option value={3}>Básico (Usuário)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva as responsabilidades deste papel..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                />
                <Label htmlFor="edit-isActive">Papel ativo</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                  <div key={resource} className="space-y-3">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {resource === 'users' ? 'Usuários' :
                       resource === 'courses' ? 'Cursos' :
                       resource === 'reports' ? 'Relatórios' :
                       resource === 'admin' ? 'Administração' :
                       resource === 'settings' ? 'Configurações' : resource}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {resourcePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`edit-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditRole} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o papel "{selectedRole?.name}"? 
              Esta ação não pode ser desfeita e afetará {selectedRole?.userCount} usuários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManagement;