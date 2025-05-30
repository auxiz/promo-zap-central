
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateHeader } from '@/components/mensagens/TemplateHeader';
import { AutomationTemplateForm } from '@/components/mensagens/AutomationTemplateForm';
import { AutomationPreview } from '@/components/mensagens/AutomationPreview';
import { AutomationFlowExplanation } from '@/components/mensagens/AutomationFlowExplanation';
import { useAutomationTemplateUtils, automationPlaceholders, automationTemplateOptions } from '@/hooks/useAutomationTemplateUtils';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare } from 'lucide-react';

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
    <div className="space-y-6 overflow-x-hidden min-h-full">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <h1 className="text-2xl lg:text-3xl font-bold min-w-0">Templates de Mensagens Automáticas</h1>
            <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
              <MessageSquare className="h-3 w-3" />
              Bot Ativo
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm lg:text-base">
            Configure os templates que serão usados pelo bot quando detectar links nos grupos monitorados
          </p>
        </div>
      </div>

      <AutomationFlowExplanation />
      
      <TemplateHeader 
        selectedTemplateId={selectedTemplateId}
        templates={templates}
        handleNewTemplate={handleNewTemplate}
        handleDeleteTemplate={handleDeleteTemplate}
        handleSaveTemplate={handleSaveTemplate}
        templateName={templateName}
      />
      
      <Card className="dashboard-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-4 lg:px-6 overflow-x-auto">
            <TabsList className="bg-transparent border-b-0 w-full sm:w-auto">
              <TabsTrigger 
                value="editor" 
                className="flex items-center gap-2 text-sm lg:text-base whitespace-nowrap"
              >
                <Bot className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Editor de Templates</span>
                <span className="sm:hidden">Editor</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="flex items-center gap-2 text-sm lg:text-base whitespace-nowrap"
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Pré-visualização</span>
                <span className="sm:hidden">Preview</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="editor" className="p-4 lg:p-6 space-y-6 text-foreground">
            <AutomationTemplateForm
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
            />
          </TabsContent>
          
          <TabsContent value="preview" className="p-4 lg:p-6 text-foreground">
            <AutomationPreview previewText={previewText} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
