
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface NewPlaceholdersListProps {
  templateContent: string;
  setTemplateContent: (content: string) => void;
}

const placeholders = [
  { id: 'produtodescricao', label: '--produtodescricao--', description: 'Título/descrição do produto' },
  { id: 'linkafiliado', label: '--linkafiliado--', description: 'Link convertido pelo bot' },
  { id: 'precooriginal', label: '--precooriginal--', description: 'Preço original detectado' },
  { id: 'precopromocional', label: '--precopromocional--', description: 'Preço promocional detectado' },
  { id: 'nomeloja', label: '--nomeloja--', description: 'Nome da loja (Shopee, Amazon, etc.)' },
  { id: 'desconto', label: '--desconto--', description: 'Percentual de desconto calculado' },
  { id: 'datahorario', label: '--datahorario--', description: 'Data/hora da detecção' },
  { id: 'grupoorigem', label: '--grupoorigem--', description: 'Nome do grupo onde foi detectado' },
];

export function NewPlaceholdersList({ templateContent, setTemplateContent }: NewPlaceholdersListProps) {
  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      
      const newValue =
        templateContent.substring(0, startPos) +
        placeholder +
        templateContent.substring(endPos);
      
      setTemplateContent(newValue);
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = startPos + placeholder.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
      
      toast.success('Campo inserido!', {
        description: `${placeholder} foi adicionado ao template`
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Campos Automáticos</h3>
          <p className="text-xs text-muted-foreground">
            Clique para inserir no template
          </p>
        </div>
        
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {placeholders.map((placeholder) => (
            <div
              key={placeholder.id}
              onClick={() => insertPlaceholder(placeholder.label)}
              className="p-3 border border-input rounded-lg bg-card hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded">
                      {placeholder.label}
                    </code>
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {placeholder.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
