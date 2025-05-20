import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '@/utils/api-constants';
import { toast } from '@/components/ui/sonner';

export default function ShopeeOAuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Extract code and shop_id from URL parameters
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const shopId = searchParams.get('shop_id');
        
        if (!code) {
          setStatus('error');
          setErrorMessage('Código de autorização não encontrado na URL');
          return;
        }
        
        // Exchange code for tokens
        const response = await fetch(`${API_BASE}/api/shopee/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code,
            shop_id: shopId,
            redirect_uri: window.location.origin + '/configuracoes/callback'
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Falha ao trocar código por token');
        }
        
        if (data.success) {
          setStatus('success');
          
          // Notify parent window about successful authentication
          window.opener?.postMessage(
            { type: 'SHOPEE_OAUTH_SUCCESS', data: { tokenExpiry: data.token_expiry } },
            window.location.origin
          );
          
          // Wait a moment before redirecting - updated to go to configuracoes
          setTimeout(() => {
            toast.success('Autenticação Shopee concluída com sucesso');
            navigate('/configuracoes');
          }, 2000);
        } else {
          throw new Error(data.error || 'Falha na autenticação');
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Ocorreu um erro durante o processamento da autenticação');
      }
    };
    
    processOAuthCallback();
  }, [location.search, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Autenticação Shopee</h1>
        
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Processando autenticação...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Aguarde enquanto processamos sua autenticação com a API Shopee
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="w-8 h-8"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <p className="mt-4 text-lg font-medium">Autenticação concluída com sucesso!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Redirecionando para o painel de configurações...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 text-red-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="w-8 h-8"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
            <p className="mt-4 text-lg font-medium">Erro na autenticação</p>
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
            <button 
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => navigate('/configuracoes')}
            >
              Voltar para Configurações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
