
import { Card } from '@/components/ui/card';
import { Template } from '@/hooks/useTemplates';
import { NewMensagensEditorHeader } from './NewMensagensEditorHeader';
import { NewMensagensEditorActions } from './NewMensagensEditorActions';
import { NewMensagensEditorContent } from './NewMensagensEditorContent';
import { NewTemplateStyleButtons } from './NewTemplateStyleButtons';
import { NewPlaceholdersList } from './NewPlaceholdersList';
import { NewEmojiSelector } from './NewEmojiSelector';

interface NewMensagensEditorProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  templateContent: string;
  setTemplateContent: (content: string) => void;
  selectedTemplateId: string | null;
  templates: Template[];
  isLoading: boolean;
  handleTemplateSelect: (id: string) => void;
  handleNewTemplate: () => void;
  handleSaveTemplate: () => void;
  handleDeleteTemplate: () => void;
  loadAutomationTemplate: (templateType: string) => void;
  activeStyleId?: string;
}

export function NewMensagensEditor({
  templateName,
  setTemplateName,
  templateContent,
  setTemplateContent,
  selectedTemplateId,
  templates,
  isLoading,
  handleTemplateSelect,
  handleNewTemplate,
  handleSaveTemplate,
  handleDeleteTemplate,
  loadAutomationTemplate,
  activeStyleId,
}: NewMensagensEditorProps) {
  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <Card className="p-4">
        <div className="space-y-4">
          <NewMensagensEditorHeader
            templateName={templateName}
            setTemplateName={setTemplateName}
            selectedTemplateId={selectedTemplateId}
            templates={templates}
            handleTemplateSelect={handleTemplateSelect}
          />
          
          <NewMensagensEditorActions
            templateName={templateName}
            selectedTemplateId={selectedTemplateId}
            templates={templates}
            handleNewTemplate={handleNewTemplate}
            handleSaveTemplate={handleSaveTemplate}
            handleDeleteTemplate={handleDeleteTemplate}
          />
        </div>
      </Card>

      {/* Main Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <NewMensagensEditorContent
            templateContent={templateContent}
            setTemplateContent={setTemplateContent}
          />
          
          <NewTemplateStyleButtons
            loadAutomationTemplate={loadAutomationTemplate}
            activeStyleId={activeStyleId}
          />
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-6">
          <NewPlaceholdersList 
            templateContent={templateContent}
            setTemplateContent={setTemplateContent}
          />
          
          <NewEmojiSelector 
            templateContent={templateContent}
            setTemplateContent={setTemplateContent}
          />
        </div>
      </div>
    </div>
  );
}
