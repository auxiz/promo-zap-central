
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
      // Try the backend-managed Chromium browser approach first
      // Make sure we're using the main Shopee login page, not affiliate page
      const response = await fetch(`${API_BASE}/api/shopee/manual-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          headless: false,
          loginUrl: 'https://shopee.com.br/buyer/login'  // Explicitly specify main Shopee login URL
        }) 
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
      
      // Fallback: Open Shopee login page directly in a popup window
      const shopeeLoginUrl = "https://shopee.com.br/buyer/login";  // Main Shopee login page
      const popupWindow = window.open(
        shopeeLoginUrl, 
        "ShopeeLogin", 
        "width=1024,height=768,menubar=no,toolbar=no,location=no"
      );
      
      if (popupWindow) {
        toast.info("Página de login da Shopee aberta", {
          description: "Complete o login manualmente em uma nova janela"
        });
        return true;
      } else {
        toast.error("Bloqueador de pop-ups ativo", {
          description: "Por favor, permita pop-ups para este site e tente novamente"
        });
        return false;
      }
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
