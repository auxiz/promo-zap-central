
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { NewMensagensHeader } from '@/components/mensagens/NewMensagensHeader';
import { NewMensagensTabNavigation } from '@/components/mensagens/NewMensagensTabNavigation';
import { NewMensagensEditor } from '@/components/mensagens/NewMensagensEditor';
import { NewMensagensPreview } from '@/components/mensagens/NewMensagensPreview';
import { useAutomationTemplateUtils } from '@/hooks/useAutomationTemplateUtils';

export default function Mensagens() {
  const [activeTab, setActiveTab] = useState('editor');
  
  const {
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
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full">
        <div className="w-full max-w-full overflow-x-hidden">
          <NewMensagensHeader />
          
          <div className="space-y-6 w-full max-w-full">
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 w-full max-w-full overflow-x-hidden">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full flex-shrink-0">
                  <span className="text-amber-600 dark:text-amber-400 text-sm">💡</span>
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <h4 className="font-medium text-sm text-foreground">Como usar os templates:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Crie templates usando os placeholders (--produtodescricao--, --linkafiliado--, etc.)</li>
                    <li>• O bot substitui automaticamente os placeholders com dados reais dos produtos</li>
                    <li>• Use emojis e formatação para tornar as mensagens mais atrativas</li>
                    <li>• Teste diferentes templates para ver qual tem melhor engajamento</li>
                  </ul>
                </div>
              </div>
            </Card>

            <div className="w-full max-w-full overflow-x-hidden">
              <NewMensagensTabNavigation 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full">
              <TabsContent value="editor" className="space-y-0 w-full max-w-full overflow-x-hidden">
                <NewMensagensEditor
                  templateName={templateName}
                  setTemplateName={setTemplateName}
                  templateContent={templateContent}
                  setTemplateContent={setTemplateContent}
                  selectedTemplateId={selectedTemplateId}
                  templates={templates}
                  isLoading={isLoading}
                  handleTemplateSelect={handleTemplateSelect}
                  handleNewTemplate={handleNewTemplate}
                  handleSaveTemplate={handleSaveTemplate}
                  handleDeleteTemplate={handleDeleteTemplate}
                  loadAutomationTemplate={loadAutomationTemplate}
                  activeStyleId={activeStyleId}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-0 w-full max-w-full overflow-x-hidden">
                <NewMensagensPreview previewText={previewText} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
