
import { Card } from '@/components/ui/card';
import { ShopeeStatusBadge } from './shopee/ShopeeStatusBadge';
import { ShopeeCredentialForm } from './shopee/ShopeeCredentialForm';
import { ShopeeInfoText } from './shopee/ShopeeInfoText';
import { ShopeeOAuthSection } from './shopee/ShopeeOAuthSection';
import { useShopeeCredentials } from '@/hooks/useShopeeCredentials';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ShopeeSettingsProps {
  initialAppId: string;
  initialStatus?: 'online' | 'offline';
  initialHasToken?: boolean;
}

export function ShopeeSettings({ 
  initialAppId, 
  initialStatus = 'offline',
  initialHasToken = false
}: ShopeeSettingsProps) {
  const location = useLocation();
  
  const { 
    shopeeSettings, 
    setShopeeSettings, 
    saveShopeeCredentials, 
    testShopeeConnection,
    refreshShopeeStatus
  } = useShopeeCredentials(initialAppId, initialStatus, initialHasToken);
  
  // Check for OAuth callback params in URL (for direct navigation or page refresh)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    
    // If we have a code in the URL but we're not on the callback page
    if (code && location.pathname !== '/config-shopee/callback') {
      console.log('OAuth code detected in URL, handling as callback');
      
      // This is a safeguard for users who navigate directly with a code in URL
      // We'll refresh the status to capture any successful OAuth flow
      refreshShopeeStatus();
    }
  }, [location, refreshShopeeStatus]);
  
  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Shopee</h2>
          <ShopeeStatusBadge status={shopeeSettings.status} hasToken={shopeeSettings.hasToken} />
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <ShopeeCredentialForm
          shopeeSettings={shopeeSettings}
          setShopeeSettings={setShopeeSettings}
          saveShopeeCredentials={saveShopeeCredentials}
          testShopeeConnection={testShopeeConnection}
        />
        
        <Separator />
        
        <ShopeeOAuthSection 
          appId={shopeeSettings.appId} 
          hasToken={shopeeSettings.hasToken}
          onAuthSuccess={refreshShopeeStatus}
        />
        
        <ShopeeInfoText />
      </div>
    </Card>
  );
}
