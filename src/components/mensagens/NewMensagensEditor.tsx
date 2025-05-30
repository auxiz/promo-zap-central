import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveButton } from '@/components/ui/responsive-button';
import { Plus, Save, Trash2, Zap } from 'lucide-react';
import { Template } from '@/hooks/useTemplates';
import { NewTemplateStyleButtons } from './NewTemplateStyleButtons';
import { NewPlaceholdersList } from './NewPlaceholdersList';
import { NewEmojiSelector } from './NewEmojiSelector';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const randomMessages = [
  `🤖 DETECÇÃO AUTOMÁTICA 🤖
--produtodescricao--
💰 Preço especial: --precopromocional--
🔗 LINK AFILIADO: --linkafiliado--
📊 Economia de --desconto--%
🕒 Detectado agora`,

  `⚡ BOT ENCONTROU OFERTA ⚡
🏷️ --produtodescricao--
❌ Era: --precooriginal--
✅ Agora: --precopromocional--
🛒 APROVEITAR: --linkafiliado--
🏪 Loja: --nomeloja--`,

  `🔍 MONITORAMENTO ATIVO 🔍
--produtodescricao--
💸 --desconto--% de desconto!
💰 Por apenas: --precopromocional--
🔗 Link convertido: --linkafiliado--
⏰ --datahorario--`,

  `🎯 OPORTUNIDADE DETECTADA 🎯
--produtodescricao--
🏪 --nomeloja--
💵 De --precooriginal-- para --precopromocional--
🚀 GARANTIR: --linkafiliado--`,
];

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
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleGenerateRandom = () => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    setTemplateContent(randomMessages[randomIndex]);
    toast.success('Template gerado!', {
      description: 'Template aleatório foi aplicado com sucesso'
    });
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome do Template
              </label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Digite o nome do template"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Templates Salvos
              </label>
              <Select value={selectedTemplateId || ''} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <ResponsiveButton
              onClick={handleNewTemplate}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Novo Template
            </ResponsiveButton>
            
            <ResponsiveButton
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4" />
              Salvar Template
            </ResponsiveButton>
            
            {selectedTemplateId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <ResponsiveButton
                    variant="destructive"
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </ResponsiveButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Template</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o template "{selectedTemplate?.name}"? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </Card>

      {/* Main Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="block text-sm font-medium">
                  Conteúdo do Template
                </label>
                <ResponsiveButton 
                  onClick={handleGenerateRandom} 
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Zap className="h-4 w-4" />
                  Template Aleatório
                </ResponsiveButton>
              </div>
              <Textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                className="w-full h-64 font-mono text-sm"
                placeholder="Digite o conteúdo do seu template aqui..."
              />
            </div>
          </Card>
          
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
