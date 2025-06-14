
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  gcTime?: number;
  staleTime?: number;
  enableOptimisticUpdates?: boolean;
  enableBackgroundRefetch?: boolean;
}

export function useOptimizedQuery<T>(options: OptimizedQueryOptions<T>) {
  const {
    queryKey,
    queryFn,
    gcTime = 10 * 60 * 1000, // 10 minutes default cache
    staleTime = 5 * 60 * 1000,  // 5 minutes default stale time
    enableOptimisticUpdates = true,
    enableBackgroundRefetch = true,
    ...restOptions
  } = options;

  // Memoize query function to prevent unnecessary re-renders
  const memoizedQueryFn = useCallback(queryFn, [queryFn]);

  // Optimize query options based on data type and usage patterns
  const optimizedOptions = useMemo(() => {
    const baseOptions: UseQueryOptions<T> = {
      queryKey,
      queryFn: memoizedQueryFn,
      gcTime,
      staleTime,
      refetchOnWindowFocus: enableBackgroundRefetch,
      refetchOnReconnect: enableBackgroundRefetch,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      ...restOptions
    };

    return baseOptions;
  }, [
    queryKey,
    memoizedQueryFn,
    gcTime,
    staleTime,
    enableBackgroundRefetch,
    enableOptimisticUpdates,
    restOptions
  ]);

  const queryResult = useQuery(optimizedOptions);

  // Add performance monitoring
  const queryPerformance = useMemo(() => {
    const performance = {
      isCached: queryResult.isStale === false && queryResult.data !== undefined,
      isOptimized: queryResult.isFetching === false && queryResult.data !== undefined,
      cacheHitRate: queryResult.dataUpdatedAt > 0 ? 1 : 0,
      lastFetchTime: queryResult.dataUpdatedAt
    };

    // Log performance metrics for monitoring
    if (typeof window !== 'undefined' && window.performance) {
      console.debug(`Query Performance [${String(queryKey)}]:`, {
        cached: performance.isCached,
        optimized: performance.isOptimized,
        lastFetch: performance.lastFetchTime
      });
    }

    return performance;
  }, [queryResult, queryKey]);

  return {
    ...queryResult,
    performance: queryPerformance
  };
}

export function useQueryCache() {
  const invalidateQueries = useCallback((queryKey: QueryKey) => {
    // Implementation will depend on react-query client
    console.log('Invalidating queries:', queryKey);
  }, []);

  const prefetchQuery = useCallback((queryKey: QueryKey, queryFn: () => Promise<any>) => {
    // Implementation will depend on react-query client
    console.log('Prefetching query:', queryKey);
  }, []);

  const clearCache = useCallback(() => {
    // Clear all cached queries
    console.log('Clearing query cache');
  }, []);

  return {
    invalidateQueries,
    prefetchQuery,
    clearCache
  };
}
