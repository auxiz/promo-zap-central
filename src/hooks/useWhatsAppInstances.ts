
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

export interface WhatsAppInstance {
  id: string;
  name: string;
}

export function useWhatsAppInstances() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([
    { id: 'default', name: 'Principal' }
  ]);
  const [currentInstance, setCurrentInstance] = useState('default');
  const [instanceName, setInstanceName] = useState('');
  const [showNewInstanceDialog, setShowNewInstanceDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<WhatsAppInstance | null>(null);

  const addNewInstance = () => {
    if (!instanceName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a instância",
        variant: "destructive",
      });
      return;
    }

    const newInstanceId = `instance-${Date.now()}`;
    const newInstance = { id: newInstanceId, name: instanceName };
    
    setInstances(prev => [...prev, newInstance]);
    setCurrentInstance(newInstanceId);
    setInstanceName('');
    setShowNewInstanceDialog(false);
    
    toast({
      title: "Sucesso",
      description: `Nova instância "${instanceName}" adicionada`,
    });
  };

  const handleInstanceSwitch = (instanceId: string) => {
    setCurrentInstance(instanceId);
  };
  
  const openDeleteDialog = (instance: WhatsAppInstance) => {
    setInstanceToDelete(instance);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteInstance = () => {
    if (!instanceToDelete) return;
    
    // Se a instância atual está sendo excluída, mude para a instância principal
    if (currentInstance === instanceToDelete.id) {
      setCurrentInstance('default');
    }
    
    // Remova a instância da lista
    setInstances(prev => prev.filter(instance => instance.id !== instanceToDelete.id));
    
    toast({
      title: "Sucesso",
      description: `Instância "${instanceToDelete.name}" excluída com sucesso`,
    });
    setShowDeleteDialog(false);
    setInstanceToDelete(null);
  };

  return {
    instances,
    currentInstance,
    instanceName,
    showNewInstanceDialog,
    showDeleteDialog,
    instanceToDelete,
    setInstanceName,
    setShowNewInstanceDialog,
    setShowDeleteDialog,
    setInstanceToDelete,
    addNewInstance,
    handleInstanceSwitch,
    openDeleteDialog,
    handleDeleteInstance
  };
}
