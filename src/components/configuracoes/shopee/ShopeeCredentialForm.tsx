
import { type ShopeeCredentials } from '@/hooks/useShopeeCredentials';
import { ShopeeAppIdField } from './ShopeeAppIdField';
import { ShopeeSecretKeyField } from './ShopeeSecretKeyField';
import { ShopeeFormActions } from './ShopeeFormActions';
import { useShopeeForm } from '@/hooks/useShopeeForm';

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
    </>
  );
}
