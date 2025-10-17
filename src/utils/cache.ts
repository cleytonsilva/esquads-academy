// =====================================================
// CACHE SYSTEM - Sistema de cache local para melhorar performance
// Data: 2024-12-15
// Descrição: Cache simples em memória para dados frequentes
// =====================================================

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    };
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar se o item expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Verificar se o item expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar itens expirados
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Obter estatísticas do cache
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância global do cache
export const cache = new SimpleCache();

// Executar limpeza automática a cada 10 minutos
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

// Chaves de cache padronizadas
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  POPULAR_COURSES: 'popular_courses',
  TRENDING_COURSES: 'trending_courses',
  COURSE_CATEGORIES: 'course_categories',
  USER_CERTIFICATES: (userId: string) => `user_certificates_${userId}`,
  COURSE_RECOMMENDATIONS: (userId: string) => `recommendations_${userId}`,
  RECENT_COURSES: (userId: string) => `recent_courses_${userId}`,
} as const;

// Utilitário para cache com fallback
export async function cacheWithFallback<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Tentar obter do cache primeiro
  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log(`📦 Cache hit for key: ${key}`);
    return cached;
  }

  // Se não estiver no cache, buscar dados
  console.log(`🔄 Cache miss for key: ${key}, fetching data...`);
  try {
    const data = await fetchFunction();
    cache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching data for cache key ${key}:`, error);
    throw error;
  }
}