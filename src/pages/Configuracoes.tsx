
import { ShopeeSettings } from '@/components/configuracoes/ShopeeSettings';
import { InstagramSettings } from '@/components/configuracoes/InstagramSettings';
import { AmazonSettings } from '@/components/configuracoes/AmazonSettings';
import { MagaluSettings } from '@/components/configuracoes/MagaluSettings';
import { NaturaSettings } from '@/components/configuracoes/NaturaSettings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink, ShoppingBag, Package, Settings as SettingsIcon, Instagram, Leaf } from 'lucide-react';
import { ShopeeLocalConversionForm } from '@/components/shopee/ShopeeLocalConversionForm';
import { Card } from '@/components/ui/card';
import { BackendStatusIndicator } from '@/components/ui/BackendStatusIndicator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// Configuration for each integration
const integrations = [
  {
    id: 'shopee',
    name: 'Shopee',
    icon: ShoppingBag,
    description: 'Programa de Afiliados da Shopee',
    status: 'active' as const,
    color: 'bg-orange-500'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    icon: Package,
    description: 'Amazon Associates',
    status: 'development' as const,
    color: 'bg-yellow-500'
  },
  {
    id: 'magalu',
    name: 'Magazine Luiza',
    icon: Package,
    description: 'Programa de Afiliados Magalu',
    status: 'development' as const,
    color: 'bg-blue-500'
  },
  {
    id: 'natura',
    name: 'Natura',
    icon: Leaf,
    description: 'Afiliados Natura',
    status: 'development' as const,
    color: 'bg-green-500'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    description: 'Instagram Creator Tools',
    status: 'development' as const,
    color: 'bg-pink-500'
  }
];

export default function Configuracoes() {
  const [selectedIntegration, setSelectedIntegration] = useState('shopee');

  const renderIntegrationContent = () => {
    switch (selectedIntegration) {
      case 'shopee':
        return (
          <div className="space-y-6 w-full max-w-full overflow-x-hidden">
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
              <ShopeeSettings />
            </div>
            
            <div className="space-y-4 w-full max-w-full">
              <h2 className="text-xl font-semibold">Conversão de Links</h2>
              <Card className="p-4 sm:p-6 w-full max-w-full overflow-x-hidden">
                <ShopeeLocalConversionForm />
              </Card>
            </div>
            
            <div className="w-full max-w-full">
              <h2 className="text-xl font-semibold mb-4">Como Funciona</h2>
              
              <div className="space-y-4 text-muted-foreground text-sm sm:text-base">
                <p>
                  O sistema permite que você converta links da Shopee para links de afiliado usando suas 
                  próprias credenciais, que ficam armazenadas apenas no seu navegador.
                </p>
                
                <p>
                  Para gerar links de afiliado, você precisa configurar suas credenciais da API da Shopee
                  (APP ID e Secret Key) que são utilizadas para autenticar diretamente com a API de afiliados.
                </p>
                
                <p>
                  Quando você converte um link da Shopee, o sistema:
                </p>
                
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Utiliza suas credenciais armazenadas localmente</li>
                  <li>Envia o link original junto com suas credenciais para conversão</li>
                  <li>Retorna o link de afiliado convertido</li>
                </ol>
                
                <p className="mt-4">
                  Para começar, configure suas credenciais da Shopee acima e teste a conversão 
                  com um link de exemplo. Suas credenciais ficam seguras no seu navegador.
                </p>
              </div>
            </div>
          </div>
        );
      case 'amazon':
        return <AmazonSettings />;
      case 'magalu':
        return <MagaluSettings />;
      case 'natura':
        return <NaturaSettings />;
      case 'instagram':
        return <InstagramSettings />;
      default:
        return <ShopeeSettings />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Ativo</Badge>;
      case 'development':
        return <Badge variant="secondary" className="ml-2">Em Breve</Badge>;
      default:
        return null;
    }
  };

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
          
          <div className="w-full space-y-6">
            {/* Integration Selector Dropdown */}
            <div className="w-full">
              <label className="block text-sm font-medium mb-3">
                <SettingsIcon className="inline-block w-4 h-4 mr-2" />
                Selecione uma Integração
              </label>
              <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Escolha uma plataforma para configurar" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background border shadow-lg">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    return (
                      <SelectItem 
                        key={integration.id} 
                        value={integration.id}
                        className="cursor-pointer hover:bg-accent"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${integration.color}`} />
                            <Icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{integration.name}</div>
                              <div className="text-xs text-muted-foreground">{integration.description}</div>
                            </div>
                          </div>
                          {getStatusBadge(integration.status)}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {/* Integration Content */}
            <div className="w-full max-w-full overflow-x-hidden">
              {renderIntegrationContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
