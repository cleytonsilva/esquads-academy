import { useCallback, useState } from 'react';
import { toast as showToast } from '@/hooks/use-toast';

/**
 * Hook para gerenciar atualizações de cursos
 * Fornece callbacks para atualização manual da interface
 */
export function useRealtimeCourseUpdates({
  onCoverUpdated,
  courseId
}: {
  onCoverUpdated?: (courseId: string, newImageUrl: string) => void;
  courseId?: string;
}) {
  console.log('[COURSE_UPDATES] 🚀 Hook iniciado para curso:', courseId);
  const [isConnected, setIsConnected] = useState(true); // Sempre conectado para callbacks manuais
  const handleCoverUpdate = useCallback((courseId: string, newImageUrl: string) => {
    console.log('[COURSE_UPDATES] 🎨 Processando atualização de capa:', { courseId, newImageUrl });
    
    showToast({
      title: "Capa Atualizada!",
      description: "A capa do curso foi atualizada com sucesso."
    });
    
    console.log('[COURSE_UPDATES] 🎨 Chamando onCoverUpdated callback...');
    onCoverUpdated?.(courseId, newImageUrl);
  }, [onCoverUpdated]);

  const handleProgressUpdate = useCallback((status: string, details?: any) => {
    switch (status) {
      case 'starting':
        showToast({
          title: "Info",
          description: "Iniciando geração de capa..."
        });
        break;
      case 'calling_api':
        showToast({
          title: "Info",
          description: "Processando com IA..."
        });
        break;
      case 'prediction_created':
        showToast({
          title: "Info",
          description: "Predição criada! Aguardando resultado..."
        });
        break;
      case 'failed':
        showToast({
          title: "Erro",
          description: `Erro na geração: ${details?.error || 'Erro desconhecido'}`,
          variant: "destructive"
        });
        break;
    }
  }, []);

  // Função para notificar atualização de capa manualmente
  const notifyCoverUpdate = useCallback((courseId: string, newImageUrl: string) => {
    handleCoverUpdate(courseId, newImageUrl);
  }, [handleCoverUpdate]);

  // Função para notificar progresso manualmente
  const notifyProgress = useCallback((status: string, details?: any) => {
    handleProgressUpdate(status, details);
  }, [handleProgressUpdate]);

  return {
    isConnected,
    notifyCoverUpdate,
    notifyProgress
  };
}

/**
 * Hook simplificado para monitoramento global de atualizações
 */
export function useGlobalCourseUpdates() {
  return useRealtimeCourseUpdates({
    onCoverUpdated: (courseId, newImageUrl) => {
      console.log('[GLOBAL] Curso atualizado:', courseId, newImageUrl);
      
      // Invalidar cache da imagem
      const img = new Image();
      img.src = newImageUrl + '?t=' + Date.now();
      
      // Atualizar qualquer elemento de imagem na página
      const images = document.querySelectorAll(`img[src*="${courseId}"]`);
      images.forEach((img) => {
        const element = img as HTMLImageElement;
        const currentSrc = element.src;
        element.src = '';
        setTimeout(() => {
          element.src = newImageUrl + '?t=' + Date.now();
        }, 100);
      });
    }
  });
}
