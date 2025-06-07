
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Key, Loader2, Trash2 } from 'lucide-react';
import { useLocalShopeeCredentials } from '@/hooks/useLocalShopeeCredentials';
import { ShopeeStatusBadge } from './ShopeeStatusBadge';
import { ShopeeLocalTestConnection } from './ShopeeLocalTestConnection';

export function ShopeeLocalCredentialForm() {
  const {
    credentials,
    setCredentials,
    saveCredentials,
    clearCredentials,
    testCredentials,
    hasCredentials,
    status,
    isLoading
  } = useLocalShopeeCredentials();

  const [showSecretKey, setShowSecretKey] = useState(false);

  const handleAppIdChange = (value: string) => {
    setCredentials({ ...credentials, appId: value });
  };

  const handleSecretKeyChange = (value: string) => {
    setCredentials({ ...credentials, secretKey: value });
  };

  const handleSave = () => {
    if (!credentials.appId || !credentials.secretKey) {
      return;
    }
    saveCredentials(credentials);
  };

  const toggleSecretVisibility = () => {
    setShowSecretKey(!showSecretKey);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Suas Credenciais da Shopee</h3>
        <ShopeeStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shopee-app-id" className="block text-sm font-medium mb-1">
            APP ID
          </label>
          <Input
            id="shopee-app-id"
            value={credentials.appId}
            onChange={(e) => handleAppIdChange(e.target.value)}
            placeholder="Insira o APP ID da API Shopee"
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="shopee-secret-key" className="block text-sm font-medium mb-1">
            Secret Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="shopee-secret-key"
              type={showSecretKey ? "text" : "password"}
              value={credentials.secretKey}
              onChange={(e) => handleSecretKeyChange(e.target.value)}
              placeholder="Insira a Secret Key da API Shopee"
              className="w-full pl-10 pr-10"
              disabled={isLoading}
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
          <p className="text-xs text-muted-foreground mt-1">
            Suas credenciais são salvas apenas no seu navegador
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!credentials.appId || !credentials.secretKey || isLoading}
            variant="outline"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </span>
            ) : (
              'Salvar Localmente'
            )}
          </Button>

          <Button
            onClick={() => testCredentials()}
            disabled={!hasCredentials || isLoading}
            className="bg-primary text-primary-foreground"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Testando...
              </span>
            ) : (
              'Testar Conexão'
            )}
          </Button>
        </div>

        {hasCredentials && (
          <Button
            onClick={clearCredentials}
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {credentials.lastTested && (
        <div className="text-xs text-muted-foreground">
          Última validação: {new Date(credentials.lastTested).toLocaleString('pt-BR')}
        </div>
      )}

      <Separator />

      <ShopeeLocalTestConnection
        credentials={credentials}
        isLoading={isLoading}
        testCredentials={testCredentials}
      />
    </div>
  );
}
