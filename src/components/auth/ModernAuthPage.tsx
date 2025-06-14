
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Github, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type AuthMode = 'signin' | 'signup' | 'reset';

interface PasswordStrength {
  score: number;
  feedback: string[];
}

export default function ModernAuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [] });
  const { signIn, signUp } = useAuth();

  // Real-time email validation
  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(email));
    } else {
      setEmailValid(null);
    }
  }, [email]);

  // Password strength calculation
  useEffect(() => {
    if (password && mode === 'signup') {
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [password, mode]);

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;
    const feedback = [];

    if (pwd.length >= 8) score += 1;
    else feedback.push('Pelo menos 8 caracteres');

    if (/[A-Z]/.test(pwd)) score += 1;
    else feedback.push('Uma letra maiúscula');

    if (/[a-z]/.test(pwd)) score += 1;
    else feedback.push('Uma letra minúscula');

    if (/\d/.test(pwd)) score += 1;
    else feedback.push('Um número');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;
    else feedback.push('Um caractere especial');

    return { score, feedback };
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return 'Fraca';
    if (score <= 3) return 'Média';
    return 'Forte';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        if (passwordStrength.score < 3) {
          toast.error('Senha muito fraca. Por favor, escolha uma senha mais forte.');
          return;
        }
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
    if (!email || !emailValid) {
      toast.error('Por favor, insira um email válido');
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

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} login failed:`, error);
      toast.error(`Erro ao fazer login com ${provider}`);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {mode === 'reset' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('signin')}
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

        <CardContent className="space-y-6">
          {/* Social Login Buttons */}
          {mode !== 'reset' && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="w-full h-11 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Continuar com Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="w-full h-11 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Github className="w-5 h-5 mr-2" />
                Continuar com GitHub
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">ou</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "h-11 pr-10",
                    emailValid === false && "border-red-500",
                    emailValid === true && "border-green-500"
                  )}
                />
                {emailValid !== null && (
                  <div className={cn(
                    "absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full",
                    emailValid ? "bg-green-500" : "bg-red-500"
                  )} />
                )}
              </div>
              {emailValid === false && (
                <p className="text-xs text-red-500">Email inválido</p>
              )}
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {mode === 'signup' && password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Força da senha:</span>
                      <span className={cn(
                        "font-medium",
                        passwordStrength.score <= 1 && "text-red-500",
                        passwordStrength.score > 1 && passwordStrength.score <= 3 && "text-yellow-500",
                        passwordStrength.score > 3 && "text-green-500"
                      )}>
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          getPasswordStrengthColor(passwordStrength.score)
                        )}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="text-xs text-gray-500 space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Lembrar-me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode('reset')}
                  className="text-sm p-0 h-auto"
                >
                  Esqueceu a senha?
                </Button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium" 
              disabled={loading || (mode === 'signup' && passwordStrength.score < 3)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signin' && 'Entrar'}
              {mode === 'signup' && 'Criar Conta'}
              {mode === 'reset' && 'Enviar Email'}
            </Button>
          </form>

          <div className="text-center space-y-3">
            {mode === 'signin' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta?{' '}
                <Button
                  variant="link"
                  onClick={() => setMode('signup')}
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
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                >
                  Fazer login
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
