/**
 * Sistema de cache para perfis de usuário
 * Implementa cache em memória com TTL (Time To Live) para melhorar performance
 */

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

interface CacheEntry {
  data: UserProfile;
  timestamp: number;
  ttl: number; // Time to live em milliseconds
}

class UserProfileCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos por padrão

  /**
   * Armazena um perfil no cache
   */
  set(userId: string, profile: UserProfile, ttl?: number): void {
    const entry: CacheEntry = {
      data: profile,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    
    this.cache.set(userId, entry);
    console.log(`💾 Profile cached for user ${userId} (TTL: ${entry.ttl}ms)`);
  }

  /**
   * Recupera um perfil do cache se ainda for válido
   */
  get(userId: string): UserProfile | null {
    const entry = this.cache.get(userId);
    
    if (!entry) {
      console.log(`🔍 Cache miss for user ${userId}`);
      return null;
    }

    const now = Date.now();
    const isExpired = (now - entry.timestamp) > entry.ttl;

    if (isExpired) {
      console.log(`⏰ Cache expired for user ${userId}`);
      this.cache.delete(userId);
      return null;
    }

    console.log(`✅ Cache hit for user ${userId}`);
    return entry.data;
  }

  /**
   * Remove um perfil específico do cache
   */
  invalidate(userId: string): void {
    const deleted = this.cache.delete(userId);
    if (deleted) {
      console.log(`🗑️ Cache invalidated for user ${userId}`);
    }
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 Cache cleared (${size} entries removed)`);
  }

  /**
   * Remove entradas expiradas do cache
   */
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [userId, entry] of this.cache.entries()) {
      const isExpired = (now - entry.timestamp) > entry.ttl;
      if (isExpired) {
        this.cache.delete(userId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧽 Cache cleanup: ${removedCount} expired entries removed`);
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Instância singleton do cache
export const userProfileCache = new UserProfileCache();

// Cleanup automático a cada 10 minutos
setInterval(() => {
  userProfileCache.cleanup();
}, 10 * 60 * 1000);

export type { UserProfile };