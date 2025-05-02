
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// API base URL 
const API_BASE = 'http://168.231.98.177:4000';

interface ShopeeSettingsProps {
  initialAppId: string;
}

export function ShopeeSettings({ initialAppId }: ShopeeSettingsProps) {
  const [shopeeSettings, setShopeeSettings] = useState({
    appId: initialAppId || '',
    secretKey: '',
    status: 'offline',
    isLoading: false,
  });
  
  // Fetch status on mount and every 30 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/shopee/credentials`);
        if (response.ok) {
          const data = await response.json();
          
          setShopeeSettings(prev => ({
            ...prev,
            appId: data.appId || prev.appId,
            status: data.status || 'offline'
          }));
        }
      } catch (error) {
        console.error("Error fetching Shopee status:", error);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
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
      
      const result = await response.json();
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        status: result.status || 'offline',
      });
      
      toast.success('Credenciais da Shopee salvas com sucesso');
      
      // Refresh status after short delay
      setTimeout(async () => {
        try {
          const statusResponse = await fetch(`${API_BASE}/api/shopee/credentials`);
          if (statusResponse.ok) {
            const data = await statusResponse.json();
            setShopeeSettings(prev => ({
              ...prev,
              status: data.status || 'offline'
            }));
          }
        } catch (error) {
          console.error("Error refreshing Shopee status:", error);
        }
      }, 1000);
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
      
      // Refresh status after successful test
      const statusResponse = await fetch(`${API_BASE}/api/shopee/credentials`);
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        setShopeeSettings({
          ...shopeeSettings,
          isLoading: false,
          status: data.status || 'offline',
        });
      } else {
        setShopeeSettings({
          ...shopeeSettings,
          isLoading: false,
          status: 'online', // Assume online if test worked
        });
      }
      
      toast.success('Conexão com a API da Shopee estabelecida com sucesso');
    } catch (error) {
      console.error("Error testing Shopee connection:", error);
      toast.error(`Erro na conexão com a API da Shopee: ${error.message || 'Verifique as credenciais'}`);
      
      setShopeeSettings({
        ...shopeeSettings,
        isLoading: false,
        status: 'offline',
      });
    }
  };

  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Shopee</h2>
          {shopeeSettings.status === 'online' ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Check size={14} className="mr-1" /> Online
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle size={14} className="mr-1" /> Offline
            </Badge>
          )}
        </div>
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
        
        <div className="text-sm text-muted-foreground">
          <p>Para obter suas credenciais Shopee, acesse o Portal de Desenvolvedores da Shopee.</p>
          <p className="mt-1">As credenciais são necessárias para converter links de produtos da Shopee em links de afiliado.</p>
        </div>
      </div>
    </Card>
  );
}
