
import { useState, useEffect } from 'react';
import { ShopeeSettings } from '@/components/configuracoes/ShopeeSettings';
import { InstagramSettings } from '@/components/configuracoes/InstagramSettings';
import { FutureIntegrationsGrid } from '@/components/configuracoes/FutureIntegrationsGrid';

// API base URL from the hook
const API_BASE = 'http://168.231.98.177:4000';

export default function Configuracoes() {
  const [shopeeAppId, setShopeeAppId] = useState('');

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
      
      <ShopeeSettings initialAppId={shopeeAppId} />
      <InstagramSettings />
      <FutureIntegrationsGrid />
    </div>
  );
}
