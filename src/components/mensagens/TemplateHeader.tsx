
import { Button } from '@/components/ui/button';
import { Save, Trash, PlusCircle } from 'lucide-react';

interface TemplateHeaderProps {
  selectedTemplateId: string | null;
  handleNewTemplate: () => void;
  handleDeleteTemplate: () => void;
  handleSaveTemplate: () => void;
}

export function TemplateHeader({
  selectedTemplateId,
  handleNewTemplate,
  handleDeleteTemplate,
  handleSaveTemplate,
}: TemplateHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Mensagens</h1>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleNewTemplate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo
        </Button>
        {selectedTemplateId && (
          <Button variant="destructive" onClick={handleDeleteTemplate}>
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        )}
        <Button onClick={handleSaveTemplate}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Template
        </Button>
      </div>
    </div>
  );
}
