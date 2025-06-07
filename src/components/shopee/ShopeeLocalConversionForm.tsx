
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useLocalShopeeCredentials } from '@/hooks/useLocalShopeeCredentials';

export function ShopeeLocalConversionForm() {
  const { credentials, hasCredentials } = useLocalShopeeCredentials();
  const [originalUrl, setOriginalUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    affiliate_url?: string;
    original_url?: string;
    error?: string;
  } | null>(null);

  const handleConvert = async () => {
    if (!originalUrl) {
      toast.error('Por favor, insira um link da Shopee');
      return;
    }

    if (!hasCredentials) {
      toast.error('Configure suas credenciais da Shopee primeiro');
      return;
    }

    if (!originalUrl.includes('shopee')) {
      toast.error('Por favor, insira um link válido da Shopee');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/v1/shopee/convert-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: credentials.appId,
          secret_key: credentials.secretKey,
          original_url: originalUrl
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setResult({
          success: true,
          affiliate_url: data.affiliate_url,
          original_url: data.original_url
        });
        toast.success('Link convertido com sucesso!');
      } else {
        setResult({
          success: false,
          error: data.message || data.details || 'Erro desconhecido'
        });
        
        if (data.details && data.details.includes('Authentication failed')) {
          toast.error('Credenciais inválidas: Verifique suas credenciais nas configurações');
        } else {
          toast.error(`Erro na conversão: ${data.message || 'Erro desconhecido'}`);
        }
      }
    } catch (error) {
      console.error('Error converting link:', error);
      
      let errorMessage = 'Erro de conexão';
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão com o servidor';
      }
      
      setResult({
        success: false,
        error: errorMessage
      });
      
      toast.error(`Erro na conversão: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência!');
  };

  return (
    <div className="space-y-4">
      {!hasCredentials && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure suas credenciais da Shopee na seção de configurações acima antes de converter links.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="originalUrl">Link da Shopee para Conversão</Label>
        <Input
          id="originalUrl"
          placeholder="https://shopee.com.br/product/..."
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          disabled={!hasCredentials}
        />
      </div>

      <Button 
        onClick={handleConvert} 
        disabled={isLoading || !originalUrl || !hasCredentials}
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Convertendo...
          </span>
        ) : (
          'Converter Link'
        )}
      </Button>

      {result && (
        <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              {result.success ? (
                <div className="space-y-2">
                  <p className="text-green-800 font-medium">Link convertido com sucesso!</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                        {result.affiliate_url}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(result.affiliate_url!)}
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(result.affiliate_url, '_blank')}
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AlertDescription className="text-red-800">
                  <span className="font-medium">Erro na conversão:</span> {result.error}
                </AlertDescription>
              )}
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}
