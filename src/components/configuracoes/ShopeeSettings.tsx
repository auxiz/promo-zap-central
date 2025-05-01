
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

// API base URL 
const API_BASE = 'http://168.231.98.177:4000';

interface ShopeeSettingsProps {
  initialAppId: string;
}

export function ShopeeSettings({ initialAppId }: ShopeeSettingsProps) {
  const [shopeeSettings, setShopeeSettings] = useState({
    appId: initialAppId || '',
    secretKey: '',
    isConnected: Boolean(initialAppId),
    isLoading: false,
  });
  
  const saveShopeeCredentials = async () => {
    if (!shopeeSettings.appId || !shopeeSettings.secretKey) return;
    
    setShopeeSettings({ ...shopeeSettings, isLoading: true });
    
    try {
      const response = await fetch(`${API_BASE}/api/shopee/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: shopeeSettings.appId,
          secretKey: shopeeSettings.secretKey,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save credentials');
      }
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        isConnected: true,
      });
      
      toast.success('Credenciais da Shopee salvas com sucesso');
    } catch (error) {
      console.error("Error saving Shopee credentials:", error);
      toast.error('Erro ao salvar credenciais da Shopee');
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
      });
    }
  };
  
  const testShopeeConnection = async () => {
    if (!shopeeSettings.appId || !shopeeSettings.secretKey) return;
    
    setShopeeSettings({ ...shopeeSettings, isLoading: true });
    
    try {
      // Test URL conversion - this validates the credentials work
      const testUrl = 'https://shopee.com.br/product/123/456';
      
      const response = await fetch(`${API_BASE}/api/shopee/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Credenciais inválidas');
      }
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        isConnected: true,
      });
      
      toast.success('Conexão com a API da Shopee estabelecida com sucesso');
    } catch (error) {
      console.error("Error testing Shopee connection:", error);
      toast.error(`Erro na conexão com a API da Shopee: ${error.message || 'Verifique as credenciais'}`);
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        isConnected: false,
      });
    }
  };

  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="border-b p-4 bg-card">
        <h2 className="font-medium">Shopee</h2>
      </div>
      
      <div className="p-6 space-y-4">
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {shopeeSettings.isConnected ? (
              <div className="flex items-center text-green-500">
                <Check size={18} className="mr-1" />
                <span>Conectado</span>
              </div>
            ) : null}
          </div>
          
          <div className="space-x-2">
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
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Para obter suas credenciais Shopee, acesse o Portal de Desenvolvedores da Shopee.</p>
          <p className="mt-1">As credenciais são necessárias para converter links de produtos da Shopee em links de afiliado.</p>
        </div>
      </div>
    </Card>
  );
}
