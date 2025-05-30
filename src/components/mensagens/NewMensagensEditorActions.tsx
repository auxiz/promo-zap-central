
import { ResponsiveButton } from '@/components/ui/responsive-button';
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

interface NewMensagensEditorActionsProps {
  templateName: string;
  selectedTemplateId: string | null;
  templates: Template[];
  handleNewTemplate: () => void;
  handleSaveTemplate: () => void;
  handleDeleteTemplate: () => void;
}

export function NewMensagensEditorActions({
  templateName,
  selectedTemplateId,
  templates,
  handleNewTemplate,
  handleSaveTemplate,
  handleDeleteTemplate,
}: NewMensagensEditorActionsProps) {
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
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
  );
}
