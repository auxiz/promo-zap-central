
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

interface AuthHeaderProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthHeader({ mode, onModeChange }: AuthHeaderProps) {
  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return 'Bem-vindo de volta';
      case 'signup':
        return 'Criar nova conta';
      case 'reset':
        return 'Recuperar senha';
      default:
        return 'Entrar';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin':
        return 'Entre na sua conta para continuar';
      case 'signup':
        return 'Crie uma conta para começar a usar nossa plataforma';
      case 'reset':
        return 'Insira seu email para receber instruções de recuperação';
      default:
        return 'Faça login em sua conta';
    }
  };

  return (
    <CardHeader className="space-y-2 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        {mode === 'reset' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onModeChange('signin')}
            className="absolute left-4 top-4 p-1 h-auto"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-md" />
        </div>
      </div>
      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {getTitle()}
      </CardTitle>
      <CardDescription className="text-gray-600 dark:text-gray-400">
        {getDescription()}
      </CardDescription>
    </CardHeader>
  );
}
