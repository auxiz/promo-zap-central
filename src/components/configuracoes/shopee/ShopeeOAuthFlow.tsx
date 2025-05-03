
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { API_BASE } from '@/utils/api-constants';
import { Badge } from '@/components/ui/badge';

interface ShopeeOAuthFlowProps {
  appId: string;
  onAuthSuccess: () => void;
}

export function ShopeeOAuthFlow({ appId, onAuthSuccess }: ShopeeOAuthFlowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'expired' | 'none'>('checking');
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
  
  useEffect(() => {
    if (appId) {
      checkTokenStatus();
    } else {
      setTokenStatus('none');
    }
  }, [appId]);
  
  const checkTokenStatus = async () => {
    try {
      setTokenStatus('checking');
      
      const response = await fetch(`${API_BASE}/api/shopee/auth/status`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTokenStatus('valid');
        setTokenExpiry(data.token_expiry);
        
        const expiryDate = new Date(data.token_expiry);
        const now = new Date();
        const hoursRemaining = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        toast.info(`Shopee API token válido`, {
          description: `O token expira em ${hoursRemaining} horas`
        });
      } else {
        setTokenStatus('expired');
        setTokenExpiry(null);
      }
    } catch (error) {
      console.error('Error checking token status:', error);
      setTokenStatus('expired');
    }
  };
  
  const startOAuthFlow = async () => {
    if (!appId) {
      toast.error("Configure o App ID e Secret Key antes de autenticar");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Generate a redirect URI for the current domain
      const redirectUri = `${window.location.origin}/config-shopee/callback`;
      
      // Get authorization URL
      const urlResponse = await fetch(`${API_BASE}/api/shopee/auth/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (!urlResponse.ok) {
        const errorData = await urlResponse.json();
        throw new Error(errorData.error || 'Falha ao obter URL de autorização');
      }
      
      const urlData = await urlResponse.json();
      
      if (!urlData.auth_url) {
        throw new Error('URL de autorização inválida recebida do servidor');
      }
      
      // Open authorization URL in a new window
      window.open(urlData.auth_url, '_blank', 'width=800,height=600');
      
      toast.info("Processo de autenticação Shopee iniciado", {
        description: "Complete a autenticação na janela aberta e aguarde o redirecionamento"
      });
      
      // Setup a listener to detect when the callback is received
      // In a real implementation, you'd likely have a callback page component
      // that would handle receiving the auth code and exchanging it for tokens
      
    } catch (error) {
      console.error('Error starting OAuth flow:', error);
      toast.error(`Falha ao iniciar processo de autenticação: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshToken = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/api/shopee/auth/refresh`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTokenStatus('valid');
        setTokenExpiry(data.token_expiry);
        onAuthSuccess();
        
        toast.success("Token da API Shopee atualizado com sucesso", {
          description: `Válido até ${new Date(data.token_expiry).toLocaleString()}`
        });
      } else {
        throw new Error(data.error || 'Falha ao atualizar token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error(`Falha ao atualizar token: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Autenticação API Shopee</h3>
          
          {tokenStatus === 'valid' && (
            <Badge className="bg-green-500">Autenticado</Badge>
          )}
          
          {tokenStatus === 'expired' && (
            <Badge variant="destructive">Expirado</Badge>
          )}
          
          {tokenStatus === 'none' && (
            <Badge variant="outline">Não configurado</Badge>
          )}
        </div>
        
        <p className="text-muted-foreground">
          Para utilizar a API de afiliados da Shopee, é necessário autenticar sua conta através do fluxo OAuth.
        </p>
        
        {tokenStatus === 'valid' && tokenExpiry && (
          <div className="bg-muted p-3 rounded text-sm">
            <p>Token válido até: <span className="font-medium">{new Date(tokenExpiry).toLocaleString()}</span></p>
          </div>
        )}
        
        <div className="flex gap-2">
          {(tokenStatus === 'expired' || tokenStatus === 'none') && (
            <Button 
              onClick={startOAuthFlow} 
              disabled={isLoading || !appId}
              className="flex items-center gap-2"
            >
              <KeyRound size={16} />
              Autenticar com Shopee
            </Button>
          )}
          
          {tokenStatus === 'valid' && (
            <Button 
              variant="outline" 
              onClick={refreshToken}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Atualizar Token
            </Button>
          )}
          
          <Button 
            variant="secondary"
            onClick={checkTokenStatus}
            disabled={isLoading}
          >
            Verificar Status
          </Button>
        </div>
        
        {tokenStatus === 'none' && (
          <p className="text-sm text-amber-600">
            Configure o App ID e Secret Key antes de iniciar a autenticação
          </p>
        )}
      </div>
    </Card>
  );
}
