
import { Button } from '@/components/ui/button';
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

interface TemplateHeaderProps {
  selectedTemplateId: string | null;
  templates?: Template[];
  handleNewTemplate: () => void;
  handleDeleteTemplate: () => void;
  handleSaveTemplate: () => void;
  templateName?: string;
}

export function TemplateHeader({
  selectedTemplateId,
  templates = [],
  handleNewTemplate,
  handleDeleteTemplate,
  handleSaveTemplate,
  templateName = ''
}: TemplateHeaderProps) {
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex-1 max-w-md">
        <label className="block text-sm font-medium mb-2">Template Selecionado</label>
        <Select value={selectedTemplateId || ''} onValueChange={() => {}}>
          <SelectTrigger>
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
      
      <div className="flex gap-2">
        <Button
          onClick={handleNewTemplate}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
        
        <Button
          onClick={handleSaveTemplate}
          className="flex items-center gap-2"
          disabled={!templateName.trim()}
        >
          <Save className="h-4 w-4" />
          Salvar Template
        </Button>
        
        {selectedTemplateId && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
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
  );
}
