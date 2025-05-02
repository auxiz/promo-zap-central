
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, Lock, RefreshCw, ArrowRight } from 'lucide-react';
import { API_BASE } from '@/utils/api-constants';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ShopeeOAuthSectionProps {
  appId: string;
  hasToken: boolean;
  onAuthSuccess: () => void;
}

export function ShopeeOAuthSection({ appId, hasToken, onAuthSuccess }: ShopeeOAuthSectionProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<'active' | 'expired' | 'loading'>('loading');
  
  // Fetch token status on mount and when hasToken changes
  useEffect(() => {
    if (hasToken) {
      fetchTokenStatus();
    } else {
      setTokenStatus('expired');
      setTokenExpiry(null);
    }
  }, [hasToken]);
  
  const fetchTokenStatus = async () => {
    try {
      setTokenStatus('loading');
      const response = await fetch(`${API_BASE}/api/shopee/auth/status`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch token status');
      }
      
      const data = await response.json();
      
      if (data.success && data.token_expiry) {
        setTokenExpiry(data.token_expiry);
        setTokenStatus('active');
      } else {
        setTokenStatus('expired');
        setTokenExpiry(null);
      }
    } catch (error) {
      console.error('Error fetching token status:', error);
      setTokenStatus('expired');
    }
  };
  
  const startOAuthProcess = async () => {
    if (!appId) {
      toast.error("Configure o APP ID e Secret Key antes de autenticar");
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      // Create a redirect URI for the current domain
      const redirectUri = `${window.location.origin}/config-shopee/callback`;
      
      // Get the authorization URL
      const response = await fetch(`${API_BASE}/api/shopee/auth/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get authorization URL');
      }
      
      const data = await response.json();
      
      if (!data.auth_url) {
        throw new Error('Invalid authorization URL received from server');
      }
      
      // Open the authorization URL in a new window
      const authWindow = window.open(data.auth_url, '_blank', 'width=800,height=600');
      
      if (!authWindow) {
        toast.error("Pop-up bloqueado", {
          description: "Por favor, permita pop-ups para continuar com o processo de autenticação."
        });
        setIsAuthenticating(false);
        return;
      }
      
      // Set up a listener for the OAuth callback
      window.addEventListener('message', handleOAuthCallback);
      
      toast.info("Autenticação Iniciada", {
        description: "Por favor, complete o processo de autenticação na janela aberta."
      });
      
      // Start a timeout to handle case where the user closes the window without completing auth
      const timeout = setTimeout(() => {
        if (authWindow.closed) {
          window.removeEventListener('message', handleOAuthCallback);
          setIsAuthenticating(false);
          toast.error("Processo de autenticação cancelado", {
            description: "A janela foi fechada antes da conclusão da autenticação."
          });
        }
      }, 60000); // Check after 1 minute
      
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('message', handleOAuthCallback);
      };
    } catch (error) {
      console.error('Error starting OAuth process:', error);
      toast.error("Falha ao iniciar processo de autenticação", {
        description: error.message
      });
      setIsAuthenticating(false);
    }
  };
  
  // Handle the OAuth callback message from the popup window
  const handleOAuthCallback = async (event: MessageEvent) => {
    // Validate the origin of the message
    if (event.origin !== window.location.origin) return;
    
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
        
        const tokenData = await response.json();
        
        if (!response.ok) {
          throw new Error(tokenData.error || 'Failed to exchange code for token');
        }
        
        if (tokenData.success) {
          setTokenExpiry(tokenData.token_expiry);
          setTokenStatus('active');
          
          toast.success("Autenticação Concluída", {
            description: `Autenticado com sucesso. Token válido até ${new Date(tokenData.token_expiry).toLocaleString()}`
          });
          
          // Notify parent component
          onAuthSuccess();
        } else {
          throw new Error(tokenData.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        toast.error("Falha ao completar processo de autenticação", {
          description: error.message || "Ocorreu um erro durante a autenticação."
        });
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      setIsAuthenticating(false);
    }
  };
  
  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/shopee/auth/refresh`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh token');
      }
      
      if (data.success) {
        setTokenExpiry(data.token_expiry);
        setTokenStatus('active');
        
        toast.success("Token Atualizado", {
          description: `Token atualizado com sucesso. Válido até ${new Date(data.token_expiry).toLocaleString()}`
        });
        
        // Notify parent component
        onAuthSuccess();
      } else {
        throw new Error(data.error || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error("Falha ao atualizar token", {
        description: error.message || "Ocorreu um erro durante a atualização do token."
      });
      
      // If refresh fails due to expired token, we may need to re-authenticate
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        setTokenStatus('expired');
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const formatExpiryTime = () => {
    if (!tokenExpiry) return null;
    
    try {
      const expiryDate = new Date(tokenExpiry);
      return expiryDate.toLocaleString();
    } catch (e) {
      return 'Expiração desconhecida';
    }
  };
  
  return (
    <div className="space-y-4 border rounded-md p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <h3 className="font-medium">Autenticação OAuth</h3>
        </div>
        
        {hasToken && tokenStatus === 'active' && (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Autenticado
          </Badge>
        )}
        
        {hasToken && tokenStatus === 'expired' && (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Autenticação Expirada
          </Badge>
        )}
      </div>
      
      {tokenStatus === 'loading' ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : !hasToken || tokenStatus === 'expired' ? (
        <>
          <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-900">
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
            {isAuthenticating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Autenticar com Shopee
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <Alert>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>Autenticado com a Shopee</span>
              </div>
              
              {tokenExpiry && (
                <p className="text-xs text-muted-foreground">
                  Token válido até: {formatExpiryTime()}
                </p>
              )}
            </AlertDescription>
          </Alert>
          
          <Button
            variant="outline"
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            className="w-full"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Atualizando Token...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Atualizar Token
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
