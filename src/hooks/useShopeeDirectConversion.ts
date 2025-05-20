
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  convertShopeeDirectLink, 
  type ShopeeDirectConversionRequest 
} from '@/services/shopee-direct-api';
import { toast } from 'sonner';

interface UseShopeeDirectConversionResult {
  convertUrl: (data: ShopeeDirectConversionRequest) => Promise<void>;
  convertedUrl: string | null;
  isConverting: boolean;
  error: string | null;
  resetConversion: () => void;
}

export const useShopeeDirectConversion = (): UseShopeeDirectConversionResult => {
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mutation = useMutation({
    mutationFn: convertShopeeDirectLink,
    onSuccess: (data) => {
      if (data.status === 'success' && data.affiliate_url) {
        setConvertedUrl(data.affiliate_url);
        setError(null);
        toast.success('Link convertido com sucesso!');
      } else {
        setError(data.message || 'Falha ao converter link');
        toast.error(`Falha na conversão: ${data.message || 'Erro desconhecido'}`);
      }
    },
    onError: (error: Error) => {
      setError(error.message || 'Falha ao converter link');
      setConvertedUrl(null);
      toast.error(`Erro na conversão: ${error.message}`);
    }
  });
  
  const convertUrl = async (data: ShopeeDirectConversionRequest) => {
    setConvertedUrl(null);
    setError(null);
    
    await mutation.mutateAsync(data);
  };
  
  const resetConversion = () => {
    setConvertedUrl(null);
    setError(null);
  };
  
  return {
    convertUrl,
    convertedUrl,
    isConverting: mutation.isPending,
    error,
    resetConversion
  };
};
