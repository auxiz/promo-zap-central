
import { useState, useEffect } from 'react';
import { ShopeeSettings } from '@/components/configuracoes/ShopeeSettings';
import { API_BASE } from '@/utils/api-constants';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';

export default function ConfigShopee() {
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [initialStatus, setInitialStatus] = useState<'online' | 'offline'>('offline');
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
            setInitialStatus(data.status);
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
        <h1 className="text-3xl font-bold">Configurações Shopee</h1>
        <p className="text-muted-foreground mt-2">
          Configure sua integração com a plataforma de afiliados da Shopee
        </p>
      </div>
      
      <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
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
        initialStatus={initialStatus}
        initialHasToken={hasToken}
      />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Métodos de Autenticação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Autenticação OAuth (Recomendada)</h3>
            <p className="text-muted-foreground text-sm">
              Utiliza o fluxo OAuth oficial da Shopee para estabelecer uma conexão segura e duradoura com a API.
              Permite acesso completo às funcionalidades de afiliado, incluindo conversão de links e relatórios.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Tokens de acesso gerenciados automaticamente</li>
              <li>Renovação automática de tokens expirados</li>
              <li>Integração completa com a API oficial</li>
              <li>Maior segurança e confiabilidade</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Login Manual (Alternativa)</h3>
            <p className="text-muted-foreground text-sm">
              Utiliza um navegador interno para realizar o login manual na plataforma de afiliados da Shopee.
              Útil como solução temporária ou alternativa quando a autenticação OAuth não estiver disponível.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Não requer configuração de App ID e Secret Key</li>
              <li>Pode ser mais simples para usuários iniciantes</li>
              <li>Funcionalidade limitada comparada à integração OAuth</li>
              <li>Requer login manual periódico</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Separator />
      
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

          <p className="mt-4">
            <strong>Autenticação OAuth:</strong> Para utilizar a API de afiliados da Shopee, é 
            necessário autenticar-se via OAuth após configurar o APP ID e Secret Key. Este processo 
            permite que o sistema receba um token de acesso para converter links e acessar 
            informações de desempenho dos seus links de afiliado.
          </p>
        </div>
      </div>
    </div>
  );
}
