
import { TemplateNameSelect } from './TemplateNameSelect';
import { TemplateContent } from './TemplateContent';
import { TemplateStyleButtons } from './TemplateStyleButtons';
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
        <TemplateNameSelect
          templateName={templateName}
          setTemplateName={setTemplateName}
          selectedTemplateId={selectedTemplateId}
          templates={templates}
          isLoading={isLoading}
          handleTemplateSelect={handleTemplateSelect}
        />
        
        <TemplateContent
          templateContent={templateContent}
          setTemplateContent={setTemplateContent}
        />
        
        <TemplateStyleButtons
          templateStyles={templateStyles}
          loadDefaultTemplate={loadDefaultTemplate}
        />
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
