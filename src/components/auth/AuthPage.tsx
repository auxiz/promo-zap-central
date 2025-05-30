
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, fullName);
      } else if (mode === 'reset') {
        await handlePasswordReset();
      }
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setMode('signin');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return 'Entrar';
      case 'signup':
        return 'Criar Conta';
      case 'reset':
        return 'Recuperar Senha';
      default:
        return 'Entrar';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin':
        return 'Faça login em sua conta';
      case 'signup':
        return 'Crie uma nova conta para começar';
      case 'reset':
        return 'Insira seu email para receber instruções de recuperação';
      default:
        return 'Faça login em sua conta';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            {mode === 'reset' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('signin')}
                className="p-1 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          </div>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signin' && 'Entrar'}
              {mode === 'signup' && 'Criar Conta'}
              {mode === 'reset' && 'Enviar Email'}
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            {mode === 'signin' && (
              <>
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setMode('reset')}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{' '}
                  <Button
                    variant="link"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline p-0 h-auto"
                  >
                    Criar conta
                  </Button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                  onClick={() => setMode('signin')}
                  className="text-primary hover:underline p-0 h-auto"
                >
                  Fazer login
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
