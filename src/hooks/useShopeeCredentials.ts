
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

// API base URL
const API_BASE = 'http://168.231.98.177:4000';

export interface ShopeeCredentials {
  appId: string;
  secretKey: string;
  status: 'online' | 'offline';
  isLoading: boolean;
}

export function useShopeeCredentials(initialAppId: string) {
  const [shopeeSettings, setShopeeSettings] = useState<ShopeeCredentials>({
    appId: initialAppId || '',
    secretKey: '',
    status: 'offline',
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
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
      // Test URL conversion - this validates the credentials work
      const testUrl = 'https://shopee.com.br/product/123/456';
      
      const response = await fetch(`${API_BASE}/api/shopee/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Credenciais inválidas');
      }
      
      // Refresh status after successful test
      const statusResponse = await fetch(`${API_BASE}/api/shopee/credentials`);
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        setShopeeSettings({
          ...shopeeSettings,
          isLoading: false,
          status: data.status || 'offline',
        });
      } else {
        setShopeeSettings({
          ...shopeeSettings,
          isLoading: false,
          status: 'online', // Assume online if test worked
        });
      }
      
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
