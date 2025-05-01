
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

// API base URL from the hook
const API_BASE = 'http://168.231.98.177:4000';

export default function Configuracoes() {
  const [shopeeSettings, setShopeeSettings] = useState({
    appId: '',
    secretKey: '',
    isConnected: false,
    isLoading: false,
  });
  
  const [instagramSettings, setInstagramSettings] = useState({
    accessToken: '',
    isConnected: false,
    isLoading: false,
  });

  // Fetch current Shopee credentials on mount
  useEffect(() => {
    const fetchShopeeCredentials = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/shopee/credentials`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.appId) {
            setShopeeSettings(prev => ({
              ...prev,
              appId: data.appId,
              isConnected: Boolean(data.appId),
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching Shopee credentials:", error);
      }
    };

    fetchShopeeCredentials();
  }, []);
  
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
  
  const testInstagramConnection = () => {
    if (!instagramSettings.accessToken) return;
    
    setInstagramSettings({ ...instagramSettings, isLoading: true });
    
    // Simulate API call
    setTimeout(() => {
      setInstagramSettings({
        ...instagramSettings,
        isLoading: false,
        isConnected: true,
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações de Integrações</h1>
      
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
      
      <Card className="dashboard-card overflow-hidden">
        <div className="border-b p-4 bg-card">
          <h2 className="font-medium">Instagram</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="instagram-token" className="block text-sm font-medium mb-1">
              Access Token
            </label>
            <Input
              id="instagram-token"
              value={instagramSettings.accessToken}
              onChange={(e) => setInstagramSettings({ ...instagramSettings, accessToken: e.target.value })}
              placeholder="Insira o Access Token do Instagram"
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {instagramSettings.isConnected ? (
                <div className="flex items-center text-green-500">
                  <Check size={18} className="mr-1" />
                  <span>Conectado</span>
                </div>
              ) : null}
            </div>
            
            <button
              onClick={testInstagramConnection}
              disabled={!instagramSettings.accessToken || instagramSettings.isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {instagramSettings.isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validando...
                </span>
              ) : (
                'Testar Conexão'
              )}
            </button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>O token de acesso é necessário para publicar automaticamente nas suas redes sociais.</p>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="dashboard-card overflow-hidden">
          <div className="border-b p-4 bg-card">
            <h2 className="font-medium">Amazon</h2>
          </div>
          
          <div className="p-6 flex items-center justify-center h-32 text-muted-foreground">
            <span>Em breve</span>
          </div>
        </Card>
        
        <Card className="dashboard-card overflow-hidden">
          <div className="border-b p-4 bg-card">
            <h2 className="font-medium">Magalu</h2>
          </div>
          
          <div className="p-6 flex items-center justify-center h-32 text-muted-foreground">
            <span>Em breve</span>
          </div>
        </Card>
        
        <Card className="dashboard-card overflow-hidden">
          <div className="border-b p-4 bg-card">
            <h2 className="font-medium">Natura</h2>
          </div>
          
          <div className="p-6 flex items-center justify-center h-32 text-muted-foreground">
            <span>Em breve</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
