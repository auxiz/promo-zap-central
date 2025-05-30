
import { Card } from '@/components/ui/card';
import { ShopeeStatusBadge } from './shopee/ShopeeStatusBadge';
import { ShopeeCredentialForm } from './shopee/ShopeeCredentialForm';
import { ShopeeInfoText } from './shopee/ShopeeInfoText';
import { useShopeeCredentials } from '@/hooks/useShopeeCredentials';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

interface ShopeeSettingsProps {
  initialAppId: string;
  initialStatus?: 'online' | 'offline';
  initialHasToken?: boolean;
}

export function ShopeeSettings({ 
  initialAppId, 
  initialStatus = 'offline'
}: ShopeeSettingsProps) {
  const { 
    shopeeSettings, 
    setShopeeSettings, 
    saveShopeeCredentials, 
    testShopeeConnection,
    refreshShopeeStatus
  } = useShopeeCredentials(initialAppId, initialStatus);
  
  useEffect(() => {
    refreshShopeeStatus();
  }, [refreshShopeeStatus]);
  
  return (
    <Card className="dashboard-card overflow-hidden w-full max-w-full">
      <div className="border-b p-4 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="font-medium text-sm sm:text-base">Integração Shopee Afiliados</h2>
          <ShopeeStatusBadge status={shopeeSettings.status} />
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-6 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full">
          <ShopeeCredentialForm
            shopeeSettings={shopeeSettings}
            setShopeeSettings={setShopeeSettings}
            saveShopeeCredentials={saveShopeeCredentials}
            testShopeeConnection={testShopeeConnection}
          />
        </div>
        
        <Separator />
        
        <div className="text-sm text-muted-foreground space-y-4 w-full max-w-full">
          <p className="font-medium mb-2">Sobre a Autenticação Direta:</p>
          <div className="space-y-3">
            <p>
              Este método de autenticação utiliza suas credenciais da API da Shopee (APP ID e Secret Key)
              para se conectar diretamente à API GraphQL de Afiliados da Shopee sem necessidade de 
              autenticação OAuth ou login manual.
            </p>
            <p>
              A autenticação direta utiliza assinaturas HMAC-SHA256 para cada requisição, garantindo
              a segurança da conexão sem necessidade de tokens ou cookies de sessão.
            </p>
            <p className="break-words">
              Para obter suas credenciais de API, acesse o 
              <a href="https://affiliate.shopee.com.br/portfolio/api-settings" target="_blank" rel="noopener noreferrer" 
                 className="text-primary hover:underline ml-1 break-all">
                Painel de Afiliados da Shopee
              </a>.
            </p>
          </div>
        </div>
        
        <ShopeeInfoText />
      </div>
    </Card>
  );
}
