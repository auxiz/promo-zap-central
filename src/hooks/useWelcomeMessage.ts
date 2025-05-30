
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

interface WelcomeData {
  title: string;
  subtitle: string;
  suggestions: string[];
  hasIntegrations: boolean;
  isNewUser: boolean;
}

export function useWelcomeMessage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { role, isAdmin } = useUserRole();
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateWelcomeMessage = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
        
        // Verificar se é usuário novo (criado há menos de 7 dias)
        const userCreatedAt = new Date(user.created_at);
        const isNewUser = (Date.now() - userCreatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000);

        // Verificar integrações existentes
        const [whatsappInstances, shopeeCredentials] = await Promise.all([
          supabase.from('user_whatsapp_instances').select('id').eq('user_id', user.id),
          supabase.from('user_shopee_credentials').select('id').eq('user_id', user.id)
        ]);

        const hasWhatsApp = (whatsappInstances.data?.length || 0) > 0;
        const hasShopee = (shopeeCredentials.data?.length || 0) > 0;
        const hasIntegrations = hasWhatsApp || hasShopee;

        // Gerar título baseado no contexto
        let title = '';
        if (isAdmin) {
          title = `Bem-vindo ao painel administrativo, ${displayName}!`;
        } else if (isNewUser) {
          title = `Olá ${displayName}, seja bem-vindo!`;
        } else {
          const timeOfDay = new Date().getHours();
          const greeting = timeOfDay < 12 ? 'Bom dia' : timeOfDay < 18 ? 'Boa tarde' : 'Boa noite';
          title = `${greeting}, ${displayName}!`;
        }

        // Gerar subtítulo baseado no status das integrações
        let subtitle = '';
        const suggestions: string[] = [];

        if (isAdmin) {
          subtitle = 'Monitore o sistema, gerencie usuários e configure funcionalidades administrativas.';
          suggestions.push('Verificar saúde do sistema', 'Analisar métricas de uso', 'Gerenciar usuários');
        } else if (!hasIntegrations) {
          subtitle = 'Configure suas primeiras integrações para começar a automatizar seus processos.';
          suggestions.push('Conectar WhatsApp', 'Configurar credenciais Shopee', 'Criar templates de mensagens');
        } else if (hasWhatsApp && !hasShopee) {
          subtitle = 'WhatsApp conectado! Configure o Shopee para converter links automaticamente.';
          suggestions.push('Configurar Shopee', 'Gerenciar grupos monitorados', 'Criar novos templates');
        } else if (hasShopee && !hasWhatsApp) {
          subtitle = 'Credenciais Shopee configuradas! Conecte o WhatsApp para começar a automação.';
          suggestions.push('Conectar WhatsApp', 'Testar conversão de links', 'Configurar grupos de envio');
        } else {
          subtitle = 'Tudo configurado! Gerencie suas automações e monitore o desempenho.';
          suggestions.push('Monitorar atividade recente', 'Otimizar templates', 'Analisar conversões');
        }

        setWelcomeData({
          title,
          subtitle,
          suggestions,
          hasIntegrations,
          isNewUser
        });

      } catch (error) {
        console.error('Error generating welcome message:', error);
        // Fallback message
        const displayName = profile?.full_name || user.user_metadata?.full_name || 'Usuário';
        setWelcomeData({
          title: `Bem-vindo, ${displayName}!`,
          subtitle: 'Gerencie suas automações e integrações.',
          suggestions: [],
          hasIntegrations: false,
          isNewUser: false
        });
      } finally {
        setLoading(false);
      }
    };

    generateWelcomeMessage();
  }, [user, profile, role, isAdmin]);

  return { welcomeData, loading };
}
