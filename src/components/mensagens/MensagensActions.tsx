
import { ResponsiveButton } from '@/components/ui/responsive-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Template } from '@/hooks/useTemplates';
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

interface MensagensActionsProps {
  selectedTemplateId: string | null;
  templates?: Template[];
  handleNewTemplate: () => void;
  handleDeleteTemplate: () => void;
  handleSaveTemplate: () => void;
  templateName?: string;
}

export function MensagensActions({
  selectedTemplateId,
  templates = [],
  handleNewTemplate,
  handleDeleteTemplate,
  handleSaveTemplate,
  templateName = ''
}: MensagensActionsProps) {
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="mensagens-actions">
      <div className="space-y-4">
        <div className="w-full">
          <label className="block text-sm font-medium mb-2">Template Selecionado</label>
          <Select value={selectedTemplateId || ''} onValueChange={() => {}}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um template ou crie um novo" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="action-buttons-container">
          <ResponsiveButton
            onClick={handleNewTemplate}
            variant="outline"
            className="action-button"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span>Novo Template</span>
          </ResponsiveButton>
          
          <ResponsiveButton
            onClick={handleSaveTemplate}
            disabled={!templateName.trim()}
            className="action-button"
          >
            <Save className="h-4 w-4 flex-shrink-0" />
            <span>Salvar Template</span>
          </ResponsiveButton>
          
          {selectedTemplateId && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <ResponsiveButton
                  variant="destructive"
                  className="action-button"
                >
                  <Trash2 className="h-4 w-4 flex-shrink-0" />
                  <span>Excluir</span>
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
    </div>
  );
}
