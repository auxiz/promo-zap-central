
import { Textarea } from '@/components/ui/textarea';

interface TemplateContentProps {
  templateContent: string;
  setTemplateContent: (content: string) => void;
}

export function TemplateContent({ 
  templateContent, 
  setTemplateContent 
}: TemplateContentProps) {
  return (
    <div>
      <label htmlFor="template-content" className="block text-sm font-medium mb-1">
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
