import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Share2, Upload, X } from 'lucide-react';
import { useAchievementPosts } from '@/hooks/useAchievementPosts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  points: number;
}

interface ShareAchievementProps {
  trigger?: React.ReactNode;
  achievementId?: string;
}

export function ShareAchievement({ trigger, achievementId }: ShareAchievementProps) {
  const [open, setOpen] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<string>(achievementId || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  
  const { user } = useAuth();
  const { createPost } = useAchievementPosts();

  useEffect(() => {
    if (open && user) {
      fetchUserAchievements();
    }
  }, [open, user]);

  useEffect(() => {
    if (selectedAchievement && achievements.length > 0) {
      const achievement = achievements.find(a => a.id === selectedAchievement);
      if (achievement && !title) {
        setTitle(`Conquistei: ${achievement.name}!`);
      }
    }
  }, [selectedAchievement, achievements, title]);

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      setLoadingAchievements(true);
      
      // Buscar conquistas do usuário
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (userError) throw userError;

      if (userAchievements && userAchievements.length > 0) {
        const achievementIds = userAchievements.map(ua => ua.achievement_id);
        
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .in('id', achievementIds);

        if (achievementsError) throw achievementsError;

        setAchievements(achievementsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      toast.error('Erro ao carregar suas conquistas');
    } finally {
      setLoadingAchievements(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `achievement-posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedAchievement || !title.trim()) {
      toast.error('Selecione uma conquista e adicione um título');
      return;
    }

    try {
      setLoading(true);

      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile) || undefined;
      }

      const post = await createPost({
        achievement_id: selectedAchievement,
        title: title.trim(),
        content: content.trim() || undefined,
        image_url: imageUrl,
        visibility
      });

      if (post) {
        toast.success('Conquista compartilhada com sucesso!');
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao compartilhar conquista:', error);
      toast.error('Erro ao compartilhar conquista');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAchievement(achievementId || '');
    setTitle('');
    setContent('');
    setVisibility('public');
    setImageFile(null);
    setImagePreview(null);
  };

  const selectedAchievementData = achievements.find(a => a.id === selectedAchievement);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Compartilhar Conquista</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Compartilhar Conquista</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Conquista */}
          <div className="space-y-2">
            <Label htmlFor="achievement">Conquista</Label>
            {loadingAchievements ? (
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            ) : (
              <Select value={selectedAchievement} onValueChange={setSelectedAchievement}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conquista para compartilhar" />
                </SelectTrigger>
                <SelectContent>
                  {achievements.map((achievement) => (
                    <SelectItem key={achievement.id} value={achievement.id}>
                      <div className="flex items-center space-x-2">
                        {achievement.icon_url ? (
                          <img 
                            src={achievement.icon_url} 
                            alt={achievement.name}
                            className="h-6 w-6 rounded"
                          />
                        ) : (
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        )}
                        <span>{achievement.name}</span>
                        <Badge variant="secondary">{achievement.points} XP</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Preview da Conquista Selecionada */}
          {selectedAchievementData && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {selectedAchievementData.icon_url ? (
                    <img 
                      src={selectedAchievementData.icon_url} 
                      alt={selectedAchievementData.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{selectedAchievementData.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAchievementData.description}</p>
                    <Badge variant="secondary" className="mt-1">
                      {selectedAchievementData.points} XP
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Conquistei minha primeira certificação!"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{title.length}/100</p>
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="content">Descrição (opcional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conte mais sobre sua conquista..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{content.length}/500</p>
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <Label>Imagem (opcional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para adicionar uma imagem
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Selecionar Imagem
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Visibilidade */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibilidade</Label>
            <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Público - Todos podem ver</SelectItem>
                <SelectItem value="friends">Amigos - Apenas amigos podem ver</SelectItem>
                <SelectItem value="private">Privado - Apenas você pode ver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !selectedAchievement || !title.trim()}
            >
              {loading ? 'Compartilhando...' : 'Compartilhar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}