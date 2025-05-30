
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShopeeSettings } from '@/components/configuracoes/ShopeeSettings';
import { InstagramSettings } from '@/components/configuracoes/InstagramSettings';
import { AmazonSettings } from '@/components/configuracoes/AmazonSettings';
import { MagaluSettings } from '@/components/configuracoes/MagaluSettings';
import { NaturaSettings } from '@/components/configuracoes/NaturaSettings';
import { API_BASE } from '@/utils/api-constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { ShopeeConversionForm } from '@/components/shopee/ShopeeConversionForm';
import { Card } from '@/components/ui/card';
import { BackendStatusIndicator } from '@/components/ui/BackendStatusIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Configuracoes() {
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [shopeeStatus, setShopeeStatus] = useState<'online' | 'offline'>('offline');
  const [hasToken, setHasToken] = useState(false);
  const [activeTab, setActiveTab] = useState('shopee');

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
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">Configurações de Integrações</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Configure suas integrações com plataformas de afiliados
              </p>
            </div>
            <div className="flex-shrink-0">
              <BackendStatusIndicator />
            </div>
          </div>
          
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Mobile: Scrollable tabs */}
              <div className="w-full overflow-x-auto">
                <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-full sm:min-w-0 sm:w-auto">
                  <TabsTrigger value="shopee" className="whitespace-nowrap px-2 sm:px-3">
                    <span className="hidden sm:inline">SHOPEE</span>
                    <span className="sm:hidden">SHP</span>
                  </TabsTrigger>
                  <TabsTrigger value="amazon" className="whitespace-nowrap px-2 sm:px-3">
                    <span className="hidden sm:inline">AMAZON</span>
                    <span className="sm:hidden">AMZ</span>
                  </TabsTrigger>
                  <TabsTrigger value="magalu" className="whitespace-nowrap px-2 sm:px-3">
                    <span className="hidden sm:inline">MAGALU</span>
                    <span className="sm:hidden">MAG</span>
                  </TabsTrigger>
                  <TabsTrigger value="natura" className="whitespace-nowrap px-2 sm:px-3">
                    <span className="hidden sm:inline">NATURA</span>
                    <span className="sm:hidden">NAT</span>
                  </TabsTrigger>
                  <TabsTrigger value="instagram" className="whitespace-nowrap px-2 sm:px-3">
                    <span className="hidden sm:inline">INSTAGRAM</span>
                    <span className="sm:hidden">IG</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="shopee" className="space-y-6 mt-6 w-full max-w-full overflow-x-hidden">
                <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription className="text-sm">
                      Para utilizar as funcionalidades completas da API de afiliados, você precisa se cadastrar no
                      <a href="https://affiliate.shopee.com.br/register" target="_blank" rel="noopener noreferrer" className="text-amber-900 dark:text-amber-400 font-medium hover:underline ml-1 inline-flex items-center gap-1 break-all">
                        Programa de Afiliados da Shopee
                        <ExternalLink size={14} className="flex-shrink-0" />
                      </a>
                    </AlertDescription>
                  </div>
                </Alert>
                
                <div className="w-full max-w-full overflow-x-hidden">
                  <ShopeeSettings 
                    initialAppId={shopeeAppId} 
                    initialStatus={shopeeStatus}
                    initialHasToken={hasToken}
                  />
                </div>
                
                <div className="space-y-4 w-full max-w-full">
                  <h2 className="text-xl font-semibold">Conversão de Links</h2>
                  <Card className="p-4 sm:p-6 w-full max-w-full overflow-x-hidden">
                    <ShopeeConversionForm />
                  </Card>
                </div>
                
                <div className="w-full max-w-full">
                  <h2 className="text-xl font-semibold mb-4">Como Funciona</h2>
                  
                  <div className="space-y-4 text-muted-foreground text-sm sm:text-base">
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
              </TabsContent>
              
              <TabsContent value="amazon" className="mt-6 w-full max-w-full overflow-x-hidden">
                <AmazonSettings />
              </TabsContent>
              
              <TabsContent value="magalu" className="mt-6 w-full max-w-full overflow-x-hidden">
                <MagaluSettings />
              </TabsContent>
              
              <TabsContent value="natura" className="mt-6 w-full max-w-full overflow-x-hidden">
                <NaturaSettings />
              </TabsContent>
              
              <TabsContent value="instagram" className="mt-6 w-full max-w-full overflow-x-hidden">
                <InstagramSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
