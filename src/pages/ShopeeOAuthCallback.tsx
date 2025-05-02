
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ShopeeOAuthCallback() {
  const location = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando autenticação...');
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract code and error from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const error = queryParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage(`Erro de autenticação: ${error}`);
          return;
        }
        
        if (!code) {
          setStatus('error');
          setMessage('Código de autorização não encontrado na URL');
          return;
        }
        
        // Send message to parent window with the authorization code
        if (window.opener) {
          // Post message to parent window
          window.opener.postMessage({
            type: 'SHOPEE_OAUTH_CALLBACK',
            code
          }, window.location.origin);
          
          setStatus('success');
          setMessage('Autenticação realizada com sucesso! Esta janela será fechada em instantes.');
          
          // Close the popup after short delay
          setTimeout(() => {
            window.close();
          }, 3000);
        } else {
          // Handle case when opened directly (not in popup)
          setStatus('error');
          setMessage('Esta página deve ser aberta como uma janela pop-up durante o processo de autenticação.');
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        setStatus('error');
        setMessage(`Erro ao processar autenticação: ${error.message}`);
      }
    };
    
    processCallback();
  }, [location.search]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md space-y-6 text-center">
        <h1 className="text-2xl font-bold">Autenticação Shopee</h1>
        
        <div className="flex justify-center">
          {status === 'processing' && (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          )}
          
          {status === 'success' && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          
          {status === 'error' && (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        
        <p className={`text-lg ${status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`}>
          {message}
        </p>
        
        {status === 'success' && (
          <p className="text-sm text-muted-foreground mt-4">
            Esta janela será fechada automaticamente.
          </p>
        )}
        
        {status === 'error' && (
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => window.close()}
          >
            Fechar Janela
          </button>
        )}
      </div>
    </div>
  );
}
