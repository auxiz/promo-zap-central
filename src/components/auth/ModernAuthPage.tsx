
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SocialLoginButtons } from './SocialLoginButtons';
import { AuthHeader } from './AuthHeader';
import { AuthForm } from './AuthForm';
import { AuthFooter } from './AuthFooter';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function ModernAuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative">
      {/* Background pattern using Tailwind */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <AuthHeader mode={mode} onModeChange={setMode} />

        <CardContent className="space-y-6">
          {/* Social Login Buttons */}
          {mode !== 'reset' && (
            <div className="space-y-3">
              <SocialLoginButtons disabled={loading} />
              
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

          <AuthForm mode={mode} onModeChange={setMode} />

          <AuthFooter mode={mode} onModeChange={setMode} />
        </CardContent>
      </Card>
    </div>
  );
}
