
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { MessageSquareQuote } from 'lucide-react';

interface TemplateContentProps {
  templateContent: string;
  setTemplateContent: (content: string) => void;
}

export function TemplateContent({ 
  templateContent, 
  setTemplateContent 
}: TemplateContentProps) {
  return (
    <div className="space-y-3">
      <label htmlFor="template-content" className="block text-sm font-medium">
        Conteúdo do Template
      </label>
      <Textarea
        id="template-content"
        value={templateContent}
        onChange={(e) => setTemplateContent(e.target.value)}
        className="w-full h-64 px-3 py-2 font-mono text-sm resize-y"
        placeholder="Digite o conteúdo do seu template aqui..."
      />

      <Alert className="bg-accent/30">
        <MessageSquareQuote className="h-4 w-4" />
        <AlertTitle>Placeholders Disponíveis</AlertTitle>
        <AlertDescription className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <div><strong>--produtodescricao--</strong>: Nome e descrição do produto</div>
          <div><strong>--linklojaoficial--</strong>: Link para a loja oficial</div>
          <div><strong>--precoantigo--</strong>: Preço antigo/original</div>
          <div><strong>--precocomdesconto--</strong>: Preço com desconto</div>
          <div><strong>--precorecorrencia--</strong>: Preço com recorrência</div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
