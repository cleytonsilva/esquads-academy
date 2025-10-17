/**
 * Utilitários para otimização de performance
 * Inclui debounce, throttle, lazy loading e outras otimizações
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  const lastFunc = useRef<NodeJS.Timeout>();
  const lastRan = useRef<number>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (!lastRan.current) {
        func(...args);
        lastRan.current = Date.now();
      } else {
        clearTimeout(lastFunc.current);
        lastFunc.current = setTimeout(() => {
          if (Date.now() - (lastRan.current || 0) >= limit) {
            func(...args);
            lastRan.current = Date.now();
          }
        }, limit - (Date.now() - lastRan.current));
      }
    },
    [func, limit]
  ) as T;
}

// Hook para lazy loading de imagens
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, options]);

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsError(true);
    img.src = imageSrc;
  }, [imageSrc]);

  return {
    imgRef,
    src: imageSrc,
    isLoaded,
    isError
  };
}

// Hook para detectar se o elemento está visível
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return {
    elementRef,
    isIntersecting,
    entry
  };
}

// Hook para medir performance de componentes
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(Date.now());
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - renderStartTime.current;
    setRenderTime(duration);

    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(`⚠️ Componente ${componentName} demorou ${duration}ms para renderizar`);
    }
  });

  // Atualizar tempo de início a cada render
  renderStartTime.current = Date.now();

  return renderTime;
}

// Função para medir performance de funções
export function measurePerformance<T extends (...args: any[]) => any>(
  func: T,
  name?: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    const duration = end - start;
    const functionName = name || func.name || 'anonymous';
    
    if (process.env.NODE_ENV === 'development' && duration > 10) {
      console.log(`⏱️ ${functionName}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
}

// Hook para otimizar re-renders com memoização inteligente
export function useSmartMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  isEqual?: (a: T, b: T) => boolean
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    const newValue = factory();
    
    // Se há uma função de comparação customizada, usar ela
    if (ref.current && isEqual && isEqual(ref.current.value, newValue)) {
      return ref.current.value;
    }
    
    ref.current = { deps: [...deps], value: newValue };
  }

  return ref.current.value;
}

// Função auxiliar para comparar arrays de dependências
function areEqual(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => Object.is(item, b[index]));
}

// Hook para batch de atualizações de estado
export function useBatchedState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const batchedUpdates = useRef<Partial<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((update: Partial<T>) => {
    batchedUpdates.current.push(update);
    
    // Cancelar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Agendar aplicação das atualizações
    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        let newState = { ...prevState };
        batchedUpdates.current.forEach(update => {
          newState = { ...newState, ...update };
        });
        batchedUpdates.current = [];
        return newState;
      });
    }, 0);
  }, []);

  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState(prevState => {
      let newState = { ...prevState };
      batchedUpdates.current.forEach(update => {
        newState = { ...newState, ...update };
      });
      batchedUpdates.current = [];
      return newState;
    });
  }, []);

  return [state, batchUpdate, flushUpdates] as const;
}

// Função para criar um pool de objetos reutilizáveis
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize: number = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool = [];
  }

  get size(): number {
    return this.pool.length;
  }
}

// Função para otimizar arrays grandes
export function optimizeArrayOperations<T>(
  array: T[],
  chunkSize: number = 1000
) {
  return {
    // Processar array em chunks para evitar bloqueio da UI
    processInChunks: async (
      processor: (chunk: T[]) => void | Promise<void>
    ): Promise<void> => {
      for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        await processor(chunk);
        
        // Dar uma pausa para não bloquear a UI
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    },

    // Busca otimizada
    findOptimized: (predicate: (item: T) => boolean): T | undefined => {
      // Para arrays pequenos, usar find normal
      if (array.length < 1000) {
        return array.find(predicate);
      }

      // Para arrays grandes, usar busca em chunks
      for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        const found = chunk.find(predicate);
        if (found) return found;
      }
      return undefined;
    },

    // Filtro otimizado
    filterOptimized: async (
      predicate: (item: T) => boolean
    ): Promise<T[]> => {
      const result: T[] = [];
      
      await optimizeArrayOperations(array).processInChunks(chunk => {
        result.push(...chunk.filter(predicate));
      });
      
      return result;
    }
  };
}