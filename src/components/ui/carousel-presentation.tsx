import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Presentation, 
  Save, 
  Upload as UploadIcon, 
  Settings, 
  Eye,
  Trash2,
  Edit3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import CarouselImageUpload, { CarouselImage } from './carousel-image-upload';
import ImageCarousel from './image-carousel';
import { CarouselPresentationData } from '@/hooks/useCarouselPresentation';

interface CarouselPresentationProps {
  initialData?: Partial<CarouselPresentationData>;
  onSave?: (data: CarouselPresentationData) => void;
  onCancel?: () => void;
  className?: string;
  mode?: 'create' | 'edit' | 'view';
}

export default function CarouselPresentation({
  initialData,
  onSave,
  onCancel,
  className,
  mode = 'create'
}: CarouselPresentationProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentView, setCurrentView] = useState<'upload' | 'preview' | 'settings'>('upload');
  
  const [presentationData, setPresentationData] = useState<CarouselPresentationData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    images: initialData?.images || [],
    autoPlay: initialData?.autoPlay ?? true,
    autoPlayInterval: initialData?.autoPlayInterval ?? 3000,
    showControls: initialData?.showControls ?? true,
    showIndicators: initialData?.showIndicators ?? true,
    ...initialData
  });

  /**
   * Atualiza os dados da apresentação
   */
  const updatePresentationData = useCallback((updates: Partial<CarouselPresentationData>) => {
    setPresentationData(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Faz upload das imagens para o Supabase Storage
   */
  const uploadImagesToSupabase = async (images: CarouselImage[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    // Importar wrapper seguro para upload
    const { safeFileUpload } = await import('../../utils/supabaseInterceptor');
    
    for (const image of images) {
      try {
        const fileExt = image.file.name.split('.').pop();
        const fileName = `carousel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `carousel-images/${fileName}`;

        console.log('📤 DEBUG - Fazendo upload da imagem:', filePath);
        
        // Usar wrapper seguro para upload
        const { data, error } = await safeFileUpload(
          'course-images',
          filePath,
          image.file,
          {
            cacheControl: '3600',
            upsert: false
          }
        );

        if (error) {
          console.error('❌ DEBUG - Erro no upload:', error);
          throw error;
        }

        console.log('✅ DEBUG - Upload bem-sucedido:', data);

        const { data: { publicUrl } } = supabase.storage
          .from('course-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        throw new Error(`Falha no upload da imagem ${image.file.name}`);
      }
    }

    return uploadedUrls;
  };

  /**
   * Tenta reautenticar o usuário com retry e validação robusta
   */
  const attemptReauth = async (maxRetries = 2): Promise<boolean> => {
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        console.log(`🔄 Tentativa de reautenticação ${attempt + 1}/${maxRetries + 1}...`);
        
        // Verificar se ainda temos uma sessão válida
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('⚠️ Erro ao obter sessão:', sessionError);
          attempt++;
          continue;
        }
        
        if (!session) {
          console.log('❌ Nenhuma sessão encontrada');
          return false;
        }
        
        // Verificar se a sessão está expirada
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;
        
        if (expiresAt <= now) {
          console.log('⏰ Sessão expirada, tentando refresh...');
          
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.warn('❌ Falha no refresh da sessão:', refreshError);
            attempt++;
            continue;
          }
          
          console.log('✅ Sessão renovada com sucesso');
        }
        
        // Usar a validação robusta de sessão
        const { ensureValidSession } = await import('../../utils/sessionValidator');
        const validation = await ensureValidSession();
        
        if (!validation.isValid) {
          console.log('❌ Falha na validação de sessão:', validation.error);
          attempt++;
          
          // Aguardar um pouco antes da próxima tentativa
          if (attempt <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
          continue;
        }
        
        console.log('✅ Reautenticação bem-sucedida');
        return true;
        
      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempt + 1} de reautenticação:`, error);
        attempt++;
        
        // Aguardar um pouco antes da próxima tentativa
        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    console.error('❌ Todas as tentativas de reautenticação falharam');
    return false;
  };

  /**
   * Salva a apresentação no Supabase com retry automático
   */
  const savePresentation = async (retryCount = 0) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar uma apresentação.",
        variant: "destructive"
      });
      return;
    }

    // Verificação robusta de sessão antes de operações críticas
    try {
      const { ensureValidSession } = await import('../../utils/sessionValidator');
      const validation = await ensureValidSession();
      
      if (!validation.isValid) {
        console.error('❌ Sessão inválida:', validation.error);
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Sessão validada para operação de salvamento');
    } catch (error) {
      console.error('❌ Erro na validação de sessão:', error);
      toast({
        title: "Erro na validação",
        description: "Erro na validação de sessão. Tente novamente.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se a sessão ainda está ativa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('❌ DEBUG - Sessão inválida:', sessionError);
      toast({
        title: "Sessão expirada",
        description: "Sua sessão expirou. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    if (!presentationData.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Digite um título para a apresentação.",
        variant: "destructive"
      });
      return;
    }

    if (presentationData.images.length === 0) {
      toast({
        title: "Imagens obrigatórias",
        description: "Adicione pelo menos uma imagem à apresentação.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    setIsUploading(true);

    try {
      // Upload das imagens
      const imageUrls = await uploadImagesToSupabase(presentationData.images);
      
      // Prepara os dados para salvar
      const presentationToSave = {
        title: presentationData.title,
        description: presentationData.description,
        user_id: user.id,
        image_urls: imageUrls,
        image_captions: presentationData.images.map(img => img.caption || ''),
        auto_play: presentationData.autoPlay,
        auto_play_interval: presentationData.autoPlayInterval,
        show_controls: presentationData.showControls,
        show_indicators: presentationData.showIndicators,
        slide_count: imageUrls.length
      };
      
      // Debug logs para verificar dados sendo enviados
      console.log('📊 DEBUG - Dados sendo enviados para Supabase:');
      console.log('   - presentationToSave:', presentationToSave);
      console.log('   - user_id value:', presentationToSave.user_id);
      console.log('   - user_id type:', typeof presentationToSave.user_id);

      // Usar wrapper seguro para operações de banco
        const { safeDatabaseOperation } = await import('../../utils/supabaseInterceptor');
        
        let result;
        if (presentationData.id) {
          // Atualizar apresentação existente
          result = await safeDatabaseOperation(
            () => supabase
              .from('carousel_presentations')
              .update(presentationToSave)
              .eq('id', presentationData.id)
              .select()
              .single(),
            'Atualização de apresentação'
          );
        } else {
          // Criar nova apresentação
          result = await safeDatabaseOperation(
            () => supabase
              .from('carousel_presentations')
              .insert(presentationToSave)
              .select()
              .single(),
            'Criação de apresentação'
          );
        }

      if (result.error) {
        console.error('❌ DEBUG - Erro do Supabase:', result.error);
        console.log('   - Código:', result.error.code);
        console.log('   - Mensagem:', result.error.message);
        console.log('   - Detalhes:', result.error.details);
        console.log('   - Hint:', result.error.hint);
        throw result.error;
      }
      
      console.log('✅ DEBUG - Operação no Supabase bem-sucedida:', result.data);

      toast({
        title: "Sucesso!",
        description: `Apresentação ${presentationData.id ? 'atualizada' : 'criada'} com sucesso.`
      });

      // Chama callback de salvamento
      onSave?.({
        ...presentationData,
        id: result.data.id
      });

      setIsOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar apresentação:', error);
      
      // Tratamento específico para erro P0001 (autenticação) com retry inteligente
      if (error?.code === 'P0001' || error?.message?.includes('P0001')) {
        console.error('❌ DEBUG - Erro P0001 detectado:', error);
        
        // Tentar reautenticar automaticamente com backoff exponencial (máximo 3 tentativas)
        if (retryCount < 2) {
          console.log(`🔄 DEBUG - Tentativa de retry ${retryCount + 1}/3`);
          
          // Implementar backoff exponencial: 1s, 2s, 4s
          const backoffDelay = Math.pow(2, retryCount) * 1000;
          console.log(`⏱️ Aguardando ${backoffDelay}ms antes do retry...`);
          
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          
          const reAuthSuccess = await attemptReauth();
          
          if (reAuthSuccess) {
            console.log(`✅ DEBUG - Reautenticação bem-sucedida (tentativa ${retryCount + 1}), tentando novamente...`);
            // Retry da operação com contador incrementado
            setTimeout(() => savePresentation(retryCount + 1), 500);
            return;
          }
        }
        
        // Se chegou aqui, falhou na reautenticação ou excedeu tentativas
        console.error(`❌ Falha definitiva após ${retryCount + 1} tentativas de reautenticação`);
        toast({
          title: "Erro de Autenticação",
          description: "Sua sessão expirou e não foi possível renovar. Faça login novamente.",
          variant: "destructive"
        });
        
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Erro ao fazer logout:', signOutError);
        }
      } else {
        // Outros erros
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a apresentação. Tente novamente.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  /**
   * Cancela a edição
   */
  const handleCancel = () => {
    setIsOpen(false);
    onCancel?.();
  };

  /**
   * Renderiza o conteúdo baseado na view atual
   */
  const renderContent = () => {
    switch (currentView) {
      case 'upload':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título da Apresentação *</Label>
                <Input
                  id="title"
                  value={presentationData.title}
                  onChange={(e) => updatePresentationData({ title: e.target.value })}
                  placeholder="Digite o título..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={presentationData.description}
                  onChange={(e) => updatePresentationData({ description: e.target.value })}
                  placeholder="Descrição opcional..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            
            <div>
              <Label>Imagens da Apresentação</Label>
              <div className="mt-2">
                <CarouselImageUpload
                  onImagesSelected={(images) => updatePresentationData({ images })}
                  maxImages={20}
                />
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{presentationData.title}</h3>
              {presentationData.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {presentationData.description}
                </p>
              )}
            </div>
            
            <ImageCarousel
              images={presentationData.images}
              autoPlay={presentationData.autoPlay}
              autoPlayInterval={presentationData.autoPlayInterval}
              showControls={presentationData.showControls}
              showIndicators={presentationData.showIndicators}
              className="max-w-2xl mx-auto"
            />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Configurações da Apresentação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoPlay"
                    checked={presentationData.autoPlay}
                    onChange={(e) => updatePresentationData({ autoPlay: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="autoPlay">Reprodução automática</Label>
                </div>
                
                {presentationData.autoPlay && (
                  <div>
                    <Label htmlFor="interval">Intervalo (ms)</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1000"
                      max="10000"
                      step="500"
                      value={presentationData.autoPlayInterval}
                      onChange={(e) => updatePresentationData({ 
                        autoPlayInterval: parseInt(e.target.value) || 3000 
                      })}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showControls"
                    checked={presentationData.showControls}
                    onChange={(e) => updatePresentationData({ showControls: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="showControls">Mostrar controles</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showIndicators"
                    checked={presentationData.showIndicators}
                    onChange={(e) => updatePresentationData({ showIndicators: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="showIndicators">Mostrar indicadores</Label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Se for modo view, renderiza apenas o carrossel
  if (mode === 'view') {
    return (
      <div className={cn("w-full", className)}>
        <ImageCarousel
          images={presentationData.images}
          autoPlay={presentationData.autoPlay}
          autoPlayInterval={presentationData.autoPlayInterval}
          showControls={presentationData.showControls}
          showIndicators={presentationData.showIndicators}
        />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Presentation className="h-4 w-4" />
          {mode === 'edit' ? 'Editar Apresentação' : 'Criar Apresentação'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            {mode === 'edit' ? 'Editar Apresentação' : 'Nova Apresentação de Carrossel'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Navegação por abas */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={currentView === 'upload' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('upload')}
              className="flex-1"
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Conteúdo
            </Button>
            <Button
              variant={currentView === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('preview')}
              className="flex-1"
              disabled={presentationData.images.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button
              variant={currentView === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('settings')}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>

          {/* Conteúdo da aba atual */}
          <div className="min-h-[400px]">
            {renderContent()}
          </div>

          {/* Indicador de upload */}
          {isUploading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Fazendo upload das imagens...
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              {currentView !== 'preview' && presentationData.images.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('preview')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              )}
              <Button 
                onClick={savePresentation}
                disabled={isSaving || presentationData.images.length === 0 || !presentationData.title.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : (mode === 'edit' ? 'Atualizar' : 'Salvar')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Tipos para exportação
export type { CarouselPresentationData };
