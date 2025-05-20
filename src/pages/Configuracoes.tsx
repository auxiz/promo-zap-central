
import { useState, useEffect } from 'react';
import { ShopeeSettings } from '@/components/configuracoes/ShopeeSettings';
import { InstagramSettings } from '@/components/configuracoes/InstagramSettings';
import { FutureIntegrationsGrid } from '@/components/configuracoes/FutureIntegrationsGrid';
import { API_BASE } from '@/utils/api-constants';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { ShopeeConversionForm } from '@/components/shopee/ShopeeConversionForm';
import { Card } from '@/components/ui/card';

export default function Configuracoes() {
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [shopeeStatus, setShopeeStatus] = useState<'online' | 'offline'>('offline');
  const [hasToken, setHasToken] = useState(false);

  // Fetch current Shopee credentials on mount
  useEffect(() => {
    const fetchShopeeCredentials = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/shopee/credentials`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.appId) {
            setShopeeAppId(data.appId);
          }
          
          if (data.status) {
            setShopeeStatus(data.status);
          }
          
          if (data.hasToken) {
            setHasToken(data.hasToken);
          }
        }
      } catch (error) {
        console.error("Error fetching Shopee credentials:", error);
      }
    };

    fetchShopeeCredentials();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Configure suas integrações com plataformas externas
        </p>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Shopee</h2>
        
        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Para utilizar as funcionalidades completas da API de afiliados, você precisa se cadastrar no
            <a href="https://affiliate.shopee.com.br/register" target="_blank" rel="noopener noreferrer" className="text-amber-900 font-medium hover:underline ml-1 inline-flex items-center">
              Programa de Afiliados da Shopee
              <ExternalLink size={14} className="ml-1" />
            </a>
          </AlertDescription>
        </Alert>
        
        <ShopeeSettings 
          initialAppId={shopeeAppId} 
          initialStatus={shopeeStatus}
          initialHasToken={hasToken}
        />
        
        <Separator />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Conversão de Links</h2>
          <Card className="p-6">
            <ShopeeConversionForm />
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Como Funciona</h2>
          
          <div className="space-y-4 text-muted-foreground">
            <p>
              O sistema automaticamente monitora mensagens de grupos selecionados (Grupos Monitorados)
              e converte links da Shopee para links de afiliado.
            </p>
            
            <p>
              Para gerar links de afiliado, o sistema utiliza suas credenciais da API da Shopee
              (APP ID e Secret Key) para autenticar diretamente com a API de afiliados.
            </p>
            
            <p>
              Quando uma mensagem contendo um link da Shopee é detectada, o sistema:
            </p>
            
            <ol className="list-decimal ml-5 space-y-2">
              <li>Extrai todos os links da Shopee na mensagem</li>
              <li>Converte cada link para o formato de afiliado usando suas credenciais</li>
              <li>Encaminha a mensagem com os links convertidos para os Grupos de Envio</li>
            </ol>
            
            <p className="mt-4">
              Para começar, configure suas credenciais da Shopee acima e depois defina os 
              grupos que deseja monitorar e os grupos para onde deseja encaminhar as mensagens
              convertidas nas páginas de Grupos Monitorados e Grupos de Envio.
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <InstagramSettings />
      <FutureIntegrationsGrid />
    </div>
  );
}
