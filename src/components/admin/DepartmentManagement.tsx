import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search,
  MoreHorizontal,
  FolderTree,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Department } from '@/types/admin';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DepartmentFormData {
  name: string;
  description: string;
  parentId?: string;
  managerId?: string;
  costCenter?: string;
  location?: string;
}

interface DepartmentManagementProps {
  organizationId?: string;
  onDepartmentChange?: (departments: Department[]) => void;
}

const mockDepartments: Department[] = [
  { 
    id: '1', 
    name: 'Tecnologia da Informação', 
    description: 'Responsável por toda infraestrutura tecnológica',
    userCount: 15,
    costCenter: 'TI-001',
    location: 'São Paulo - SP'
  },
  { 
    id: '2', 
    name: 'Educação e Treinamento', 
    description: 'Desenvolvimento de conteúdo educacional e treinamentos',
    userCount: 25,
    costCenter: 'EDU-001',
    location: 'Rio de Janeiro - RJ'
  },
  { 
    id: '3', 
    name: 'Marketing Digital', 
    description: 'Estratégias de marketing e comunicação digital',
    parentId: '4',
    userCount: 12,
    costCenter: 'MKT-001',
    location: 'São Paulo - SP'
  },
  { 
    id: '4', 
    name: 'Comercial', 
    description: 'Vendas e relacionamento com clientes',
    userCount: 30,
    costCenter: 'COM-001',
    location: 'Belo Horizonte - MG',
    children: [
      { 
        id: '3', 
        name: 'Marketing Digital', 
        description: 'Estratégias de marketing e comunicação digital',
        parentId: '4',
        userCount: 12,
        costCenter: 'MKT-001',
        location: 'São Paulo - SP'
      }
    ]
  },
  { 
    id: '5', 
    name: 'Recursos Humanos', 
    description: 'Gestão de pessoas e desenvolvimento organizacional',
    userCount: 8,
    costCenter: 'RH-001',
    location: 'Brasília - DF'
  }
];

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  organizationId,
  onDepartmentChange
}) => {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    parentId: '',
    managerId: '',
    costCenter: '',
    location: ''
  });

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDepartment = () => {
    setFormMode('create');
    setFormData({
      name: '',
      description: '',
      parentId: '',
      managerId: '',
      costCenter: '',
      location: ''
    });
    setIsFormOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setFormMode('edit');
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      parentId: department.parentId || '',
      managerId: department.managerId || '',
      costCenter: department.costCenter || '',
      location: department.location || ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async () => {
    setIsLoading(true);
    try {
      if (formMode === 'create') {
        const newDepartment: Department = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId || undefined,
          managerId: formData.managerId || undefined,
          costCenter: formData.costCenter || undefined,
          location: formData.location || undefined,
          userCount: 0
        };
        setDepartments(prev => [...prev, newDepartment]);
      } else if (selectedDepartment) {
        setDepartments(prev => prev.map(dept => 
          dept.id === selectedDepartment.id 
            ? { 
                ...dept, 
                name: formData.name,
                description: formData.description,
                parentId: formData.parentId || undefined,
                managerId: formData.managerId || undefined,
                costCenter: formData.costCenter || undefined,
                location: formData.location || undefined
              }
            : dept
        ));
      }
      setIsFormOpen(false);
      onDepartmentChange?.(departments);
    } catch (error) {
      console.error('Erro ao salvar departamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedDepartment) return;
    
    setIsLoading(true);
    try {
      setDepartments(prev => prev.filter(dept => dept.id !== selectedDepartment.id));
      setIsDeleteDialogOpen(false);
      onDepartmentChange?.(departments);
    } catch (error) {
      console.error('Erro ao excluir departamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDepartmentHierarchy = (dept: Department): string => {
    if (!dept.parentId) return dept.name;
    const parent = departments.find(d => d.id === dept.parentId);
    return parent ? `${parent.name} > ${dept.name}` : dept.name;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Departamentos</h2>
          <p className="text-muted-foreground">
            Organize a estrutura hierárquica da sua organização
          </p>
        </div>
        <Button onClick={handleCreateDepartment}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Departamento
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar departamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((department) => (
          <Card key={department.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{department.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditDepartment(department)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteDepartment(department)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {department.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {department.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{department.userCount} usuários</span>
                </div>
                {department.parentId && (
                  <Badge variant="outline" className="text-xs">
                    <FolderTree className="h-3 w-3 mr-1" />
                    Subdepartamento
                  </Badge>
                )}
              </div>

              {department.location && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{department.location}</span>
                </div>
              )}

              {department.costCenter && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Centro de Custo: {department.costCenter}</span>
                </div>
              )}

              {department.parentId && (
                <div className="text-xs text-muted-foreground">
                  Hierarquia: {getDepartmentHierarchy(department)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Criar Departamento' : 'Editar Departamento'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'create' 
                ? 'Adicione um novo departamento à estrutura organizacional.'
                : 'Modifique as informações do departamento selecionado.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Departamento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Tecnologia da Informação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva as responsabilidades do departamento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentId">Departamento Pai</Label>
                <Select 
                  value={formData.parentId || 'none'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (Departamento raiz)</SelectItem>
                    {departments
                      .filter(dept => dept.id !== selectedDepartment?.id)
                      .map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costCenter">Centro de Custo</Label>
                <Input
                  id="costCenter"
                  value={formData.costCenter}
                  onChange={(e) => setFormData(prev => ({ ...prev, costCenter: e.target.value }))}
                  placeholder="Ex: TI-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: São Paulo - SP"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFormSubmit} disabled={!formData.name || isLoading}>
              {isLoading ? 'Salvando...' : formMode === 'create' ? 'Criar' : 'Salvar'}
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
              Tem certeza que deseja excluir o departamento "{selectedDepartment?.name}"?
              Esta ação não pode ser desfeita e todos os usuários deste departamento 
              precisarão ser realocados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentManagement;