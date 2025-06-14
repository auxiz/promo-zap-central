
import { useState, useCallback, useEffect, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  strategy: 'LRU'
};

export function useAdvancedCache<T>(config: Partial<CacheConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const cache = useRef<Map<string, CacheItem<T>>>(new Map());
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0
  });

  const updateStats = useCallback(() => {
    const newStats = {
      hits: stats.hits,
      misses: stats.misses,
      size: cache.current.size,
      hitRate: stats.hits + stats.misses > 0 ? stats.hits / (stats.hits + stats.misses) : 0
    };
    setStats(newStats);
  }, [stats.hits, stats.misses]);

  const evictExpired = useCallback(() => {
    const now = Date.now();
    const toEvict: string[] = [];

    cache.current.forEach((item, key) => {
      if (now > item.expiresAt) {
        toEvict.push(key);
      }
    });

    toEvict.forEach(key => cache.current.delete(key));
    return toEvict.length;
  }, []);

  const evictByStrategy = useCallback(() => {
    if (cache.current.size < finalConfig.maxSize) return;

    let keyToEvict: string | null = null;

    switch (finalConfig.strategy) {
      case 'LRU': // Least Recently Used
        let oldestAccess = Date.now();
        cache.current.forEach((item, key) => {
          if (item.lastAccessed < oldestAccess) {
            oldestAccess = item.lastAccessed;
            keyToEvict = key;
          }
        });
        break;

      case 'LFU': // Least Frequently Used
        let lowestCount = Infinity;
        cache.current.forEach((item, key) => {
          if (item.accessCount < lowestCount) {
            lowestCount = item.accessCount;
            keyToEvict = key;
          }
        });
        break;

      case 'FIFO': // First In, First Out
        let oldestTimestamp = Date.now();
        cache.current.forEach((item, key) => {
          if (item.timestamp < oldestTimestamp) {
            oldestTimestamp = item.timestamp;
            keyToEvict = key;
          }
        });
        break;
    }

    if (keyToEvict) {
      cache.current.delete(keyToEvict);
    }
  }, [finalConfig.maxSize, finalConfig.strategy]);

  const set = useCallback((key: string, data: T, ttl?: number) => {
    const now = Date.now();
    const effectiveTTL = ttl || finalConfig.defaultTTL;
    
    // Evict expired items first
    evictExpired();
    
    // Evict by strategy if needed
    evictByStrategy();

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + effectiveTTL,
      accessCount: 0,
      lastAccessed: now
    };

    cache.current.set(key, item);
    updateStats();
  }, [finalConfig.defaultTTL, evictExpired, evictByStrategy, updateStats]);

  const get = useCallback((key: string): T | null => {
    const item = cache.current.get(key);
    
    if (!item) {
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now > item.expiresAt) {
      cache.current.delete(key);
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    // Update access stats
    item.accessCount++;
    item.lastAccessed = now;

    setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return item.data;
  }, []);

  const has = useCallback((key: string): boolean => {
    const item = cache.current.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now > item.expiresAt) {
      cache.current.delete(key);
      return false;
    }

    return true;
  }, []);

  const remove = useCallback((key: string): boolean => {
    const existed = cache.current.delete(key);
    updateStats();
    return existed;
  }, [updateStats]);

  const clear = useCallback(() => {
    cache.current.clear();
    setStats({ hits: 0, misses: 0, size: 0, hitRate: 0 });
  }, []);

  const getOrSet = useCallback(async (
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> => {
    const cached = get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    set(key, data, ttl);
    return data;
  }, [get, set]);

  // Cleanup expired items periodically
  useEffect(() => {
    const interval = setInterval(() => {
      evictExpired();
      updateStats();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [evictExpired, updateStats]);

  return {
    set,
    get,
    has,
    remove,
    clear,
    getOrSet,
    stats,
    config: finalConfig
  };
}
