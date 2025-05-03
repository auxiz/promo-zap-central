
import { Card } from '@/components/ui/card';
import { ShopeeStatusBadge } from './shopee/ShopeeStatusBadge';
import { ShopeeCredentialForm } from './shopee/ShopeeCredentialForm';
import { ShopeeInfoText } from './shopee/ShopeeInfoText';
import { ShopeeOAuthSection } from './shopee/ShopeeOAuthSection';
import { ShopeeOAuthFlow } from './shopee/ShopeeOAuthFlow';
import { useShopeeCredentials } from '@/hooks/useShopeeCredentials';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  
  // Listen for messages from the OAuth popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate the origin of the message
      if (event.origin !== window.location.origin) return;
      
      // Check if this is our OAuth success message
      if (event.data && event.data.type === 'SHOPEE_OAUTH_SUCCESS') {
        console.log('Received OAuth success message from popup');
        refreshShopeeStatus();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [refreshShopeeStatus]);
  
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
        
        <Tabs defaultValue="oauth" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="oauth">Autenticação OAuth API</TabsTrigger>
            <TabsTrigger value="manual">Login Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="oauth" className="space-y-4">
            <ShopeeOAuthFlow 
              appId={shopeeSettings.appId} 
              onAuthSuccess={refreshShopeeStatus}
            />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Sobre a Autenticação OAuth:</p>
              <p>
                Este método de autenticação conecta sua aplicação diretamente à API oficial da Shopee para afiliados,
                permitindo operações automatizadas como conversão de links e acesso a relatórios de desempenho.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <ShopeeOAuthSection 
              appId={shopeeSettings.appId} 
              hasToken={shopeeSettings.hasToken}
              onAuthSuccess={refreshShopeeStatus}
            />
          </TabsContent>
        </Tabs>
        
        <ShopeeInfoText />
      </div>
    </Card>
  );
}
