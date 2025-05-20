
import { Card } from '@/components/ui/card';
import { ShopeeAffiliateForm } from '@/components/shopee/ShopeeAffiliateForm';
import { Separator } from '@/components/ui/separator';

export default function ShopeeAffiliate() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conversor de Links Shopee (API Direta)</h1>
        <p className="text-muted-foreground mt-2">
          Converta links da Shopee usando suas próprias credenciais de afiliado
        </p>
      </div>
      
      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <h2 className="text-xl font-medium">Conversor com Credenciais Personalizadas</h2>
        </div>
        
        <div className="p-6">
          <ShopeeAffiliateForm />
        </div>
      </Card>
      
      <Separator />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Como funciona</h2>
        
        <div className="space-y-4 text-muted-foreground">
          <p>
            Esta ferramenta permite que você use suas próprias credenciais de afiliado da Shopee
            para converter links, sem armazenar suas informações no servidor.
          </p>
          
          <ol className="list-decimal ml-5 space-y-2">
            <li>Insira seu App ID e Secret Key da API de afiliados da Shopee</li>
            <li>Cole o link da Shopee que deseja converter</li>
            <li>Clique em "Converter" e obtenha seu link de afiliado</li>
          </ol>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
            <h3 className="text-yellow-800 font-medium mb-2">Informação de Segurança</h3>
            <p className="text-yellow-700 text-sm">
              Suas credenciais (App ID e Secret Key) são usadas apenas para esta requisição específica 
              e <strong>não são armazenadas</strong> em nossos servidores. Toda a comunicação é feita 
              através de HTTPS seguro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
