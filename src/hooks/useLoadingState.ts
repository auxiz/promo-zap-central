
import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export const useLoadingState = (initialStates: Record<string, boolean> = {}) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialStates);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const hasAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const resetAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    hasAnyLoading,
    resetAllLoading
  };
};
