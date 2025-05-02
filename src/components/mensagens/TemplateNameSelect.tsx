
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Template } from '@/hooks/useTemplates';

interface TemplateNameSelectProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  selectedTemplateId: string | null;
  templates: Template[];
  isLoading: boolean;
  handleTemplateSelect: (id: string) => void;
}

export function TemplateNameSelect({
  templateName,
  setTemplateName,
  selectedTemplateId,
  templates,
  isLoading,
  handleTemplateSelect,
}: TemplateNameSelectProps) {
  return (
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
  );
}
