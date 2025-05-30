
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function ErrorFallback({ error, onRetry, isRetrying = false }: ErrorFallbackProps) {
  return (
    <Card className="p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Erro na Conexão</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {error || 'Não foi possível conectar com o servidor WhatsApp'}
          </p>
        </div>
        
        <Button 
          onClick={onRetry} 
          disabled={isRetrying}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Tentando novamente...' : 'Tentar Novamente'}
        </Button>
      </div>
    </Card>
  );
}
