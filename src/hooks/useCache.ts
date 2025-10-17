/**
 * Hook para gerenciamento de cache reativo
 * Integra o sistema de cache com React para atualizações automáticas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService, CACHE_TTL } from '@/services/cacheService';

interface UseCacheOptions<T> {
  ttl?: number;
  refreshInterval?: number;
  staleWhileRevalidate?: boolean;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface CacheState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  lastUpdated: number | null;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions<T> = {}
) {
  const {
    ttl = CACHE_TTL.STATIC_DATA,
    refreshInterval,
    staleWhileRevalidate = true,
    onError,
    enabled = true
  } = options;

  const [state, setState] = useState<CacheState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isStale: false,
    lastUpdated: null
  });

  const fetcherRef = useRef(fetcher);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Atualizar referência do fetcher
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Função para buscar dados
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    try {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Verificar cache primeiro (se não for refresh forçado)
      if (!forceRefresh) {
        const cachedData = cacheService.get<T>(key);
        if (cachedData !== null) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            error: null,
            isStale: false,
            lastUpdated: Date.now()
          }));
          return cachedData;
        }
      }

      // Se não há dados em cache ou é refresh forçado, mostrar loading
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        isStale: forceRefresh ? false : prev.isStale
      }));

      // Buscar dados
      const data = await fetcherRef.current();

      // Verificar se a requisição não foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Armazenar no cache
      cacheService.set(key, data, ttl);

      // Atualizar estado
      setState({
        data,
        isLoading: false,
        error: null,
        isStale: false,
        lastUpdated: Date.now()
      });

      return data;
    } catch (error) {
      // Verificar se a requisição não foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
        isStale: true
      }));

      if (onError) {
        onError(errorObj);
      }

      // Se staleWhileRevalidate está ativo, manter dados antigos
      if (staleWhileRevalidate) {
        const staleData = cacheService.get<T>(key);
        if (staleData !== null) {
          setState(prev => ({
            ...prev,
            data: staleData,
            isStale: true
          }));
        }
      }

      throw errorObj;
    }
  }, [key, ttl, enabled, onError, staleWhileRevalidate]);

  // Função para invalidar cache
  const invalidate = useCallback(() => {
    cacheService.delete(key);
    setState(prev => ({
      ...prev,
      isStale: true
    }));
  }, [key]);

  // Função para refresh manual
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Função para definir dados manualmente
  const setData = useCallback((data: T) => {
    cacheService.set(key, data, ttl);
    setState({
      data,
      isLoading: false,
      error: null,
      isStale: false,
      lastUpdated: Date.now()
    });
  }, [key, ttl]);

  // Efeito para buscar dados iniciais
  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    // Cleanup ao desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, key]); // Remover fetchData das dependências para evitar loops

  // Efeito para refresh automático
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, enabled, fetchData]);

  // Efeito para detectar mudanças de foco da janela
  useEffect(() => {
    if (!staleWhileRevalidate || !enabled) return;

    const handleFocus = () => {
      // Revalidar dados quando a janela ganha foco
      const cachedData = cacheService.get<T>(key);
      if (cachedData === null || state.isStale) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [key, enabled, staleWhileRevalidate, state.isStale, fetchData]);

  return {
    ...state,
    refresh,
    invalidate,
    setData,
    mutate: setData // Alias para compatibilidade
  };
}

// Hook especializado para cache de listas com paginação
export function useCachedList<T>(
  baseKey: string,
  fetcher: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  options: UseCacheOptions<{ data: T[]; total: number }> & {
    page?: number;
    limit?: number;
  } = {}
) {
  const { page = 1, limit = 10, ...cacheOptions } = options;
  const key = `${baseKey}:page:${page}:limit:${limit}`;

  return useCache(key, () => fetcher(page, limit), cacheOptions);
}

// Hook para cache de dados do usuário
export function useCachedUserData<T>(
  userId: string,
  dataType: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions<T> = {}
) {
  const key = `user:${userId}:${dataType}`;
  
  return useCache(key, fetcher, {
    ttl: CACHE_TTL.USER_PROFILE,
    staleWhileRevalidate: true,
    ...options
  });
}

// Hook para cache de dados estáticos
export function useCachedStaticData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions<T> = {}
) {
  return useCache(key, fetcher, {
    ttl: CACHE_TTL.STATIC_DATA,
    staleWhileRevalidate: true,
    refreshInterval: 60 * 60 * 1000, // 1 hora
    ...options
  });
}