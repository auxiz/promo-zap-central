
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ShopeeFormActionsProps {
  isValid: boolean;
  isLoading: boolean;
  onSave: () => Promise<void>;
  onTest: () => Promise<void>;
}

export function ShopeeFormActions({ isValid, isLoading, onSave, onTest }: ShopeeFormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        onClick={onSave}
        disabled={!isValid || isLoading}
        variant="outline"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </span>
        ) : (
          'Salvar Credenciais'
        )}
      </Button>
      
      <Button
        onClick={onTest}
        disabled={!isValid || isLoading}
        className="bg-primary text-primary-foreground"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Validando...
          </span>
        ) : (
          'Testar Conexão'
        )}
      </Button>
    </div>
  );
}
