
import { Card } from '@/components/ui/card';
import { ShopeeStatusBadge } from './shopee/ShopeeStatusBadge';
import { ShopeeCredentialForm } from './shopee/ShopeeCredentialForm';
import { ShopeeInfoText } from './shopee/ShopeeInfoText';
import { ShopeeOAuthSection } from './shopee/ShopeeOAuthSection';
import { useShopeeCredentials } from '@/hooks/useShopeeCredentials';
import { Separator } from '@/components/ui/separator';

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
  const { 
    shopeeSettings, 
    setShopeeSettings, 
    saveShopeeCredentials, 
    testShopeeConnection,
    refreshShopeeStatus
  } = useShopeeCredentials(initialAppId, initialStatus, initialHasToken);
  
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
