
import { Input } from '@/components/ui/input';
import { type ShopeeCredentials } from '@/hooks/useShopeeCredentials';

interface ShopeeAppIdFieldProps {
  appId: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ShopeeAppIdField({ appId, onChange, disabled }: ShopeeAppIdFieldProps) {
  return (
    <div>
      <label htmlFor="shopee-app-id" className="block text-sm font-medium mb-1">
        APP ID
      </label>
      <Input
        id="shopee-app-id"
        value={appId}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Insira o APP ID da API Shopee"
        className="w-full"
        disabled={disabled}
      />
    </div>
  );
}
