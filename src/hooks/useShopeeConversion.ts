
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
      console.log('Shopee conversion result:', data);
      
      if (data.status === 'success' && data.affiliate_url) {
        setConvertedUrl(data.affiliate_url);
        setOriginalUrl(data.original_url || null);
        setApiSource(data.source || null);
        setError(null);
        
        // Show success message with source info
        const sourceText = data.source === 'alternative' ? 'API Alternativa' : 'API GraphQL';
        toast.success(`Link convertido com sucesso via ${sourceText}!`);
      } else {
        const errorMessage = data.message || data.details || 'Falha ao converter link';
        setError(errorMessage);
        setConvertedUrl(null);
        setApiSource(null);
        
        // Show more specific error messages
        if (errorMessage.includes('credentials') || errorMessage.includes('Authentication')) {
          toast.error('Erro de autenticação: Verifique suas credenciais da Shopee');
        } else if (errorMessage.includes('Rate limit')) {
          toast.error('Limite de requisições atingido: Tente novamente em alguns minutos');
        } else if (errorMessage.includes('timeout')) {
          toast.error('Timeout: A API da Shopee não respondeu a tempo');
        } else {
          toast.error(`Falha na conversão: ${errorMessage}`);
        }
      }
    },
    onError: (error: Error) => {
      console.error('Shopee conversion error:', error);
      
      const errorMessage = error.message || 'Falha ao converter link';
      setError(errorMessage);
      setConvertedUrl(null);
      setApiSource(null);
      
      // Show appropriate error message based on error type
      if (errorMessage.includes('Failed to fetch')) {
        toast.error('Erro de conexão: Verifique se o backend está rodando');
      } else if (errorMessage.includes('Network Error')) {
        toast.error('Erro de rede: Verifique sua conexão com a internet');
      } else {
        toast.error(`Erro na conversão: ${errorMessage}`);
      }
    }
  });
  
  const convertUrl = async (url: string) => {
    console.log('Starting Shopee URL conversion:', url);
    
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
