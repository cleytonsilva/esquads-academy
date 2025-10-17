/**
 * Sistema de Cache Inteligente com TTL
 * Implementa cache em memória com expiração automática e otimizações de performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalItems: number;
  memoryUsage: number;
}

export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalItems: 0,
    memoryUsage: 0
  };
  
  // TTL padrão em milissegundos
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 1000; // Máximo de itens no cache
  private readonly CLEANUP_INTERVAL = 60 * 1000; // Limpeza a cada 1 minuto

  constructor() {
    // Iniciar limpeza automática
    this.startCleanupInterval();
  }

  /**
   * Armazena um item no cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const now = Date.now();
      const itemTtl = ttl || this.DEFAULT_TTL;
      
      // Verificar se precisa limpar cache por tamanho
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.evictLeastUsed();
      }

      const cacheItem: CacheItem<T> = {
        data,
        timestamp: now,
        ttl: itemTtl,
        accessCount: 0,
        lastAccessed: now
      };

      this.cache.set(key, cacheItem);
      this.stats.totalItems = this.cache.size;
      this.updateMemoryUsage();
    } catch (error) {
      console.warn('Erro ao armazenar no cache:', error);
    }
  }

  /**
   * Recupera um item do cache
   */
  get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        this.stats.misses++;
        return null;
      }

      const now = Date.now();
      
      // Verificar se o item expirou
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        this.stats.misses++;
        this.stats.totalItems = this.cache.size;
        return null;
      }

      // Atualizar estatísticas de acesso
      item.accessCount++;
      item.lastAccessed = now;
      this.stats.hits++;

      return item.data as T;
    } catch (error) {
      console.warn('Erro ao recuperar do cache:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Remove um item específico do cache
   */
  delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        this.stats.totalItems = this.cache.size;
        this.updateMemoryUsage();
      }
      return deleted;
    } catch (error) {
      console.warn('Erro ao deletar do cache:', error);
      return false;
    }
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    try {
      this.cache.clear();
      this.stats = {
        hits: 0,
        misses: 0,
        totalItems: 0,
        memoryUsage: 0
      };
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  }

  /**
   * Verifica se uma chave existe no cache e não expirou
   */
  has(key: string): boolean {
    try {
      const item = this.cache.get(key);
      if (!item) return false;

      const now = Date.now();
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        this.stats.totalItems = this.cache.size;
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Erro ao verificar cache:', error);
      return false;
    }
  }

  /**
   * Obtém ou define um valor no cache (padrão get-or-set)
   */
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    try {
      // Tentar obter do cache primeiro
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Se não estiver no cache, executar factory e armazenar
      const data = await factory();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Erro no getOrSet:', error);
      // Em caso de erro, tentar executar factory sem cache
      return await factory();
    }
  }

  /**
   * Remove itens menos usados quando o cache está cheio
   */
  private evictLeastUsed(): void {
    try {
      if (this.cache.size === 0) return;

      let leastUsedKey = '';
      let leastUsedCount = Infinity;
      let oldestAccess = Infinity;

      for (const [key, item] of this.cache.entries()) {
        // Priorizar por menor uso, depois por acesso mais antigo
        if (item.accessCount < leastUsedCount || 
           (item.accessCount === leastUsedCount && item.lastAccessed < oldestAccess)) {
          leastUsedKey = key;
          leastUsedCount = item.accessCount;
          oldestAccess = item.lastAccessed;
        }
      }

      if (leastUsedKey) {
        this.cache.delete(leastUsedKey);
      }
    } catch (error) {
      console.warn('Erro na remoção de itens menos usados:', error);
    }
  }

  /**
   * Remove itens expirados do cache
   */
  private cleanup(): void {
    try {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.cache.delete(key));
      
      if (keysToDelete.length > 0) {
        this.stats.totalItems = this.cache.size;
        this.updateMemoryUsage();
      }
    } catch (error) {
      console.warn('Erro na limpeza do cache:', error);
    }
  }

  /**
   * Inicia o intervalo de limpeza automática
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Atualiza estimativa de uso de memória
   */
  private updateMemoryUsage(): void {
    try {
      // Estimativa simples baseada no número de itens
      this.stats.memoryUsage = this.cache.size * 1024; // ~1KB por item
    } catch (error) {
      console.warn('Erro ao calcular uso de memória:', error);
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Obtém taxa de acerto do cache
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Gera chave de cache baseada em parâmetros
   */
  static generateKey(prefix: string, ...params: (string | number | boolean)[]): string {
    try {
      const sanitizedParams = params.map(p => 
        typeof p === 'string' ? p.replace(/[^a-zA-Z0-9_-]/g, '_') : String(p)
      );
      return `${prefix}:${sanitizedParams.join(':')}`;
    } catch (error) {
      console.warn('Erro ao gerar chave de cache:', error);
      return `${prefix}:fallback:${Date.now()}`;
    }
  }
}

// Instância singleton do cache
export const cacheService = new CacheService();

// Constantes para TTL específicos
export const CACHE_TTL = {
  USER_PROFILE: 10 * 60 * 1000,      // 10 minutos
  COURSES: 30 * 60 * 1000,           // 30 minutos
  CERTIFICATES: 60 * 60 * 1000,      // 1 hora
  MISSIONS: 5 * 60 * 1000,           // 5 minutos
  RECOMMENDATIONS: 15 * 60 * 1000,   // 15 minutos
  ANALYTICS: 5 * 60 * 1000,          // 5 minutos
  STATIC_DATA: 24 * 60 * 60 * 1000   // 24 horas
} as const;