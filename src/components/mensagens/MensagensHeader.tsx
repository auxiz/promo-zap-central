
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare } from 'lucide-react';

export function MensagensHeader() {
  return (
    <div className="mensagens-header">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Bot className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                Templates de Mensagens Automáticas
              </h1>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0 self-start">
            <MessageSquare className="h-3 w-3" />
            Bot Ativo
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Configure os templates que serão usados pelo bot quando detectar links nos grupos monitorados
        </p>
      </div>
    </div>
  );
}
