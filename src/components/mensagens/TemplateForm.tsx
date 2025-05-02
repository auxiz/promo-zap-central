
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlaceholdersList } from './PlaceholdersList';
import { EmojiSelector } from './EmojiSelector';
import { Template } from '@/hooks/useTemplates';

interface TemplateStyle {
  id: string;
  name: string;
  description: string;
}

interface Placeholder {
  id: string;
  label: string;
  description: string;
}

interface TemplateFormProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  templateContent: string;
  setTemplateContent: (content: string) => void;
  selectedTemplateId: string | null;
  templates: Template[];
  isLoading: boolean;
  handleTemplateSelect: (id: string) => void;
  placeholders: Placeholder[];
  templateStyles: TemplateStyle[];
  defaultTemplates: Record<string, string>;
  loadDefaultTemplate: (templateType: string) => void;
}

export function TemplateForm({
  templateName,
  setTemplateName,
  templateContent,
  setTemplateContent,
  selectedTemplateId,
  templates,
  isLoading,
  handleTemplateSelect,
  placeholders,
  templateStyles,
  defaultTemplates,
  loadDefaultTemplate,
}: TemplateFormProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="template-name" className="block text-sm font-medium mb-1">
              Nome do Template
            </label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Nome do Template"
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="template-select" className="block text-sm font-medium mb-1">
              Templates Salvos
            </label>
            <Select
              value={selectedTemplateId || ''}
              onValueChange={handleTemplateSelect}
              disabled={isLoading || templates.length === 0}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
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
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {templateStyles.map((style) => (
            <Button
              key={style.id}
              onClick={() => loadDefaultTemplate(style.id)}
              className={`p-2 h-auto text-sm justify-center transition-colors whitespace-nowrap`}
              variant={style.id === 'normal' ? 'default' : 'outline'}
            >
              {style.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <PlaceholdersList 
          placeholders={placeholders} 
          templateContent={templateContent}
          setTemplateContent={setTemplateContent}
        />
        
        <EmojiSelector 
          templateContent={templateContent}
          setTemplateContent={setTemplateContent}
        />
      </div>
    </div>
  );
}
