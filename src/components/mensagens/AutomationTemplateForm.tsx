
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
    <div className="automation-template-form">
      <div className="form-layout">
        <div className="form-main-section">
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
        
        <div className="form-sidebar">
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
