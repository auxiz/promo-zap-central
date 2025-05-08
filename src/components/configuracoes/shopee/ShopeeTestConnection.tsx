
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, Check, AlertTriangle, Link } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useShopeeConversion } from '@/hooks/useShopeeConversion';

interface ShopeeTestConnectionProps {
  appId: string;
  secretKey: string;
  isLoading: boolean;
  onTest: () => Promise<void>;
}

export function ShopeeTestConnection({ 
  appId, 
  secretKey, 
  isLoading, 
  onTest 
}: ShopeeTestConnectionProps) {
  const [testUrl, setTestUrl] = useState('https://s.shopee.com.br/7Kk8W2vbwM');
  const { 
    convertUrl, 
    convertedUrl, 
    isConverting, 
    error,
    apiSource 
  } = useShopeeConversion();
  
  const isFormValid = !!appId && !!secretKey && !!testUrl;
  
  const handleTestConnection = async () => {
    // First test the basic connection
    try {
      await onTest();
      
      // If connection test passed, try to convert the link
      await convertTestLink();
    } catch (error) {
      console.error("Connection test failed:", error);
      toast.error("Falha ao testar conexão com a API Shopee");
    }
  };
  
  const convertTestLink = async () => {
    if (!isFormValid || !testUrl) return;
    
    try {
      await convertUrl(testUrl);
    } catch (error) {
      console.error('Erro ao converter link:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="test-url" className="block text-sm font-medium">
          URL para teste de conversão
        </label>
        <Input
          id="test-url"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          placeholder="Cole um link da Shopee para testar"
          className="w-full"
          disabled={isLoading || isConverting}
        />
        <p className="text-xs text-muted-foreground">
          Cole um link de produto da Shopee para converter para link de afiliado
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleTestConnection}
          disabled={!isFormValid || isLoading || isConverting}
          className="bg-primary text-primary-foreground flex items-center gap-2"
        >
          {(isLoading || isConverting) ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              {isConverting ? 'Convertendo...' : 'Testando...'}
            </>
          ) : (
            <>
              <Link className="h-4 w-4" />
              Testar Conexão e Converter
            </>
          )}
        </Button>
      </div>
      
      {convertedUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Link convertido com sucesso!</p>
              <p className="text-sm text-green-600 mt-1 break-all">{convertedUrl}</p>
              <p className="text-xs text-green-500 mt-2">
                Link gerado usando a API {apiSource === 'alternative' ? 'alternativa' : 'GraphQL da Shopee Afiliados'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Erro na conversão</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <p className="text-xs text-red-500 mt-2">
                Verifique se as credenciais estão corretas e se o link é válido
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
