
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { type ShopeeCredentials } from '@/hooks/useShopeeCredentials';

interface ShopeeCredentialFormProps {
  shopeeSettings: ShopeeCredentials;
  setShopeeSettings: React.Dispatch<React.SetStateAction<ShopeeCredentials>>;
  saveShopeeCredentials: () => Promise<void>;
  testShopeeConnection: () => Promise<void>;
}

export function ShopeeCredentialForm({
  shopeeSettings,
  setShopeeSettings,
  saveShopeeCredentials,
  testShopeeConnection
}: ShopeeCredentialFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shopee-app-id" className="block text-sm font-medium mb-1">
            APP ID
          </label>
          <Input
            id="shopee-app-id"
            value={shopeeSettings.appId}
            onChange={(e) => setShopeeSettings({ ...shopeeSettings, appId: e.target.value })}
            placeholder="Insira o APP ID da API Shopee"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="shopee-secret-key" className="block text-sm font-medium mb-1">
            Secret Key
          </label>
          <Input
            id="shopee-secret-key"
            type="password"
            value={shopeeSettings.secretKey}
            onChange={(e) => setShopeeSettings({ ...shopeeSettings, secretKey: e.target.value })}
            placeholder="Insira a Secret Key da API Shopee"
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={saveShopeeCredentials}
          disabled={!shopeeSettings.appId || !shopeeSettings.secretKey || shopeeSettings.isLoading}
          variant="outline"
        >
          {shopeeSettings.isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </span>
          ) : (
            'Salvar Credenciais'
          )}
        </Button>
        
        <Button
          onClick={testShopeeConnection}
          disabled={!shopeeSettings.appId || !shopeeSettings.secretKey || shopeeSettings.isLoading}
          className="bg-primary text-primary-foreground"
        >
          {shopeeSettings.isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validando...
            </span>
          ) : (
            'Testar Conexão'
          )}
        </Button>
      </div>
    </>
  );
}
