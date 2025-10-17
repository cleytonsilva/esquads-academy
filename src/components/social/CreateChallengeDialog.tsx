import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target, Star, Users, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSocialChallenges } from '@/hooks/useSocialChallenges';
import { toast } from 'sonner';

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChallengeCreated: () => void;
}

export function CreateChallengeDialog({ 
  open, 
  onOpenChange, 
  onChallengeCreated 
}: CreateChallengeDialogProps) {
  const { createChallenge } = useSocialChallenges();
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState<Date>();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: '',
    target_value: '',
    reward_points: ''
  });

  const challengeTypes = [
    {
      value: 'posts',
      label: 'Criar Posts',
      description: 'Desafio para criar um número específico de posts',
      icon: <Star className="h-4 w-4" />
    },
    {
      value: 'likes',
      label: 'Receber Curtidas',
      description: 'Desafio para receber curtidas em seus posts',
      icon: <Target className="h-4 w-4" />
    },
    {
      value: 'comments',
      label: 'Fazer Comentários',
      description: 'Desafio para comentar em posts de outros usuários',
      icon: <Users className="h-4 w-4" />
    },
    {
      value: 'streak',
      label: 'Sequência de Atividade',
      description: 'Desafio para manter atividade diária consecutiva',
      icon: <Zap className="h-4 w-4" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.challenge_type) {
      toast.error('Tipo de desafio é obrigatório');
      return;
    }

    if (!formData.target_value || parseInt(formData.target_value) <= 0) {
      toast.error('Meta deve ser um número positivo');
      return;
    }

    if (!endDate) {
      toast.error('Data de término é obrigatória');
      return;
    }

    if (endDate <= new Date()) {
      toast.error('Data de término deve ser no futuro');
      return;
    }

    setLoading(true);
    try {
      await createChallenge({
        title: formData.title.trim(),
        description: formData.description.trim(),
        challenge_type: formData.challenge_type,
        target_value: parseInt(formData.target_value),
        end_date: endDate.toISOString(),
        reward_points: parseInt(formData.reward_points) || 0
      });

      onChallengeCreated();
      handleClose();
    } catch (error) {
      console.error('Erro ao criar desafio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      title: '',
      description: '',
      challenge_type: '',
      target_value: '',
      reward_points: ''
    });
    setEndDate(undefined);
  };

  const getTargetLabel = () => {
    switch (formData.challenge_type) {
      case 'posts':
        return 'Número de posts';
      case 'likes':
        return 'Número de curtidas';
      case 'comments':
        return 'Número de comentários';
      case 'streak':
        return 'Dias consecutivos';
      default:
        return 'Meta';
    }
  };

  const getTargetPlaceholder = () => {
    switch (formData.challenge_type) {
      case 'posts':
        return 'Ex: 10 posts';
      case 'likes':
        return 'Ex: 50 curtidas';
      case 'comments':
        return 'Ex: 25 comentários';
      case 'streak':
        return 'Ex: 7 dias';
      default:
        return 'Digite a meta';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Criar Novo Desafio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Desafio</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Desafio dos 10 Posts"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o desafio e suas regras..."
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Challenge Type */}
          <div className="space-y-2">
            <Label>Tipo de Desafio</Label>
            <Select 
              value={formData.challenge_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, challenge_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de desafio" />
              </SelectTrigger>
              <SelectContent>
                {challengeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label htmlFor="target_value">{getTargetLabel()}</Label>
            <Input
              id="target_value"
              type="number"
              value={formData.target_value}
              onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
              placeholder={getTargetPlaceholder()}
              min="1"
              max="1000"
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>Data de Término</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data de término</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date <= new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reward Points */}
          <div className="space-y-2">
            <Label htmlFor="reward_points">Pontos de Recompensa (opcional)</Label>
            <Input
              id="reward_points"
              type="number"
              value={formData.reward_points}
              onChange={(e) => setFormData(prev => ({ ...prev, reward_points: e.target.value }))}
              placeholder="Ex: 100 pontos"
              min="0"
              max="1000"
            />
            <p className="text-xs text-gray-500">
              Pontos que os participantes ganharão ao completar o desafio
            </p>
          </div>

          {/* Preview */}
          {formData.challenge_type && formData.target_value && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Preview do Desafio:</h4>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Objetivo:</strong> {
                    challengeTypes.find(t => t.value === formData.challenge_type)?.label
                  } - {formData.target_value}
                </p>
                {endDate && (
                  <p>
                    <strong>Prazo:</strong> até {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
                {formData.reward_points && (
                  <p>
                    <strong>Recompensa:</strong> {formData.reward_points} pontos
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              Criar Desafio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}