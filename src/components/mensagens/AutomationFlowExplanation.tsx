
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Eye, MessageSquare, ArrowRight, Users, Send, Settings } from 'lucide-react';

export function AutomationFlowExplanation() {
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-foreground">Como Funciona o Bot de Automação</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-sm text-foreground">1. Monitoramento</h4>
              <p className="text-xs text-muted-foreground">Bot monitora mensagens nos Grupos Monitorados 24/7</p>
              <Badge variant="outline" className="text-xs">Automático</Badge>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 self-center justify-self-center hidden md:block" />
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                <Bot className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-sm text-foreground">2. Conversão</h4>
              <p className="text-xs text-muted-foreground">Links detectados são convertidos para links de afiliado</p>
              <Badge variant="outline" className="text-xs">Shopee</Badge>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 self-center justify-self-center hidden md:block" />
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-sm text-foreground">3. Template</h4>
              <p className="text-xs text-muted-foreground">Mensagem é formatada usando seus templates salvos</p>
              <Badge variant="outline" className="text-xs">Personalizado</Badge>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 self-center justify-self-center hidden md:block" />
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                <Send className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-medium text-sm text-foreground">4. Envio</h4>
              <p className="text-xs text-muted-foreground">Mensagem é enviada automaticamente para os Grupos de Envio</p>
              <Badge variant="outline" className="text-xs">Instantâneo</Badge>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-background/80 dark:bg-card/50 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-foreground" />
              <h4 className="font-medium text-sm text-foreground">Status da Automação:</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-medium text-foreground">✅ Templates:</p>
                <p className="text-muted-foreground">• Sistema de templates funcionando</p>
                <p className="text-muted-foreground">• Placeholders automáticos configurados</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">⚙️ Requisitos:</p>
                <p className="text-muted-foreground">• WhatsApp conectado</p>
                <p className="text-muted-foreground">• Credenciais Shopee configuradas</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">🔧 Configuração:</p>
                <p className="text-muted-foreground">• Grupos monitorados ativos</p>
                <p className="text-muted-foreground">• Grupos de envio configurados</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
            <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-foreground">💡 Como usar os templates:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Crie templates usando os placeholders (--produtodescricao--, --linkafiliado--, etc.)</li>
              <li>• O bot substitui automaticamente os placeholders com dados reais dos produtos</li>
              <li>• Use emojis e formatação para tornar as mensagens mais atrativas</li>
              <li>• Teste diferentes templates para ver qual tem melhor engajamento</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
