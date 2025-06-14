import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedPasswordInput } from './EnhancedPasswordInput';
import { EnhancedEmailInput } from './EnhancedEmailInput';
import { AnimatedFormField } from './AnimatedFormField';
import { RememberMeCheckbox } from './RememberMeCheckbox';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp } = useAuth();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit(e as any);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clear errors when switching modes
  useEffect(() => {
    setErrors({});
  }, [mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (mode !== 'reset') {
      if (!password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (mode === 'signup' && password.length < 8) {
        newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
      }
    }

    if (mode === 'signup' && !fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        if (rememberMe) {
          localStorage.setItem('remember_email', email);
        } else {
          localStorage.removeItem('remember_email');
        }
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

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remember_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return 'Bem-vindo de volta';
      case 'signup':
        return 'Criar sua conta';
      case 'reset':
        return 'Recuperar senha';
      default:
        return 'Entrar';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin':
        return 'Entre em sua conta para continuar sua jornada';
      case 'signup':
        return 'Crie uma nova conta e comece a automatizar';
      case 'reset':
        return 'Insira seu email para receber as instruções de recuperação';
      default:
        return 'Faça login em sua conta';
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    // Clear form but keep email if switching between signin/signup
    if (newMode === 'reset' || mode === 'reset') {
      setPassword('');
      setFullName('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-6000"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl animate-scale-in">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex items-center justify-center mb-4 relative">
            {mode === 'reset' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleModeChange('signin')}
                className="absolute left-0 p-2 h-auto hover:bg-purple-100 dark:hover:bg-purple-900 transition-all duration-200 hover:scale-110"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <AnimatedFormField id="fullName" label="Nome Completo" error={errors.fullName}>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-200" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-200"
                    required
                  />
                </div>
              </AnimatedFormField>
            )}
            
            <AnimatedFormField id="email" label="Email" error={errors.email}>
              <EnhancedEmailInput
                id="email"
                placeholder="Digite seu email"
                value={email}
                onChange={setEmail}
                required
              />
            </AnimatedFormField>

            {mode !== 'reset' && (
              <AnimatedFormField id="password" label="Senha" error={errors.password}>
                <EnhancedPasswordInput
                  id="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={setPassword}
                  showStrengthIndicator={mode === 'signup'}
                  required
                />
              </AnimatedFormField>
            )}

            {mode === 'signin' && (
              <div className="flex items-center justify-between">
                <RememberMeCheckbox 
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Button
                  type="button"
                  variant="link"
                  onClick={() => handleModeChange('reset')}
                  className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium p-0 h-auto"
                >
                  Esqueceu a senha?
                </Button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none disabled:hover:scale-100" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signin' && 'Entrar na conta'}
              {mode === 'signup' && 'Criar conta'}
              {mode === 'reset' && 'Enviar email'}
            </Button>
          </form>

          <div className="space-y-4">
            {mode === 'signin' && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                      ou
                    </span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Não tem uma conta?{' '}
                  <Button
                    variant="link"
                    onClick={() => handleModeChange('signup')}
                    className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium p-0 h-auto transition-colors duration-200"
                  >
                    Criar conta gratuita
                  </Button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                      ou
                    </span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Já tem uma conta?{' '}
                  <Button
                    variant="link"
                    onClick={() => handleModeChange('signin')}
                    className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium p-0 h-auto transition-colors duration-200"
                  >
                    Fazer login
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
