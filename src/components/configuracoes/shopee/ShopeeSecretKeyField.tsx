
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface ShopeeSecretKeyFieldProps {
  secretKey: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ShopeeSecretKeyField({ secretKey, onChange, disabled }: ShopeeSecretKeyFieldProps) {
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  const toggleSecretVisibility = () => {
    setShowSecretKey(!showSecretKey);
  };

  return (
    <div>
      <label htmlFor="shopee-secret-key" className="block text-sm font-medium mb-1">
        Secret Key
      </label>
      <div className="relative">
        <Input
          id="shopee-secret-key"
          type={showSecretKey ? "text" : "password"}
          value={secretKey}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Insira a Secret Key da API Shopee"
          className="w-full pr-10"
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={toggleSecretVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          aria-label={showSecretKey ? "Ocultar Secret Key" : "Mostrar Secret Key"}
        >
          {showSecretKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
