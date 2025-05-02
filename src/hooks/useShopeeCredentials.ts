
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { API_BASE } from '@/utils/api-constants';

export interface ShopeeCredentials {
  appId: string;
  secretKey: string;
  status: 'online' | 'offline';
  isLoading: boolean;
}

export function useShopeeCredentials(initialAppId: string, initialStatus: 'online' | 'offline' = 'offline') {
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
        const response = await fetch(`${API_BASE}/api/shopee/credentials`);
        if (response.ok) {
          const data = await response.json();
          
          setShopeeSettings(prev => ({
            ...prev,
            appId: data.appId || prev.appId,
            status: data.status || 'offline'
          }));
        }
      } catch (error) {
        console.error("Error fetching Shopee status:", error);
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
    if (!shopeeSettings.appId || !shopeeSettings.secretKey) return;
    
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
        throw new Error('Failed to save credentials');
      }
      
      const result = await response.json();
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        status: result.status || 'offline',
      });
      
      toast.success('Credenciais da Shopee salvas com sucesso');
      
      // Refresh status after short delay
      setTimeout(async () => {
        try {
          const statusResponse = await fetch(`${API_BASE}/api/shopee/credentials`);
          if (statusResponse.ok) {
            const data = await statusResponse.json();
            setShopeeSettings(prev => ({
              ...prev,
              status: data.status || 'offline'
            }));
          }
        } catch (error) {
          console.error("Error refreshing Shopee status:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error saving Shopee credentials:", error);
      toast.error('Erro ao salvar credenciais da Shopee');
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
      });
    }
  };

  const testShopeeConnection = async () => {
    if (!shopeeSettings.appId || !shopeeSettings.secretKey) return;
    
    setShopeeSettings({ ...shopeeSettings, isLoading: true });
    
    try {
      // Use the dedicated test endpoint instead of trying to convert a URL
      const response = await fetch(`${API_BASE}/api/shopee/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appId: shopeeSettings.appId,
          secretKey: shopeeSettings.secretKey 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Credenciais inválidas');
      }
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        status: result.status || 'offline',
      });
      
      toast.success('Conexão com a API da Shopee estabelecida com sucesso');
    } catch (error) {
      console.error("Error testing Shopee connection:", error);
      toast.error(`Erro na conexão com a API da Shopee: ${error.message || 'Verifique as credenciais'}`);
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        status: 'offline',
      });
    }
  };

  return {
    shopeeSettings,
    setShopeeSettings,
    saveShopeeCredentials,
    testShopeeConnection
  };
}
