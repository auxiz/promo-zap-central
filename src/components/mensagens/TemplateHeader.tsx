
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
      
      <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto pb-2">
        <Button
          onClick={handleNewTemplate}
          variant="outline"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            minWidth: '120px',
            flexShrink: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            borderRadius: '0.375rem'
          }}
        >
          <Plus className="h-4 w-4" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Novo Template
          </span>
        </Button>
        
        <Button
          onClick={handleSaveTemplate}
          disabled={!templateName.trim()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            minWidth: '120px',
            flexShrink: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            borderRadius: '0.375rem'
          }}
        >
          <Save className="h-4 w-4" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Salvar Template
          </span>
        </Button>
        
        {selectedTemplateId && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  minWidth: '120px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  borderRadius: '0.375rem'
                }}
              >
                <Trash2 className="h-4 w-4" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Excluir
                </span>
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
