
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export function AutomationFlowExplanation() {
  return (
    <div className="space-y-4">
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
