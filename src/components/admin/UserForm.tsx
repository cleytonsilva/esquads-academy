import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Upload,
  Trash2,
  Plus,
  Shield,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  User as UserType, 
  UserProfile, 
  Department, 
  Role,
  Permission 
} from '@/types/admin';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserFormProps {
  user?: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<UserType>) => Promise<void>;
  departments: Department[];
  roles: Role[];
  permissions: Permission[];
  mode: 'create' | 'edit';
}

interface FormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  roleId: string;
  departmentId?: string;
  status: UserType['status'];
  profile?: Partial<UserProfile>;
  customPermissions: string[];
  sendWelcomeEmail: boolean;
  requirePasswordChange: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  departments,
  roles,
  permissions,
  mode
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    departmentId: '',
    status: 'active',
    profile: {
      phone: '',
      bio: '',
      location: '',
      avatar: ''
    },
    customPermissions: [],
    sendWelcomeEmail: true,
    requirePasswordChange: false
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name,
        email: user.email,
        roleId: user.role.id,
        departmentId: user.department?.id || '',
        status: user.status,
        profile: {
          phone: user.profile?.phone || '',
          bio: user.profile?.bio || '',
          location: user.profile?.location || '',
          avatar: user.profile?.avatar || ''
        },
        customPermissions: user.customPermissions || [],
        sendWelcomeEmail: false,
        requirePasswordChange: false
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        departmentId: '',
        status: 'active',
        profile: {
          phone: '',
          bio: '',
          location: '',
          avatar: ''
        },
        customPermissions: [],
        sendWelcomeEmail: true,
        requirePasswordChange: true
      });
    }
    setValidationErrors({});
  }, [user, mode, isOpen]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Basic validation
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.roleId) {
      errors.roleId = 'Função é obrigatória';
    }

    // Password validation for create mode
    if (mode === 'create') {
      if (!formData.password) {
        errors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 8) {
        errors.password = 'Senha deve ter pelo menos 8 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Senhas não coincidem';
      }
    }

    // Password validation for edit mode (only if password is provided)
    if (mode === 'edit' && formData.password) {
      if (formData.password.length < 8) {
        errors.password = 'Senha deve ter pelo menos 8 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const userData: Partial<UserType> = {
        name: formData.name,
        email: formData.email,
        role: roles.find(r => r.id === formData.roleId)!,
        department: formData.departmentId ? departments.find(d => d.id === formData.departmentId) : undefined,
        status: formData.status,
        profile: formData.profile,
        customPermissions: formData.customPermissions
      };

      // Add password for create mode or if password is provided in edit mode
      if (mode === 'create' || (mode === 'edit' && formData.password)) {
        (userData as any).password = formData.password;
      }

      // Add additional flags for create mode
      if (mode === 'create') {
        (userData as any).sendWelcomeEmail = formData.sendWelcomeEmail;
        (userData as any).requirePasswordChange = formData.requirePasswordChange;
      }

      await onSave(userData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setValidationErrors({ submit: 'Erro ao salvar usuário. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(permissionId)
        ? prev.customPermissions.filter(id => id !== permissionId)
        : [...prev.customPermissions, permissionId]
    }));
  };

  const selectedRole = roles.find(r => r.id === formData.roleId);
  const rolePermissions = selectedRole?.permissions || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>
              {mode === 'create' ? 'Criar Novo Usuário' : `Editar Usuário: ${user?.name}`}
            </span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Preencha as informações para criar um novo usuário na plataforma.'
              : 'Atualize as informações do usuário conforme necessário.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome completo"
                    className={cn(validationErrors.name && "border-red-500")}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500">{validationErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="usuario@exemplo.com"
                    className={cn(validationErrors.email && "border-red-500")}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função *</Label>
                  <Select
                    value={formData.roleId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                  >
                    <SelectTrigger className={cn(validationErrors.roleId && "border-red-500")}>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>{role.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.roleId && (
                    <p className="text-sm text-red-500">{validationErrors.roleId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select
                    value={formData.departmentId || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      departmentId: value === 'none' ? undefined : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum departamento</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>{dept.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      status: value as UserType['status'] 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Ativo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center space-x-2">
                          <X className="h-4 w-4 text-gray-500" />
                          <span>Inativo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <span>Pendente</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">
                  {mode === 'create' ? 'Senha *' : 'Alterar Senha (opcional)'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {mode === 'create' ? 'Senha *' : 'Nova Senha'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Digite a senha"
                        className={cn(validationErrors.password && "border-red-500")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-red-500">{validationErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {mode === 'create' ? 'Confirmar Senha *' : 'Confirmar Nova Senha'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme a senha"
                        className={cn(validationErrors.confirmPassword && "border-red-500")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.profile?.phone || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.profile?.location || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      profile: { ...prev.profile, location: e.target.value }
                    }))}
                    placeholder="Cidade, Estado"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.profile?.bio || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    profile: { ...prev.profile, bio: e.target.value }
                  }))}
                  placeholder="Conte um pouco sobre o usuário..."
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-4">
              {selectedRole && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Função selecionada: <strong>{selectedRole.name}</strong>
                    <br />
                    {selectedRole.description}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Permissões Personalizadas</h4>
                <p className="text-sm text-muted-foreground">
                  Selecione permissões adicionais além das já incluídas na função.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map(permission => {
                    const isRolePermission = rolePermissions.some(rp => rp.id === permission.id);
                    const isCustomSelected = formData.customPermissions.includes(permission.id);
                    
                    return (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={isRolePermission || isCustomSelected}
                          disabled={isRolePermission}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                        />
                        <Label 
                          htmlFor={permission.id}
                          className={cn(
                            "text-sm",
                            isRolePermission && "text-muted-foreground"
                          )}
                        >
                          {permission.name}
                          {isRolePermission && (
                            <Badge variant="secondary" className="ml-2">
                              Função
                            </Badge>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              {mode === 'create' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enviar email de boas-vindas</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar email com instruções de acesso para o novo usuário
                      </p>
                    </div>
                    <Switch
                      checked={formData.sendWelcomeEmail}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        sendWelcomeEmail: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exigir alteração de senha</Label>
                      <p className="text-sm text-muted-foreground">
                        Usuário deve alterar a senha no primeiro login
                      </p>
                    </div>
                    <Switch
                      checked={formData.requirePasswordChange}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        requirePasswordChange: checked 
                      }))}
                    />
                  </div>
                </div>
              )}

              {mode === 'edit' && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Configurações adicionais para usuários existentes estarão disponíveis em breve.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Submit Error */}
          {validationErrors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.submit}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;