
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare } from 'lucide-react';

export function NewMensagensHeader() {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Templates de Mensagens
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure mensagens automáticas para o bot
            </p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 self-start sm:self-center">
          <MessageSquare className="h-3 w-3" />
          Bot Ativo
        </Badge>
      </div>
    </div>
  );
}
