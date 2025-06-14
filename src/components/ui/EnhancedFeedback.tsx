
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, Info, XCircle, RefreshCw } from 'lucide-react';

interface FeedbackProps {
  type: 'loading' | 'error' | 'success' | 'info' | 'empty';
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  children?: ReactNode;
  className?: string;
}

export const EnhancedFeedback = ({ 
  type, 
  title, 
  message, 
  action, 
  children, 
  className = "" 
}: FeedbackProps) => {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-destructive" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;
      case 'empty':
        return <AlertTriangle className="w-8 h-8 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'loading':
        return 'Carregando...';
      case 'error':
        return 'Algo deu errado';
      case 'success':
        return 'Sucesso!';
      case 'info':
        return 'Informação';
      case 'empty':
        return 'Nenhum dado encontrado';
      default:
        return '';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'loading':
        return 'Por favor, aguarde enquanto carregamos os dados.';
      case 'error':
        return 'Ocorreu um erro inesperado. Tente novamente.';
      case 'success':
        return 'Operação realizada com sucesso!';
      case 'empty':
        return 'Não há dados para exibir no momento.';
      default:
        return '';
    }
  };

  return (
    <Card className={`${className} animate-fade-in`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {getIcon()}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {title || getDefaultTitle()}
            </h3>
            {(message || getDefaultMessage()) && (
              <p className="text-muted-foreground text-sm max-w-md">
                {message || getDefaultMessage()}
              </p>
            )}
          </div>
          
          {children}
          
          {action && (
            <Button 
              onClick={action.onClick} 
              disabled={action.loading}
              className="mt-4"
              variant={type === 'error' ? 'outline' : 'default'}
            >
              {action.loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {type === 'error' && !action.loading && <RefreshCw className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente específico para loading inline
export const InlineLoader = ({ message = "Carregando..." }: { message?: string }) => (
  <div className="flex items-center justify-center space-x-2 py-4 animate-fade-in">
    <Loader2 className="w-4 h-4 animate-spin text-primary" />
    <span className="text-sm text-muted-foreground">{message}</span>
  </div>
);

// Componente para loading de botões
export const ButtonLoader = ({ loading, children, ...props }: any) => (
  <Button disabled={loading} {...props}>
    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
    {children}
  </Button>
);
