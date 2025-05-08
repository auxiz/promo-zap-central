
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { convertShopeeLink } from '@/services/shopee-api';
import { toast } from 'sonner';

interface UseShopeeConversionResult {
  convertUrl: (url: string) => Promise<void>;
  convertedUrl: string | null;
  originalUrl: string | null;
  isConverting: boolean;
  error: string | null;
  apiSource: 'alternative' | 'graphql' | null;
  resetConversion: () => void;
}

export const useShopeeConversion = (): UseShopeeConversionResult => {
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<'alternative' | 'graphql' | null>(null);
  
  const mutation = useMutation({
    mutationFn: convertShopeeLink,
    onSuccess: (data) => {
      if (data.status === 'success' && data.affiliate_url) {
        setConvertedUrl(data.affiliate_url);
        setOriginalUrl(data.original_url || null);
        setApiSource(data.source || null);
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
  
  const convertUrl = async (url: string) => {
    setOriginalUrl(url);
    setConvertedUrl(null);
    setError(null);
    setApiSource(null);
    
    await mutation.mutateAsync(url);
  };
  
  const resetConversion = () => {
    setConvertedUrl(null);
    setOriginalUrl(null);
    setError(null);
    setApiSource(null);
  };
  
  return {
    convertUrl,
    convertedUrl,
    originalUrl,
    isConverting: mutation.isPending,
    error,
    apiSource,
    resetConversion
  };
};
