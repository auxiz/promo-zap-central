
import { Button } from '@/components/ui/button';

type AuthMode = 'signin' | 'signup' | 'reset';

interface AuthFooterProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthFooter({ mode, onModeChange }: AuthFooterProps) {
  if (mode === 'reset') {
    return null;
  }

  return (
    <div className="text-center space-y-3">
      {mode === 'signin' && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Button
            variant="link"
            onClick={() => onModeChange('signup')}
            className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
          >
            Criar conta
          </Button>
        </p>
      )}

      {mode === 'signup' && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Button
            variant="link"
            onClick={() => onModeChange('signin')}
            className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
          >
            Fazer login
          </Button>
        </p>
      )}
    </div>
  );
}
