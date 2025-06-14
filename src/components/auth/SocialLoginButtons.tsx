
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chrome, Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SocialLoginButtonsProps {
  disabled?: boolean;
}

export function SocialLoginButtons({ disabled }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} login failed:`, error);
      toast.error(`Erro ao fazer login com ${provider === 'google' ? 'Google' : 'GitHub'}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialLogin('google')}
        disabled={disabled || loading === 'google'}
        className="w-full h-11 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Chrome className="w-5 h-5 mr-2" />
        {loading === 'google' ? 'Conectando...' : 'Continuar com Google'}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialLogin('github')}
        disabled={disabled || loading === 'github'}
        className="w-full h-11 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Github className="w-5 h-5 mr-2" />
        {loading === 'github' ? 'Conectando...' : 'Continuar com GitHub'}
      </Button>
    </div>
  );
}
