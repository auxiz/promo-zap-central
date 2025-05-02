
import { Card } from '@/components/ui/card';
import { ShopeeStatusBadge } from './shopee/ShopeeStatusBadge';
import { ShopeeCredentialForm } from './shopee/ShopeeCredentialForm';
import { ShopeeInfoText } from './shopee/ShopeeInfoText';
import { useShopeeCredentials } from '@/hooks/useShopeeCredentials';

interface ShopeeSettingsProps {
  initialAppId: string;
  initialStatus?: 'online' | 'offline';
}

export function ShopeeSettings({ initialAppId, initialStatus = 'offline' }: ShopeeSettingsProps) {
  const { 
    shopeeSettings, 
    setShopeeSettings, 
    saveShopeeCredentials, 
    testShopeeConnection 
  } = useShopeeCredentials(initialAppId, initialStatus);
  
  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Shopee</h2>
          <ShopeeStatusBadge status={shopeeSettings.status} />
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <ShopeeCredentialForm
          shopeeSettings={shopeeSettings}
          setShopeeSettings={setShopeeSettings}
          saveShopeeCredentials={saveShopeeCredentials}
          testShopeeConnection={testShopeeConnection}
        />
        
        <ShopeeInfoText />
      </div>
    </Card>
  );
}
