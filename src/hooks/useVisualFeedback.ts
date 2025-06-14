
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export function useVisualFeedback() {
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});

  const showFeedback = useCallback((options: FeedbackOptions) => {
    toast({
      title: options.title,
      description: options.description,
      variant: options.type === 'error' ? 'destructive' : 'default',
      duration: options.duration,
      // Remove the action for now to avoid JSX in hook
      // Action buttons can be handled in the component that calls this hook
    });
  }, [toast]);

  const showSuccess = useCallback((title: string, description?: string) => {
    showFeedback({ type: 'success', title, description });
  }, [showFeedback]);

  const showError = useCallback((title: string, description?: string) => {
    showFeedback({ type: 'error', title, description });
  }, [showFeedback]);

  const showWarning = useCallback((title: string, description?: string) => {
    showFeedback({ type: 'warning', title, description });
  }, [showFeedback]);

  const showInfo = useCallback((title: string, description?: string) => {
    showFeedback({ type: 'info', title, description });
  }, [showFeedback]);

  const setLoading = useCallback((key: string, state: LoadingState | boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: typeof state === 'boolean' ? { isLoading: state } : state
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key]?.isLoading || false;
  }, [loadingStates]);

  const getLoadingState = useCallback((key: string) => {
    return loadingStates[key];
  }, [loadingStates]);

  const clearLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    } else {
      setLoadingStates({});
    }
  }, []);

  return {
    showFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    setLoading,
    isLoading,
    getLoadingState,
    clearLoading,
    loadingStates
  };
}
