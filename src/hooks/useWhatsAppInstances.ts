
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
      toast.error("Digite um nome para a instância", {
        description: "O nome da instância não pode estar vazio",
      });
      return;
    }

    const newInstanceId = `instance-${Date.now()}`;
    const newInstance = { id: newInstanceId, name: instanceName };
    
    setInstances(prev => [...prev, newInstance]);
    setCurrentInstance(newInstanceId);
    setInstanceName('');
    setShowNewInstanceDialog(false);
    
    toast.success("Nova instância adicionada", {
      description: `A instância "${instanceName}" foi adicionada com sucesso`,
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
    
    toast.success("Instância excluída", {
      description: `A instância "${instanceToDelete.name}" foi excluída com sucesso`,
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
