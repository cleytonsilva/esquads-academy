import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CarouselImage } from './carousel-image-upload';

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  onSlideChange?: (index: number) => void;
}

export default function ImageCarousel({
  images,
  autoPlay = false,
  autoPlayInterval = 3000,
  showControls = true,
  showIndicators = true,
  className,
  onSlideChange
}: ImageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  /**
   * Vai para o próximo slide
   */
  const nextSlide = useCallback(() => {
    if (images.length === 0) return;
    const next = (currentSlide + 1) % images.length;
    setCurrentSlide(next);
    onSlideChange?.(next);
  }, [currentSlide, images.length, onSlideChange]);

  /**
   * Vai para o slide anterior
   */
  const prevSlide = useCallback(() => {
    if (images.length === 0) return;
    const prev = currentSlide === 0 ? images.length - 1 : currentSlide - 1;
    setCurrentSlide(prev);
    onSlideChange?.(prev);
  }, [currentSlide, images.length, onSlideChange]);

  /**
   * Vai para um slide específico
   */
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentSlide(index);
      onSlideChange?.(index);
    }
  }, [images.length, onSlideChange]);

  /**
   * Reinicia a apresentação
   */
  const restartSlideshow = useCallback(() => {
    setCurrentSlide(0);
    onSlideChange?.(0);
  }, [onSlideChange]);

  /**
   * Alterna entre play/pause
   */
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  /**
   * Alterna fullscreen
   */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      carouselRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  /**
   * Manipula teclas do teclado
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSlide();
        break;
      case ' ':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'Escape':
        if (isFullscreen) {
          toggleFullscreen();
        }
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(images.length - 1);
        break;
    }
  }, [prevSlide, nextSlide, togglePlayPause, isFullscreen, toggleFullscreen, goToSlide, images.length]);

  /**
   * Configura o autoplay
   */
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(nextSlide, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, images.length, nextSlide, autoPlayInterval]);

  /**
   * Adiciona listeners de teclado
   */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Listener para mudanças de fullscreen
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  /**
   * Reseta o slide atual se não há imagens
   */
  useEffect(() => {
    if (images.length === 0) {
      setCurrentSlide(0);
    } else if (currentSlide >= images.length) {
      setCurrentSlide(images.length - 1);
    }
  }, [images.length, currentSlide]);

  // Se não há imagens, mostra placeholder
  if (images.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-2">📷</div>
            <p>Nenhuma imagem adicionada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentImage = images[currentSlide];

  return (
    <div 
      ref={carouselRef}
      className={cn(
        "relative w-full bg-black rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      role="region"
      aria-label="Carrossel de imagens"
      aria-live="polite"
    >
      {/* Imagem principal */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={currentImage.preview}
          alt={currentImage.caption || `Slide ${currentSlide + 1}`}
          className="w-full h-full object-contain transition-opacity duration-500"
          loading="lazy"
        />
        
        {/* Overlay com gradiente para melhor legibilidade dos controles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
        
        {/* Legenda */}
        {currentImage.caption && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/70 text-white px-3 py-2 rounded text-sm backdrop-blur-sm">
              {currentImage.caption}
            </div>
          </div>
        )}
      </div>

      {/* Controles de navegação */}
      {showControls && images.length > 1 && (
        <>
          {/* Botão anterior */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={prevSlide}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Botão próximo */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={nextSlide}
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Controles superiores */}
      {showControls && (
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Controle de play/pause */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pausar apresentação" : "Iniciar apresentação"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}

          {/* Botão de reiniciar */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={restartSlideshow}
              aria-label="Reiniciar apresentação"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {/* Botão de fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Sair do modo tela cheia" : "Modo tela cheia"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Indicadores de slide */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentSlide 
                  ? "bg-white scale-125" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Contador de slides */}
      <div className="absolute top-4 left-4">
        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
          {currentSlide + 1} / {images.length}
        </div>
      </div>

      {/* Indicador de autoplay */}
      {isPlaying && images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            AUTO
          </div>
        </div>
      )}
    </div>
  );
}

// Hook personalizado para usar o carrossel
export function useImageCarousel(images: CarouselImage[]) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextSlide = useCallback(() => {
    if (images.length === 0) return;
    setCurrentSlide(prev => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    if (images.length === 0) return;
    setCurrentSlide(prev => prev === 0 ? images.length - 1 : prev - 1);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentSlide(index);
    }
  }, [images.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return {
    currentSlide,
    isPlaying,
    nextSlide,
    prevSlide,
    goToSlide,
    togglePlayPause,
    setCurrentSlide,
    setIsPlaying
  };
}
