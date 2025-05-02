
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateHeader } from '@/components/mensagens/TemplateHeader';
import { TemplateForm } from '@/components/mensagens/TemplateForm';
import { TemplatePreview } from '@/components/mensagens/TemplatePreview';
import { useTemplateUtils, messagePlaceholders, messageTemplateStyles, defaultTemplates } from '@/hooks/useTemplateUtils';

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
    loadDefaultTemplate,
    getPreviewText,
  } = useTemplateUtils();

  const previewText = getPreviewText();

  return (
    <div className="space-y-6">
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
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="editor" className="p-6 space-y-6">
            <TemplateForm
              templateName={templateName}
              setTemplateName={setTemplateName}
              templateContent={templateContent}
              setTemplateContent={setTemplateContent}
              selectedTemplateId={selectedTemplateId}
              templates={templates}
              isLoading={isLoading}
              handleTemplateSelect={handleTemplateSelect}
              placeholders={messagePlaceholders}
              templateStyles={messageTemplateStyles}
              defaultTemplates={defaultTemplates}
              loadDefaultTemplate={loadDefaultTemplate}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="p-6">
            <TemplatePreview previewText={previewText} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
