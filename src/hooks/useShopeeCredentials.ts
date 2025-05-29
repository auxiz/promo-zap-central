
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { API_BASE } from '@/utils/api-constants';

export interface ShopeeCredentials {
  appId: string;
  secretKey: string;
  status: 'online' | 'offline';
  isLoading: boolean;
}

export function useShopeeCredentials(
  initialAppId: string, 
  initialStatus: 'online' | 'offline' = 'offline'
) {
  const [shopeeSettings, setShopeeSettings] = useState<ShopeeCredentials>({
    appId: initialAppId || '',
    secretKey: '',
    status: initialStatus || 'offline',
    isLoading: false,
  });
  
  // Fetch status on mount and every 30 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/shopee/credentials`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          setShopeeSettings(prev => ({
            ...prev,
            appId: data.appId || prev.appId,
            status: data.status || 'offline'
          }));
        } else {
          console.warn('Failed to fetch Shopee credentials, backend may be offline');
        }
      } catch (error) {
        console.error("Error fetching Shopee status:", error);
        // Don't show error toast on every failed fetch, just log it
      }
    };
    
    // Only start the interval if we have an appId
    if (shopeeSettings.appId) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [shopeeSettings.appId]);

  // Update the component when initialAppId or initialStatus changes
  useEffect(() => {
    setShopeeSettings(prev => ({
      ...prev,
      appId: initialAppId || prev.appId,
      status: initialStatus || prev.status
    }));
  }, [initialAppId, initialStatus]);

  const saveShopeeCredentials = async () => {
    if (!shopeeSettings.appId || !shopeeSettings.secretKey) {
      toast.error('Por favor, preencha App ID e Secret Key');
      return;
    }
    
    setShopeeSettings({ ...shopeeSettings, isLoading: true });
    
    try {
      const response = await fetch(`${API_BASE}/api/shopee/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: shopeeSettings.appId,
          secretKey: shopeeSettings.secretKey,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        status: result.status || 'offline',
      });
      
      toast.success('Credenciais da Shopee salvas com sucesso');
      
      // Refresh status after short delay
      setTimeout(refreshShopeeStatus, 1000);
    } catch (error) {
      console.error("Error saving Shopee credentials:", error);
      
      if (error.message.includes('Failed to fetch')) {
        toast.error('Erro de conexão: Verifique se o backend está rodando');
      } else {
        toast.error(`Erro ao salvar credenciais: ${error.message}`);
      }
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
      });
    }
  };

  const testShopeeConnection = async () => {
    if (!shopeeSettings.appId || !shopeeSettings.secretKey) {
      toast.error('Por favor, preencha App ID e Secret Key');
      return;
    }
    
    setShopeeSettings({ ...shopeeSettings, isLoading: true });
    
    try {
      // Use the dedicated test endpoint
      const response = await fetch(`${API_BASE}/api/shopee/credentials/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appId: shopeeSettings.appId,
          secretKey: shopeeSettings.secretKey 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        status: result.status || 'offline',
      });
      
      toast.success('Conexão com a API da Shopee estabelecida com sucesso');
    } catch (error) {
      console.error("Error testing Shopee connection:", error);
      
      if (error.message.includes('Failed to fetch')) {
        toast.error('Erro de conexão: Verifique se o backend está rodando');
      } else if (error.message.includes('Invalid credentials')) {
        toast.error('Credenciais inválidas: Verifique App ID e Secret Key');
      } else {
        toast.error(`Erro na conexão: ${error.message}`);
      }
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        status: 'offline',
      });
    }
  };

  const refreshShopeeStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/shopee/credentials`);
      if (response.ok) {
        const data = await response.json();
        
        setShopeeSettings(prev => ({
          ...prev,
          status: data.status || prev.status
        }));
      }
    } catch (error) {
      console.error("Error refreshing Shopee status:", error);
    }
  };

  return {
    shopeeSettings,
    setShopeeSettings,
    saveShopeeCredentials,
    testShopeeConnection,
    refreshShopeeStatus
  };
}
