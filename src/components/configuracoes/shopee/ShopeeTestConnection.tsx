
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, Check, AlertTriangle, Link } from 'lucide-react';
import { API_BASE } from '@/utils/api-constants';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
  const [convertedUrl, setConvertedUrl] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState('');
  
  const isFormValid = !!appId && !!secretKey && !!testUrl;
  
  const handleTestConnection = async () => {
    // First test the basic connection
    try {
      await onTest();
    } catch (error) {
      console.error("Connection test failed:", error);
      return; // If the basic test fails, don't proceed with link conversion
    }
    
    // If connection test passed, try to convert the link
    await convertTestLink();
  };
  
  const convertTestLink = async () => {
    if (!isFormValid || !testUrl) return;
    
    setIsConverting(true);
    setConvertedUrl('');
    setConversionError('');
    
    try {
      const response = await fetch(`${API_BASE}/api/shopee/affiliate/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      });
      
      // Check if the response is valid JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server. Please verify the API endpoint.');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao converter link');
      }
      
      if (result.success && result.affiliate_url) {
        setConvertedUrl(result.affiliate_url);
        toast.success('Link convertido com sucesso!');
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao converter link:', error);
      setConversionError(error.message || 'Erro ao converter link');
      toast.error(`Falha na conversão: ${error.message || 'Verifique as credenciais'}`);
    } finally {
      setIsConverting(false);
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
            </div>
          </div>
        </div>
      )}
      
      {conversionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Erro na conversão</p>
              <p className="text-sm text-red-600 mt-1">{conversionError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
