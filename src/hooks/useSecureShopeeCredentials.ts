
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeCredentials, logSecurely } from '@/utils/security';

interface ShopeeCredentials {
  appId: string;
  secretKey: string;
  status?: string;
}

export const useSecureShopeeCredentials = () => {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<ShopeeCredentials | null>(null);
  const { user } = useAuth();

  const saveCredentials = useCallback(async (appId: string, secretKey: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_shopee_credentials')
        .upsert({
          user_id: user.id,
          app_id: appId,
          secret_key: secretKey,
          status: 'pending'
        });

      if (error) {
        logSecurely('Error saving Shopee credentials:', { error: error.message });
        throw error;
      }

      logSecurely('Shopee credentials saved successfully');
      toast.success('Credenciais salvas com sucesso!');
      return true;
    } catch (error: any) {
      logSecurely('Failed to save Shopee credentials:', { error: error.message });
      toast.error('Erro ao salvar credenciais');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const testConnection = useCallback(async (appId: string, secretKey: string) => {
    setLoading(true);
    try {
      // Don't log actual credentials in the request
      logSecurely('Testing Shopee connection...');
      
      const response = await fetch('/api/shopee/connect/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appId, secretKey }),
      });

      const data = await response.json();
      
      if (data.success) {
        logSecurely('Shopee connection test successful');
        toast.success('Conexão com Shopee estabelecida com sucesso!');
        return true;
      } else {
        logSecurely('Shopee connection test failed:', { status: data.status });
        toast.error('Falha na conexão com Shopee');
        return false;
      }
    } catch (error: any) {
      logSecurely('Shopee connection test error:', { error: error.message });
      toast.error('Erro ao testar conexão');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCredentials = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_shopee_credentials')
        .select('app_id, secret_key, status')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCredentials({
          appId: data.app_id,
          secretKey: data.secret_key,
          status: data.status || 'offline'
        });
        logSecurely('Shopee credentials loaded');
      }
    } catch (error: any) {
      logSecurely('Error loading Shopee credentials:', { error: error.message });
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    credentials,
    saveCredentials,
    testConnection,
    loadCredentials,
  };
};
