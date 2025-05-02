
import { Input } from '@/components/ui/input';

interface ShopeeSecretKeyFieldProps {
  secretKey: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ShopeeSecretKeyField({ secretKey, onChange, disabled }: ShopeeSecretKeyFieldProps) {
  return (
    <div>
      <label htmlFor="shopee-secret-key" className="block text-sm font-medium mb-1">
        Secret Key
      </label>
      <Input
        id="shopee-secret-key"
        type="password"
        value={secretKey}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Insira a Secret Key da API Shopee"
        className="w-full"
        disabled={disabled}
      />
    </div>
  );
}
