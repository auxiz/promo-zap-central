
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Smartphone } from 'lucide-react';

interface NewMensagensPreviewProps {
  previewText: string;
}

export function NewMensagensPreview({ previewText }: NewMensagensPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Preview do WhatsApp</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Veja como sua mensagem aparecerá no WhatsApp
        </p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-sm bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-green-600 rounded-full">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Bot Automático
              </span>
              <Badge variant="secondary" className="text-xs ml-auto">
                Online
              </Badge>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {previewText.split('\n').map((line, i) => (
                  <p 
                    key={i}
                    className="mb-1 last:mb-0"
                    dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                        .replace(/~(.*?)~/g, '<del class="opacity-75">$1</del>')
                        .replace(/(https?:\/\/[^\s]+)/g, '<span class="text-blue-600 dark:text-blue-400 underline">$1</span>')
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-right">
                Agora mesmo
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Esta é uma simulação de como a mensagem aparecerá quando o bot detectar 
          automaticamente um link nos grupos monitorados.
        </p>
      </div>
    </div>
  );
}
