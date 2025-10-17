import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { toast } from 'sonner';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

interface Course {
  id: string;
  title: string;
}

export function CreatePostDialog({ 
  open, 
  onOpenChange, 
  onPostCreated 
}: CreatePostDialogProps) {
  const { createPost } = useSocialFeed();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'discussion',
    course_id: '',
    tags: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('status', 'published')
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      await createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        post_type: formData.post_type,
        course_id: formData.course_id || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      });

      toast.success('Post criado com sucesso!');
      onPostCreated();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        post_type: 'discussion',
        course_id: '',
        tags: []
      });
      setNewTag('');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao criar post. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Post */}
          <div className="space-y-2">
            <Label htmlFor="post_type">Tipo de Post</Label>
            <Select
              value={formData.post_type}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, post_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discussion">Discussão</SelectItem>
                <SelectItem value="question">Pergunta</SelectItem>
                <SelectItem value="achievement">Conquista</SelectItem>
                <SelectItem value="announcement">Anúncio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Curso (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="course_id">Curso (Opcional)</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, course_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um curso..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum curso</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              placeholder="Digite o título do seu post..."
              maxLength={200}
              required
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/200 caracteres
            </p>
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, content: e.target.value }))
              }
              placeholder="Compartilhe seus pensamentos, dúvidas ou conquistas..."
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500">
              {formData.content.length}/2000 caracteres
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Máximo 5)</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Adicionar tag..."
                maxLength={20}
                disabled={formData.tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!newTag.trim() || formData.tags.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}