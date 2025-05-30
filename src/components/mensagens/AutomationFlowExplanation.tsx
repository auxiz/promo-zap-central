
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Eye, MessageSquare, ArrowRight, Users, Send } from 'lucide-react';

export function AutomationFlowExplanation() {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Como Funciona o Bot de Automação</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-sm">1. Monitoramento</h4>
            <p className="text-xs text-muted-foreground">Bot monitora mensagens nos Grupos Monitorados</p>
            <Badge variant="outline" className="text-xs">Grupos Monitorados</Badge>
          </div>
          
          <ArrowRight className="h-6 w-6 text-gray-400 self-center justify-self-center hidden md:block" />
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-green-100 rounded-full">
              <Bot className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-sm">2. Conversão</h4>
            <p className="text-xs text-muted-foreground">Links detectados são convertidos para afiliados</p>
            <Badge variant="outline" className="text-xs">Automático</Badge>
          </div>
          
          <ArrowRight className="h-6 w-6 text-gray-400 self-center justify-self-center hidden md:block" />
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-purple-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-sm">3. Template</h4>
            <p className="text-xs text-muted-foreground">Mensagem é formatada usando seus templates</p>
            <Badge variant="outline" className="text-xs">Personalizado</Badge>
          </div>
          
          <ArrowRight className="h-6 w-6 text-gray-400 self-center justify-self-center hidden md:block" />
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-orange-100 rounded-full">
              <Send className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-sm">4. Envio</h4>
            <p className="text-xs text-muted-foreground">Mensagem é enviada para os Grupos de Envio</p>
            <Badge variant="outline" className="text-xs">Grupos de Envio</Badge>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm mb-2">💡 Importante:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Os templates são aplicados automaticamente quando links são detectados</li>
            <li>• Dados como preços e descrições são extraídos automaticamente dos produtos</li>
            <li>• Configure diferentes templates para diferentes tipos de ofertas</li>
            <li>• O bot funciona 24/7 monitorando os grupos selecionados</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
