
import { Card } from '@/components/ui/card';
import { ShopeeLocalCredentialForm } from './shopee/ShopeeLocalCredentialForm';
import { ShopeeInfoText } from './shopee/ShopeeInfoText';
import { Separator } from '@/components/ui/separator';

export function ShopeeSettings() {
  return (
    <Card className="dashboard-card overflow-hidden w-full max-w-full">
      <div className="border-b p-4 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="font-medium text-sm sm:text-base">Integração Shopee Afiliados</h2>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-6 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full">
          <ShopeeLocalCredentialForm />
        </div>
        
        <Separator />
        
        <div className="text-sm text-muted-foreground space-y-4 w-full max-w-full">
          <p className="font-medium mb-2">Sobre o Armazenamento Local:</p>
          <div className="space-y-3">
            <p>
              Suas credenciais da API da Shopee são armazenadas apenas no seu navegador, 
              garantindo máxima privacidade e segurança. Cada usuário gerencia suas próprias credenciais.
            </p>
            <p>
              A autenticação utiliza assinaturas HMAC-SHA256 para cada requisição, garantindo
              a segurança da conexão sem necessidade de tokens ou cookies de sessão.
            </p>
            <p className="break-words">
              Para obter suas credenciais de API, acesse o 
              <a href="https://affiliate.shopee.com.br/portfolio/api-settings" target="_blank" rel="noopener noreferrer" 
                 className="text-primary hover:underline ml-1 break-all">
                Painel de Afiliados da Shopee
              </a>.
            </p>
          </div>
        </div>
        
        <ShopeeInfoText />
      </div>
    </Card>
  );
}
