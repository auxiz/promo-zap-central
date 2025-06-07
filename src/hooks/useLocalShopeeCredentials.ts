
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface LocalShopeeCredentials {
  appId: string;
  secretKey: string;
  lastTested?: string;
  isValid?: boolean;
}

const STORAGE_KEY = 'promozap_shopee_credentials';

export function useLocalShopeeCredentials() {
  const [credentials, setCredentials] = useState<LocalShopeeCredentials>({
    appId: '',
    secretKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar credenciais do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCredentials(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar credenciais salvas:', error);
    }
  }, []);

  // Salvar credenciais no localStorage
  const saveCredentials = useCallback((newCredentials: Partial<LocalShopeeCredentials>) => {
    const updated = { ...credentials, ...newCredentials };
    setCredentials(updated);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success('Credenciais salvas localmente');
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
      toast.error('Erro ao salvar credenciais');
    }
  }, [credentials]);

  // Limpar credenciais
  const clearCredentials = useCallback(() => {
    setCredentials({
      appId: '',
      secretKey: '',
    });
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Credenciais removidas');
  }, []);

  // Testar credenciais fazendo uma conversão de teste
  const testCredentials = useCallback(async (testUrl: string = 'https://s.shopee.com.br/7Kk8W2vbwM') => {
    if (!credentials.appId || !credentials.secretKey) {
      toast.error('Por favor, preencha App ID e Secret Key');
      return false;
    }

    setIsLoading(true);
    
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
        const updatedCredentials = {
          ...credentials,
          lastTested: new Date().toISOString(),
          isValid: true
        };
        saveCredentials(updatedCredentials);
        toast.success('Credenciais válidas! Conexão estabelecida.');
        return true;
      } else {
        const updatedCredentials = {
          ...credentials,
          lastTested: new Date().toISOString(),
          isValid: false
        };
        saveCredentials(updatedCredentials);
        
        if (result.details && result.details.includes('Authentication failed')) {
          toast.error('Credenciais inválidas: Verifique App ID e Secret Key');
        } else {
          toast.error(`Erro na validação: ${result.message || 'Credenciais inválidas'}`);
        }
        return false;
      }
    } catch (error) {
      console.error('Erro ao testar credenciais:', error);
      toast.error('Erro de conexão ao testar credenciais');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [credentials, saveCredentials]);

  // Verificar se as credenciais estão completas
  const hasCredentials = credentials.appId && credentials.secretKey;
  
  // Status baseado na validação local
  const status: 'online' | 'offline' = credentials.isValid ? 'online' : 'offline';

  return {
    credentials,
    setCredentials,
    saveCredentials,
    clearCredentials,
    testCredentials,
    hasCredentials,
    status,
    isLoading
  };
}
