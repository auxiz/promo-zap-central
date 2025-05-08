
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, Check, AlertTriangle, Link } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useShopeeConversion } from '@/hooks/useShopeeConversion';

export function ShopeeConversionForm() {
  const [inputUrl, setInputUrl] = useState('https://s.shopee.com.br/7Kk8W2vbwM');
  const { 
    convertUrl, 
    convertedUrl,
    originalUrl,
    isConverting, 
    error, 
    apiSource 
  } = useShopeeConversion();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;
    
    await convertUrl(inputUrl);
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="shopee-url" className="block text-sm font-medium">
          URL da Shopee para conversão
        </label>
        <div className="flex gap-2">
          <Input
            id="shopee-url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Cole um link da Shopee para converter"
            className="flex-1"
            disabled={isConverting}
          />
          <Button
            type="submit"
            disabled={!inputUrl || isConverting}
            className="bg-primary text-primary-foreground flex items-center gap-2"
          >
            {isConverting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Convertendo...
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                Converter
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cole um link de produto da Shopee para converter para link de afiliado
        </p>
      </form>
      
      {convertedUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Link convertido com sucesso!</p>
              <p className="text-sm text-green-600 mt-1 break-all">{convertedUrl}</p>
              {originalUrl && (
                <p className="text-xs text-green-500 mt-2">
                  Link original: {originalUrl}
                </p>
              )}
              {apiSource && (
                <p className="text-xs text-green-500 mt-1">
                  Link gerado usando a API {apiSource === 'alternative' ? 'alternativa' : 'GraphQL da Shopee Afiliados'}
                </p>
              )}
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
                Verifique se o link é válido ou tente novamente mais tarde
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
