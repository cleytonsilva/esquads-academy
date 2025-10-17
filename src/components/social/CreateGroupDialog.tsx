import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { X, Plus, Users, Lock, Globe } from 'lucide-react';
import { useStudyGroups } from '@/hooks/useStudyGroups';
import { toast } from 'sonner';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: () => void;
}

export function CreateGroupDialog({ 
  open, 
  onOpenChange, 
  onGroupCreated 
}: CreateGroupDialogProps) {
  const { createGroup } = useStudyGroups();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'public' as 'public' | 'private',
    subject: '',
    max_members: 20,
    tags: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');
  const [hasMaxMembers, setHasMaxMembers] = useState(true);

  const subjects = [
    'Cibersegurança',
    'Programação',
    'Redes',
    'Linux',
    'Hacking Ético',
    'Certificações',
    'Python',
    'JavaScript',
    'Banco de Dados',
    'Cloud Computing',
    'DevOps',
    'Análise de Dados'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }

    if (formData.name.length < 3) {
      toast.error('Nome do grupo deve ter pelo menos 3 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        group_type: formData.group_type,
        subject: formData.subject || undefined,
        max_members: hasMaxMembers ? formData.max_members : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      });

      onGroupCreated();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        group_type: 'public',
        subject: '',
        max_members: 20,
        tags: []
      });
      setNewTag('');
      setHasMaxMembers(true);
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
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
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Criar Grupo de Estudo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Grupo */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Grupo de Cibersegurança Avançada"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500">
              {formData.name.length}/100 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Descreva o objetivo e foco do grupo..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          {/* Tipo de Grupo */}
          <div className="space-y-2">
            <Label>Tipo de Grupo</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.group_type === 'public' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, group_type: 'public' }))}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Público</h4>
                    <p className="text-sm text-gray-600">
                      Qualquer pessoa pode entrar
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.group_type === 'private' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, group_type: 'private' }))}
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="font-medium">Privado</h4>
                    <p className="text-sm text-gray-600">
                      Apenas por convite
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assunto */}
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto Principal</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, subject: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um assunto..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum assunto específico</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Limite de Membros */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="max_members">Limite de Membros</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="has-limit" className="text-sm">
                  Definir limite
                </Label>
                <Switch
                  id="has-limit"
                  checked={hasMaxMembers}
                  onCheckedChange={setHasMaxMembers}
                />
              </div>
            </div>
            
            {hasMaxMembers && (
              <div className="space-y-2">
                <Input
                  type="number"
                  value={formData.max_members}
                  onChange={(e) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      max_members: Math.max(2, Math.min(100, parseInt(e.target.value) || 20))
                    }))
                  }
                  min={2}
                  max={100}
                />
                <p className="text-xs text-gray-500">
                  Mínimo: 2 membros, Máximo: 100 membros
                </p>
              </div>
            )}
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
            
            <div className="text-xs text-gray-500">
              Tags ajudam outros estudantes a encontrar seu grupo
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Resumo do Grupo:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nome:</strong> {formData.name || 'Não definido'}</p>
              <p><strong>Tipo:</strong> {formData.group_type === 'public' ? 'Público' : 'Privado'}</p>
              {formData.subject && (
                <p><strong>Assunto:</strong> {formData.subject}</p>
              )}
              <p><strong>Limite:</strong> {hasMaxMembers ? `${formData.max_members} membros` : 'Sem limite'}</p>
            </div>
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
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Criando...' : 'Criar Grupo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}