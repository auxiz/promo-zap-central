
import { useState, useEffect } from 'react';
import { ShopeeSettings } from '@/components/configuracoes/ShopeeSettings';
import { InstagramSettings } from '@/components/configuracoes/InstagramSettings';
import { FutureIntegrationsGrid } from '@/components/configuracoes/FutureIntegrationsGrid';
import { API_BASE } from '@/utils/api-constants';

export default function Configuracoes() {
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [shopeeStatus, setShopeeStatus] = useState<'online' | 'offline'>('offline');

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
      
      <ShopeeSettings initialAppId={shopeeAppId} initialStatus={shopeeStatus} />
      <InstagramSettings />
      <FutureIntegrationsGrid />
    </div>
  );
}
