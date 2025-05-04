
import { type ShopeeCredentials } from '@/hooks/useShopeeCredentials';
import { ShopeeAppIdField } from './ShopeeAppIdField';
import { ShopeeSecretKeyField } from './ShopeeSecretKeyField';
import { ShopeeFormActions } from './ShopeeFormActions';
import { ShopeeTestConnection } from './ShopeeTestConnection';
import { useShopeeForm } from '@/hooks/useShopeeForm';
import { Separator } from '@/components/ui/separator';

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
  const { 
    handleAppIdChange, 
    handleSecretKeyChange,
    isFormValid
  } = useShopeeForm(shopeeSettings, setShopeeSettings);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShopeeAppIdField 
          appId={shopeeSettings.appId}
          onChange={handleAppIdChange}
          disabled={shopeeSettings.isLoading}
        />
        
        <ShopeeSecretKeyField 
          secretKey={shopeeSettings.secretKey}
          onChange={handleSecretKeyChange}
          disabled={shopeeSettings.isLoading}
        />
      </div>
      
      <ShopeeFormActions 
        isValid={isFormValid}
        isLoading={shopeeSettings.isLoading}
        onSave={saveShopeeCredentials}
        onTest={testShopeeConnection}
      />
      
      <Separator className="my-6" />
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Teste de Conversão de Link</h3>
        <p className="text-sm text-muted-foreground">
          Teste suas credenciais convertendo um link da Shopee para um link de afiliado
        </p>
        
        <ShopeeTestConnection
          appId={shopeeSettings.appId}
          secretKey={shopeeSettings.secretKey}
          isLoading={shopeeSettings.isLoading}
          onTest={testShopeeConnection}
        />
      </div>
    </>
  );
}
