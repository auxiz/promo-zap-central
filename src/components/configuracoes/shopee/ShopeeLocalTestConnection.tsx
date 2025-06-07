
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertTriangle, Link, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { LocalShopeeCredentials } from '@/hooks/useLocalShopeeCredentials';

interface ShopeeLocalTestConnectionProps {
  credentials: LocalShopeeCredentials;
  isLoading: boolean;
  testCredentials: (testUrl?: string) => Promise<boolean>;
}

export function ShopeeLocalTestConnection({ 
  credentials, 
  isLoading, 
  testCredentials 
}: ShopeeLocalTestConnectionProps) {
  const [testUrl, setTestUrl] = useState('https://s.shopee.com.br/7Kk8W2vbwM');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasCredentials = credentials.appId && credentials.secretKey;

  const handleTestConversion = async () => {
    if (!hasCredentials || !testUrl) return;

    setConvertedUrl(null);
    setError(null);

    try {
      const response = await fetch('/api/v1/shopee/convert-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: credentials.appId,
          secret_key: credentials.secretKey,
          original_url: testUrl
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setConvertedUrl(result.affiliate_url);
        toast.success('Link convertido com sucesso!');
      } else {
        const errorMessage = result.message || result.details || 'Erro na conversão';
        setError(errorMessage);
        
        if (errorMessage.includes('Authentication failed')) {
          toast.error('Credenciais inválidas: Verifique App ID e Secret Key');
        } else {
          toast.error(`Erro na conversão: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Erro ao converter link:', error);
      setError('Erro de conexão');
      toast.error('Erro de conexão ao converter link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência!');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-md font-medium">Teste de Conversão de Link</h4>
        <p className="text-sm text-muted-foreground">
          Teste suas credenciais convertendo um link da Shopee para um link de afiliado
        </p>
      </div>

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
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleTestConversion}
          disabled={!hasCredentials || !testUrl || isLoading}
          className="bg-primary text-primary-foreground flex items-center gap-2"
        >
          <Link className="h-4 w-4" />
          {isLoading ? 'Convertendo...' : 'Converter Link de Teste'}
        </Button>
      </div>

      {convertedUrl && (
        <Alert className="border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-800">Link convertido com sucesso!</p>
              <div className="mt-2 p-2 bg-white border rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                    {convertedUrl}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(convertedUrl)}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(convertedUrl, '_blank')}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-green-500 mt-2">
                Suas credenciais estão funcionando corretamente!
              </p>
            </div>
          </div>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Erro na conversão</p>
              <AlertDescription className="text-red-600 mt-1">{error}</AlertDescription>
              <p className="text-xs text-red-500 mt-2">
                Verifique se as credenciais estão corretas e se o link é válido
              </p>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}
