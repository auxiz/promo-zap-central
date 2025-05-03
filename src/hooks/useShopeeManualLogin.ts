
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { API_BASE } from '@/utils/api-constants';

interface ShopeeLoginStatus {
  isLoggedIn: boolean;
  username?: string;
  lastLogin?: string;
}

export function useShopeeManualLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<ShopeeLoginStatus>({
    isLoggedIn: false
  });

  const startLogin = async () => {
    setIsLoading(true);
    
    try {
      // This will call an API endpoint that launches a visible Chromium browser
      const response = await fetch(`${API_BASE}/api/shopee/manual-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ headless: false }) // Specify non-headless mode
      });
      
      if (!response.ok) {
        throw new Error('Falha ao iniciar processo de login');
      }
      
      const data = await response.json();
      
      // Manual login notification
      toast.info("Navegador aberto para login na Shopee", {
        description: "Complete o login manualmente, incluindo qualquer verificação CAPTCHA"
      });
      
      return true;
    } catch (error) {
      console.error("Error starting Shopee login:", error);
      toast.error("Erro ao iniciar login na Shopee");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkLoginStatus = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/shopee/login-status`);
      
      if (!response.ok) {
        throw new Error('Falha ao verificar status de login');
      }
      
      const status = await response.json();
      setLoginStatus(status);
      
      if (status.isLoggedIn) {
        toast.success("Login na Shopee ativo", {
          description: `Última sessão: ${status.lastLogin || 'Desconhecido'}`
        });
      } else {
        toast.error("Sem login ativo na Shopee", {
          description: "Por favor, faça login para usar as funcionalidades de afiliado"
        });
      }
      
      return status;
    } catch (error) {
      console.error("Error checking Shopee login status:", error);
      toast.error("Erro ao verificar status de login");
      return { isLoggedIn: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loginStatus,
    startLogin,
    checkLoginStatus
  };
}
