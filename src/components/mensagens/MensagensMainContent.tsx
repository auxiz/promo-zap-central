
import { TabsContent } from '@/components/ui/tabs';
import { AutomationTemplateForm } from './AutomationTemplateForm';
import { AutomationPreview } from './AutomationPreview';
import { Template } from '@/hooks/useTemplates';
import { AutomationTemplateStyle } from '@/hooks/useAutomationTemplateUtils';

interface MensagensMainContentProps {
  activeTab: string;
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
  previewText: string;
}

export function MensagensMainContent({
  activeTab,
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
  previewText,
}: MensagensMainContentProps) {
  return (
    <div className="mensagens-main-content">
      <TabsContent value="editor" className="tab-content">
        <AutomationTemplateForm
          templateName={templateName}
          setTemplateName={setTemplateName}
          templateContent={templateContent}
          setTemplateContent={setTemplateContent}
          selectedTemplateId={selectedTemplateId}
          templates={templates}
          isLoading={isLoading}
          handleTemplateSelect={handleTemplateSelect}
          templateStyles={templateStyles}
          loadAutomationTemplate={loadAutomationTemplate}
          activeStyleId={activeStyleId}
        />
      </TabsContent>
      
      <TabsContent value="preview" className="tab-content">
        <AutomationPreview previewText={previewText} />
      </TabsContent>
    </div>
  );
}
