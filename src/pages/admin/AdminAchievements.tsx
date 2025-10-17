import React, { useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Trophy, 
  Target, 
  Award, 
  Star,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import type { Achievement, Badge as BadgeType } from '@/types/achievements';

interface NewAchievementForm {
  title: string;
  description: string;
  category: string;
  type: 'mission' | 'streak' | 'points' | 'time' | 'special';
  points: number;
  requirements: {
    missions_completed?: number;
    streak_days?: number;
    total_points?: number;
    time_spent_hours?: number;
    special_condition?: string;
  };
  badge_id?: string;
  is_active: boolean;
}

interface NewBadgeForm {
  name: string;
  description: string;
  icon_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
}

const AdminAchievements: React.FC = () => {
  const { user } = useAuth();
  const { 
    achievements, 
    badges, 
    loading, 
    error, 
    stats,
    refreshData 
  } = useAchievements();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('achievements');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Achievement | BadgeType | null>(null);

  const [newAchievement, setNewAchievement] = useState<NewAchievementForm>({
    title: '',
    description: '',
    category: '',
    type: 'mission',
    points: 0,
    requirements: {},
    is_active: true
  });

  const [newBadge, setNewBadge] = useState<NewBadgeForm>({
    name: '',
    description: '',
    icon_url: '',
    rarity: 'common',
    color: '#3B82F6'
  });

  // Verificar se o usuário é admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
            <CardDescription className="text-center">
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateAchievement = async () => {
    try {
      // Aqui você implementaria a criação do achievement
      toast.success('Achievement criado com sucesso!');
      setIsCreateDialogOpen(false);
      setNewAchievement({
        title: '',
        description: '',
        category: '',
        type: 'mission',
        points: 0,
        requirements: {},
        is_active: true
      });
      refreshData();
    } catch (error) {
      toast.error('Erro ao criar achievement');
    }
  };

  const handleCreateBadge = async () => {
    try {
      // Aqui você implementaria a criação do badge
      toast.success('Badge criado com sucesso!');
      setIsCreateDialogOpen(false);
      setNewBadge({
        name: '',
        description: '',
        icon_url: '',
        rarity: 'common',
        color: '#3B82F6'
      });
      refreshData();
    } catch (error) {
      toast.error('Erro ao criar badge');
    }
  };

  const handleEdit = (item: Achievement | BadgeType) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, type: 'achievement' | 'badge') => {
    if (!confirm(`Tem certeza que deseja excluir este ${type}?`)) return;
    
    try {
      // Aqui você implementaria a exclusão
      toast.success(`${type} excluído com sucesso!`);
      refreshData();
    } catch (error) {
      toast.error(`Erro ao excluir ${type}`);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Erro</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Achievements</h1>
          <p className="text-muted-foreground">
            Administre achievements e badges do sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Criar Novo {activeTab === 'achievements' ? 'Achievement' : 'Badge'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo {activeTab === 'achievements' ? 'achievement' : 'badge'}
              </DialogDescription>
            </DialogHeader>
            
            {activeTab === 'achievements' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome do achievement"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={newAchievement.category}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Ex: missões, pontos, tempo"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do achievement"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={newAchievement.type} 
                      onValueChange={(value: any) => setNewAchievement(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mission">Missão</SelectItem>
                        <SelectItem value="streak">Sequência</SelectItem>
                        <SelectItem value="points">Pontos</SelectItem>
                        <SelectItem value="time">Tempo</SelectItem>
                        <SelectItem value="special">Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="points">Pontos</Label>
                    <Input
                      id="points"
                      type="number"
                      value={newAchievement.points}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badge-name">Nome</Label>
                    <Input
                      id="badge-name"
                      value={newBadge.name}
                      onChange={(e) => setNewBadge(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do badge"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rarity">Raridade</Label>
                    <Select 
                      value={newBadge.rarity} 
                      onValueChange={(value: any) => setNewBadge(prev => ({ ...prev, rarity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Comum</SelectItem>
                        <SelectItem value="rare">Raro</SelectItem>
                        <SelectItem value="epic">Épico</SelectItem>
                        <SelectItem value="legendary">Lendário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="badge-description">Descrição</Label>
                  <Textarea
                    id="badge-description"
                    value={newBadge.description}
                    onChange={(e) => setNewBadge(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do badge"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon-url">URL do Ícone</Label>
                    <Input
                      id="icon-url"
                      value={newBadge.icon_url}
                      onChange={(e) => setNewBadge(prev => ({ ...prev, icon_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      type="color"
                      value={newBadge.color}
                      onChange={(e) => setNewBadge(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={activeTab === 'achievements' ? handleCreateAchievement : handleCreateBadge}>
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {achievements.filter(a => a.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários com Achievements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'achievements' && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="missões">Missões</SelectItem>
                  <SelectItem value="pontos">Pontos</SelectItem>
                  <SelectItem value="tempo">Tempo</SelectItem>
                  <SelectItem value="especial">Especial</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Achievements</CardTitle>
              <CardDescription>
                Gerencie todos os achievements do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAchievements.map((achievement) => (
                    <TableRow key={achievement.id}>
                      <TableCell className="font-medium">
                        {achievement.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{achievement.category}</Badge>
                      </TableCell>
                      <TableCell>{achievement.type}</TableCell>
                      <TableCell>{achievement.points}</TableCell>
                      <TableCell>
                        <Badge variant={achievement.is_active ? "default" : "secondary"}>
                          {achievement.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(achievement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(achievement.id, 'achievement')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Badges</CardTitle>
              <CardDescription>
                Gerencie todos os badges do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Raridade</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBadges.map((badge) => (
                    <TableRow key={badge.id}>
                      <TableCell className="font-medium">
                        {badge.name}
                      </TableCell>
                      <TableCell>{badge.description}</TableCell>
                      <TableCell>
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: badge.color }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(badge)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(badge.id, 'badge')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAchievements;