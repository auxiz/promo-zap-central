
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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Templates de Mensagens Automáticas</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Bot Ativo
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Configure os templates que serão usados pelo bot quando detectar links nos grupos monitorados
          </p>
        </div>
      </div>

      <AutomationFlowExplanation />
      
      <TemplateHeader 
        selectedTemplateId={selectedTemplateId}
        handleNewTemplate={handleNewTemplate}
        handleDeleteTemplate={handleDeleteTemplate}
        handleSaveTemplate={handleSaveTemplate}
      />
      
      <Card className="dashboard-card">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-6">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Editor de Templates
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Pré-visualização
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="editor" className="p-6 space-y-6 text-foreground">
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
          
          <TabsContent value="preview" className="p-6 text-foreground">
            <AutomationPreview previewText={previewText} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
