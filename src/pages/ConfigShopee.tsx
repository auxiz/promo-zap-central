
import { useState, useEffect } from 'react';
import { ShopeeSettings } from '@/components/configuracoes/ShopeeSettings';
import { API_BASE } from '@/utils/api-constants';

export default function ConfigShopee() {
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [initialStatus, setInitialStatus] = useState<'online' | 'offline'>('offline');

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
            setInitialStatus(data.status);
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
      <h1 className="text-3xl font-bold">Configurações Shopee</h1>
      <ShopeeSettings initialAppId={shopeeAppId} initialStatus={initialStatus} />
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Como Funciona</h2>
        
        <div className="space-y-4 text-muted-foreground">
          <p>
            O sistema automaticamente monitora mensagens de grupos selecionados (Grupos Monitorados)
            e converte links da Shopee para links de afiliado.
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
  );
}
