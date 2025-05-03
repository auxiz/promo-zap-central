
import { useState, useEffect } from 'react';
import { ShopeeSettings } from '@/components/configuracoes/ShopeeSettings';
import { InstagramSettings } from '@/components/configuracoes/InstagramSettings';
import { FutureIntegrationsGrid } from '@/components/configuracoes/FutureIntegrationsGrid';
import { API_BASE } from '@/utils/api-constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShopeeManualLogin } from '@/components/configuracoes/shopee/ShopeeManualLogin';

export default function Configuracoes() {
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [shopeeStatus, setShopeeStatus] = useState<'online' | 'offline'>('offline');
  const [hasToken, setHasToken] = useState(false);

  // Fetch current Shopee credentials on mount
  useEffect(() => {
    const fetchShopeeCredentials = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/shopee/credentials`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.appId) {
            setShopeeAppId(data.appId);
          }
          
          if (data.status) {
            setShopeeStatus(data.status);
          }

          if (data.hasToken) {
            setHasToken(data.hasToken);
          }
        }
      } catch (error) {
        console.error("Error fetching Shopee credentials:", error);
      }
    };

    fetchShopeeCredentials();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações de Integrações</h1>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Shopee</h2>
        
        <Tabs defaultValue="api-settings" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="api-settings">API Settings</TabsTrigger>
            <TabsTrigger value="manual-login">Login Shopee</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-settings" className="mt-0">
            <ShopeeSettings 
              initialAppId={shopeeAppId} 
              initialStatus={shopeeStatus}
              initialHasToken={hasToken}
            />
          </TabsContent>
          
          <TabsContent value="manual-login" className="mt-0">
            <ShopeeManualLogin />
          </TabsContent>
        </Tabs>
      </div>
      
      <InstagramSettings />
      <FutureIntegrationsGrid />
    </div>
  );
}
