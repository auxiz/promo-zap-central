
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SecurePasswordInput from './SecurePasswordInput';

type AuthMode = 'signin' | 'signup' | 'reset';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
  blockUntil: number;
}

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_KEY = 'auth_rate_limit';

export default function RateLimitedAuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState>({
    attempts: 0,
    lastAttempt: 0,
    isBlocked: false,
    blockUntil: 0,
  });
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    // Load rate limit state from localStorage
    const saved = localStorage.getItem(RATE_LIMIT_KEY);
    if (saved) {
      const parsedState = JSON.parse(saved);
      const now = Date.now();
      
      if (parsedState.blockUntil > now) {
        setRateLimit(parsedState);
      } else {
        // Reset if block period has expired
        const resetState = {
          attempts: 0,
          lastAttempt: 0,
          isBlocked: false,
          blockUntil: 0,
        };
        setRateLimit(resetState);
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(resetState));
      }
    }
  }, []);

  const updateRateLimit = (failed: boolean) => {
    const now = Date.now();
    let newState: RateLimitState;

    if (failed) {
      const newAttempts = rateLimit.attempts + 1;
      newState = {
        attempts: newAttempts,
        lastAttempt: now,
        isBlocked: newAttempts >= MAX_ATTEMPTS,
        blockUntil: newAttempts >= MAX_ATTEMPTS ? now + BLOCK_DURATION : 0,
      };
    } else {
      // Reset on successful attempt
      newState = {
        attempts: 0,
        lastAttempt: 0,
        isBlocked: false,
        blockUntil: 0,
      };
    }

    setRateLimit(newState);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newState));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimit.isBlocked && Date.now() < rateLimit.blockUntil) {
      const remainingTime = Math.ceil((rateLimit.blockUntil - Date.now()) / 60000);
      toast.error(`Muitas tentativas falharam. Tente novamente em ${remainingTime} minutos.`);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        updateRateLimit(false);
      } else if (mode === 'signup') {
        await signUp(email, password, fullName);
        updateRateLimit(false);
      } else if (mode === 'reset') {
        await handlePasswordReset();
      }
    } catch (error) {
      if (mode === 'signin') {
        updateRateLimit(true);
      }
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
      console.error('Password reset failed');
      toast.error('Erro ao enviar email de recuperação');
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

  const isBlocked = rateLimit.isBlocked && Date.now() < rateLimit.blockUntil;
  const remainingTime = isBlocked ? Math.ceil((rateLimit.blockUntil - Date.now()) / 60000) : 0;

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
          
          {isBlocked && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                Conta temporariamente bloqueada. Tente novamente em {remainingTime} minutos.
              </span>
            </div>
          )}
          
          {rateLimit.attempts > 0 && rateLimit.attempts < MAX_ATTEMPTS && (
            <div className="text-sm text-orange-600">
              {MAX_ATTEMPTS - rateLimit.attempts} tentativas restantes
            </div>
          )}
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
                <SecurePasswordInput
                  id="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={mode === 'signup' ? 8 : 1}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isBlocked}
            >
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
