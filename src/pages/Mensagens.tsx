
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { MensagensHeader } from '@/components/mensagens/MensagensHeader';
import { MensagensActions } from '@/components/mensagens/MensagensActions';
import { MensagensTabNavigation } from '@/components/mensagens/MensagensTabNavigation';
import { MensagensMainContent } from '@/components/mensagens/MensagensMainContent';
import { AutomationFlowExplanation } from '@/components/mensagens/AutomationFlowExplanation';
import { useAutomationTemplateUtils, automationTemplateOptions } from '@/hooks/useAutomationTemplateUtils';

export default function Mensagens() {
  const {
    activeTab,
    setActiveTab,
    templateContent,
    setTemplateContent,
    templateName,
    setTemplateName,
    selectedTemplateId,
    templates,
    isLoading,
    handleNewTemplate,
    handleTemplateSelect,
    handleSaveTemplate,
    handleDeleteTemplate,
    loadAutomationTemplate,
    getAutomationPreviewText,
    activeStyleId,
  } = useAutomationTemplateUtils();

  const previewText = getAutomationPreviewText();

  return (
    <div className="mensagens-page">
      <div className="mensagens-container">
        <MensagensHeader />
        
        <AutomationFlowExplanation />
        
        <MensagensActions 
          selectedTemplateId={selectedTemplateId}
          templates={templates}
          handleNewTemplate={handleNewTemplate}
          handleDeleteTemplate={handleDeleteTemplate}
          handleSaveTemplate={handleSaveTemplate}
          templateName={templateName}
        />
        
        <Card className="mensagens-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <MensagensTabNavigation 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            
            <MensagensMainContent
              activeTab={activeTab}
              templateName={templateName}
              setTemplateName={setTemplateName}
              templateContent={templateContent}
              setTemplateContent={setTemplateContent}
              selectedTemplateId={selectedTemplateId}
              templates={templates}
              isLoading={isLoading}
              handleTemplateSelect={handleTemplateSelect}
              templateStyles={automationTemplateOptions}
              loadAutomationTemplate={loadAutomationTemplate}
              activeStyleId={activeStyleId}
              previewText={previewText}
            />
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
