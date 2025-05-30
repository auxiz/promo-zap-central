
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

interface AutomationPreviewProps {
  previewText: string;
}

export function AutomationPreview({ previewText }: AutomationPreviewProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-blue-600" />
          <h3 className="font-medium text-center">Preview - Mensagem do Bot</h3>
          <Badge variant="secondary" className="text-xs">Automático</Badge>
        </div>
        <div className="border border-input rounded-lg p-4 bg-green-50 whitespace-pre-wrap font-[system-ui] text-[15px] dark:text-slate-100">
          {previewText.split('\n').map((line, i) => (
            <p 
              key={i} 
              className={line.includes('*') ? 'font-bold' : ''}
              dangerouslySetInnerHTML={{
                __html: line
                  .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                  .replace(/~(.*?)~/g, '<del>$1</del>')
              }}
            />
          ))}
        </div>
      </Card>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Esta é uma simulação de como a mensagem aparecerá quando o bot detectar automaticamente 
          um link nos grupos monitorados e enviá-la para os grupos de envio.
        </p>
      </div>
    </div>
  );
}
