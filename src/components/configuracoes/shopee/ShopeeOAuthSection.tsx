
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import { AlertCircle, Lock } from 'lucide-react';
import { API_BASE } from '@/utils/api-constants';

interface ShopeeOAuthSectionProps {
  appId: string;
  hasToken: boolean;
  onAuthSuccess: () => void;
}

export function ShopeeOAuthSection({ appId, hasToken, onAuthSuccess }: ShopeeOAuthSectionProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();
  
  const startOAuthProcess = async () => {
    if (!appId) {
      toast({
        title: "Erro",
        description: "Configure o APP ID e Secret Key antes de autenticar",
        variant: "destructive"
      });
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      // Create a redirect URI for the current domain
      const redirectUri = `${window.location.origin}/config-shopee/callback`;
      
      // Get the authorization URL
      const response = await fetch(`${API_BASE}/api/shopee/auth/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }
      
      const data = await response.json();
      
      // Open the authorization URL in a new window
      window.open(data.auth_url, '_blank', 'width=800,height=600');
      
      // Set up a listener for the OAuth callback
      window.addEventListener('message', handleOAuthCallback);
      
      toast({
        title: "Autenticação Iniciada",
        description: "Por favor, complete o processo de autenticação na janela aberta."
      });
    } catch (error) {
      console.error('Error starting OAuth process:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar processo de autenticação",
        variant: "destructive"
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Handle the OAuth callback message from the popup window
  const handleOAuthCallback = async (event: MessageEvent) => {
    // Remove the listener once we've received a message
    window.removeEventListener('message', handleOAuthCallback);
    
    if (event.data && event.data.type === 'SHOPEE_OAUTH_CALLBACK' && event.data.code) {
      try {
        // Exchange the code for an access token
        const redirectUri = `${window.location.origin}/config-shopee/callback`;
        
        const response = await fetch(`${API_BASE}/api/shopee/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: event.data.code,
            redirect_uri: redirectUri
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to exchange code for token');
        }
        
        const tokenData = await response.json();
        
        if (tokenData.success) {
          toast({
            title: "Autenticação Concluída",
            description: `Autenticado com sucesso. Token válido até ${new Date(tokenData.token_expiry).toLocaleString()}`
          });
          
          // Notify parent component
          onAuthSuccess();
        } else {
          throw new Error(tokenData.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        toast({
          title: "Erro",
          description: "Falha ao completar processo de autenticação",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="space-y-4 border rounded-md p-4 bg-muted/30">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5" />
        <h3 className="font-medium">Autenticação OAuth</h3>
      </div>
      
      {!hasToken ? (
        <>
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              É necessário autenticar-se com a Shopee para utilizar a API de afiliados.
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={startOAuthProcess}
            disabled={isAuthenticating || !appId}
            className="w-full"
          >
            {isAuthenticating ? 'Autenticando...' : 'Autenticar com Shopee'}
          </Button>
        </>
      ) : (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Autenticado com a Shopee
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
