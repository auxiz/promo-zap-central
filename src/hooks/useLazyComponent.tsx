
import { lazy, Suspense, ComponentType } from 'react';
import { EnhancedFeedback } from '@/components/ui/EnhancedFeedback';
import ErrorBoundary from 'react-error-boundary';

interface LazyComponentOptions {
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  retryDelay?: number;
}

export const useLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
) => {
  const {
    fallback: CustomFallback,
    errorFallback: CustomErrorFallback,
    retryDelay = 1000
  } = options;

  const LazyComponent = lazy(importFn);

  const DefaultFallback = () => (
    <EnhancedFeedback
      type="loading"
      title="Carregando componente..."
      message="Por favor, aguarde."
    />
  );

  const DefaultErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
    <EnhancedFeedback
      type="error"
      title="Erro ao carregar componente"
      message={error.message}
      action={{
        label: "Tentar novamente",
        onClick: resetErrorBoundary
      }}
    />
  );

  const WrappedComponent = (props: any) => (
    <ErrorBoundary
      FallbackComponent={CustomErrorFallback || DefaultErrorFallback}
      onReset={() => {
        // Optionally reload the component after delay
        setTimeout(() => {
          window.location.reload();
        }, retryDelay);
      }}
    >
      <Suspense fallback={CustomFallback ? <CustomFallback /> : <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  return WrappedComponent;
};

// Hook for creating lazy route components
export const createLazyRoute = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  return useLazyComponent(importFn, {
    fallback: () => (
      <div className="min-h-screen flex items-center justify-center">
        <EnhancedFeedback
          type="loading"
          title="Carregando página..."
          message="Aguarde enquanto preparamos o conteúdo."
        />
      </div>
    )
  });
};
