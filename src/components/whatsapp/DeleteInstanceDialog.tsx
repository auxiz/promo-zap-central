
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

interface DeleteInstanceDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  instanceToDelete: { id: string; name: string } | null;
  handleDeleteInstance: () => void;
}

const DeleteInstanceDialog = ({
  showDialog,
  setShowDialog,
  instanceToDelete,
  handleDeleteInstance
}: DeleteInstanceDialogProps) => {
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Instância</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a instância "{instanceToDelete?.name}"?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteInstance}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteInstanceDialog;
