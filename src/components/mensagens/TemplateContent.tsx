
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
    </div>
  );
}
