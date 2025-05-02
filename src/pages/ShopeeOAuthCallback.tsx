
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ShopeeOAuthCallback() {
  const location = useLocation();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    
    if (code) {
      // Send message to parent window with the authorization code
      if (window.opener) {
        window.opener.postMessage({
          type: 'SHOPEE_OAUTH_CALLBACK',
          code
        }, window.location.origin);
        
        // Close the popup after sending the message
        window.close();
      }
    }
  }, [location.search]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Autenticação Shopee</h1>
      <p className="text-muted-foreground mt-2">Processando autenticação...</p>
      <p className="mt-4">Esta janela irá fechar automaticamente.</p>
    </div>
  );
}
