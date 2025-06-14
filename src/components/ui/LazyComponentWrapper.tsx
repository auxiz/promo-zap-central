
import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { EnhancedFeedback } from './EnhancedFeedback';
import { ErrorBoundary } from 'react-error-boundary';

interface LazyComponentWrapperProps {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  props?: Record<string, any>;
  minLoadingTime?: number;
}

export const LazyComponentWrapper = ({
  importFn,
  fallback,
  errorFallback,
  props = {},
  minLoadingTime = 300
}: LazyComponentWrapperProps) => {
  const LazyComponent = lazy(async () => {
    // Ensure minimum loading time for UX
    const [component] = await Promise.all([
      importFn(),
      new Promise(resolve => setTimeout(resolve, minLoadingTime))
    ]);
    return component;
  });

  const DefaultFallback = () => (
    <div className="flex items-center justify-center p-8">
      <EnhancedFeedback
        type="loading"
        title="Carregando..."
        message="Preparando conteúdo."
      />
    </div>
  );

  const DefaultErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
    <div className="flex items-center justify-center p-8">
      <EnhancedFeedback
        type="error"
        title="Erro ao carregar"
        message="Falha ao carregar este componente."
        action={{
          label: "Tentar novamente",
          onClick: resetErrorBoundary
        }}
      />
    </div>
  );

  return (
    <ErrorBoundary FallbackComponent={({ error, resetErrorBoundary }) => 
      errorFallback || <DefaultErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
    }>
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Hook para criar componentes lazy mais facilmente
export const useLazyComponent = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  return (props?: Record<string, any>) => (
    <LazyComponentWrapper importFn={importFn} props={props} />
  );
};
