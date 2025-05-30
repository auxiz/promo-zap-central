
import { TemplateNameSelect } from './TemplateNameSelect';
import { TemplateContent } from './TemplateContent';
import { AutomationTemplateStyleButtons } from './AutomationTemplateStyleButtons';
import { AutomationPlaceholdersList } from './AutomationPlaceholdersList';
import { EmojiSelector } from './EmojiSelector';
import { AutomationRandomMessageButton } from './AutomationRandomMessageButton';
import { Template } from '@/hooks/useTemplates';
import { AutomationTemplateStyle } from '@/hooks/useAutomationTemplateUtils';

interface AutomationTemplateFormProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  templateContent: string;
  setTemplateContent: (content: string) => void;
  selectedTemplateId: string | null;
  templates: Template[];
  isLoading: boolean;
  handleTemplateSelect: (id: string) => void;
  templateStyles: AutomationTemplateStyle[];
  loadAutomationTemplate: (templateType: string) => void;
  activeStyleId?: string;
}

export function AutomationTemplateForm({
  templateName,
  setTemplateName,
  templateContent,
  setTemplateContent,
  selectedTemplateId,
  templates,
  isLoading,
  handleTemplateSelect,
  templateStyles,
  loadAutomationTemplate,
  activeStyleId,
}: AutomationTemplateFormProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
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
        
        <AutomationTemplateStyleButtons
          templateStyles={templateStyles}
          loadAutomationTemplate={loadAutomationTemplate}
          activeStyleId={activeStyleId}
        />
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <AutomationPlaceholdersList 
            templateContent={templateContent}
            setTemplateContent={setTemplateContent}
          />
          
          <AutomationRandomMessageButton 
            setTemplateContent={setTemplateContent}
          />
          
          <EmojiSelector 
            templateContent={templateContent}
            setTemplateContent={setTemplateContent}
          />
        </div>
      </div>
    </div>
  );
}
