
import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

interface NewInstanceDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  instanceName: string;
  setInstanceName: (name: string) => void;
  addNewInstance: () => void;
}

const NewInstanceDialog = ({
  showDialog,
  setShowDialog,
  instanceName,
  setInstanceName,
  addNewInstance
}: NewInstanceDialogProps) => {
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Nova Instância WhatsApp</AlertDialogTitle>
          <AlertDialogDescription>
            Digite um nome para identificar esta instância do WhatsApp.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Input
            placeholder="Nome da instância (ex: Vendas, Suporte)"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            className="w-full"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setInstanceName('')}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={addNewInstance}>Adicionar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NewInstanceDialog;
