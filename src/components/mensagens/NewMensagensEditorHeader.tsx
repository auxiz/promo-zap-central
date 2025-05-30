
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Template } from '@/hooks/useTemplates';

interface NewMensagensEditorHeaderProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  selectedTemplateId: string | null;
  templates: Template[];
  handleTemplateSelect: (id: string) => void;
}

export function NewMensagensEditorHeader({
  templateName,
  setTemplateName,
  selectedTemplateId,
  templates,
  handleTemplateSelect,
}: NewMensagensEditorHeaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Nome do Template
        </label>
        <Input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Digite o nome do template"
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Templates Salvos
        </label>
        <Select value={selectedTemplateId || ''} onValueChange={handleTemplateSelect}>
          <SelectTrigger className="w-full">
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
