
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export function NaturaSettings() {
  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Integração Natura Afiliados</h2>
          <Badge variant="secondary" className="flex gap-1">
            <AlertCircle size={14} /> Em Breve
          </Badge>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Integração Natura em Desenvolvimento</h3>
          <p className="text-muted-foreground">
            A integração com o programa de afiliados da Natura estará disponível em breve.
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-4">
          <p className="font-medium mb-2">Funcionalidades Planejadas:</p>
          <ul className="list-disc ml-5 space-y-2">
            <li>Conversão automática de links de produtos Natura</li>
            <li>Integração com API de consultoras Natura</li>
            <li>Rastreamento de vendas e comissões</li>
            <li>Suporte a catálogos sazonais</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
