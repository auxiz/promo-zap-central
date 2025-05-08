
import { Card } from '@/components/ui/card';
import { ShopeeConversionForm } from '@/components/shopee/ShopeeConversionForm';
import { Separator } from '@/components/ui/separator';

export default function ConversionTool() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conversor de Links Shopee</h1>
        <p className="text-muted-foreground mt-2">
          Converta links da Shopee para links de afiliado facilmente
        </p>
      </div>
      
      <Card className="dashboard-card overflow-hidden">
        <div className="border-b p-4">
          <h2 className="text-xl font-medium">Conversor de Links</h2>
        </div>
        
        <div className="p-6">
          <ShopeeConversionForm />
        </div>
      </Card>
      
      <Separator />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Como funciona</h2>
        
        <div className="space-y-4 text-muted-foreground">
          <p>
            Esta ferramenta de conversão utiliza a API de afiliados da Shopee para transformar links
            normais de produtos em links de afiliado.
          </p>
          
          <p>
            O processo é simples:
          </p>
          
          <ol className="list-decimal ml-5 space-y-2">
            <li>Cole um link da Shopee no campo acima</li>
            <li>Clique no botão "Converter"</li>
            <li>Copie o link de afiliado gerado</li>
          </ol>
          
          <p>
            Os links de afiliado gerados permitem rastrear conversões e comissões quando os usuários
            realizam compras através desses links.
          </p>
        </div>
      </div>
    </div>
  );
}
