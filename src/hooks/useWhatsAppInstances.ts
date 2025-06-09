
import { useState, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export interface WhatsAppInstance {
  id: string;
  name: string;
  isConnected?: boolean;
  isActive?: boolean;
  lastConnection?: number;
  monitoredGroupsCount?: number;
  sendGroupsCount?: number;
}

export function useWhatsAppInstances() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [currentInstance, setCurrentInstance] = useState('default');
  const [instanceName, setInstanceName] = useState('');
  const [showNewInstanceDialog, setShowNewInstanceDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<WhatsAppInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { addNotification } = useNotificationContext();

  // Load all instances from backend
  const loadInstances = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/instances`);
      
      if (!response.ok) {
        throw new Error('Failed to load instances');
      }
      
      const instancesData = await response.json();
      
      // Convert backend format to frontend format
      const instancesList: WhatsAppInstance[] = [];
      
      // Always ensure default instance exists
      if (!instancesData.default) {
        instancesList.push({ 
          id: 'default', 
          name: 'Principal',
          isConnected: false,
          isActive: false
        });
      }
      
      // Add all instances from backend
      for (const [instanceId, instanceData] of Object.entries(instancesData)) {
        instancesList.push({
          id: instanceId,
          name: (instanceData as any).name || (instanceId === 'default' ? 'Principal' : instanceId),
          isConnected: (instanceData as any).isConnected || false,
          isActive: (instanceData as any).isActive || false,
          lastConnection: (instanceData as any).connectionTime,
          monitoredGroupsCount: (instanceData as any).monitoredGroupsCount || 0,
          sendGroupsCount: (instanceData as any).sendGroupsCount || 0
        });
      }
      
      setInstances(instancesList);
      
      // If current instance doesn't exist in the list, switch to default
      if (!instancesList.find(inst => inst.id === currentInstance)) {
        setCurrentInstance('default');
      }
      
    } catch (error) {
      console.error('Error loading instances:', error);
      addNotification(
        'Erro ao Carregar Instâncias',
        'Não foi possível carregar a lista de instâncias WhatsApp',
        'error',
        'high'
      );
      
      // Fallback to default instance
      setInstances([{ id: 'default', name: 'Principal' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load instances on mount
  useEffect(() => {
    loadInstances();
  }, []);

  const addNewInstance = async () => {
    if (!instanceName.trim()) {
      addNotification(
        'Campo Obrigatório',
        'O nome da instância não pode estar vazio',
        'error',
        'low'
      );
      return;
    }

    // Check for duplicate names
    if (instances.some(instance => instance.name.toLowerCase() === instanceName.trim().toLowerCase())) {
      addNotification(
        'Nome Duplicado',
        'Já existe uma instância com este nome',
        'error',
        'low'
      );
      return;
    }

    try {
      // Generate a unique ID with timestamp and random string
      const newInstanceId = `instance-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/instances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instanceId: newInstanceId,
          name: instanceName.trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create instance');
      }
      
      // Reload instances to get updated list
      await loadInstances();
      
      // Switch to the new instance
      setCurrentInstance(newInstanceId);
      setInstanceName('');
      setShowNewInstanceDialog(false);
      
      addNotification(
        'Nova Instância Criada',
        `A instância "${instanceName}" foi criada com sucesso e está isolada das demais`,
        'success',
        'high'
      );
    } catch (error) {
      console.error('Error creating instance:', error);
      addNotification(
        'Erro ao Criar Instância',
        `Não foi possível criar a instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'error',
        'high'
      );
    }
  };

  const handleInstanceSwitch = (instanceId: string) => {
    setCurrentInstance(instanceId);
    addNotification(
      'Instância Alterada',
      `Mudou para a instância: ${instances.find(i => i.id === instanceId)?.name || instanceId}`,
      'info',
      'low'
    );
  };
  
  const openDeleteDialog = (instance: WhatsAppInstance) => {
    setInstanceToDelete(instance);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteInstance = async () => {
    if (!instanceToDelete) return;
    
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/instances/${instanceToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete instance');
      }
      
      // Se a instância atual está sendo excluída, mude para a instância principal
      if (currentInstance === instanceToDelete.id) {
        setCurrentInstance('default');
      }
      
      // Reload instances to get updated list
      await loadInstances();
      
      addNotification(
        'Instância Excluída',
        `A instância "${instanceToDelete.name}" foi excluída com sucesso e todos seus dados foram removidos`,
        'success',
        'high'
      );
    } catch (error) {
      console.error('Error deleting instance:', error);
      addNotification(
        'Erro ao Excluir Instância',
        `Não foi possível excluir a instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'error',
        'high'
      );
    } finally {
      setShowDeleteDialog(false);
      setInstanceToDelete(null);
    }
  };

  return {
    instances,
    currentInstance,
    instanceName,
    showNewInstanceDialog,
    showDeleteDialog,
    instanceToDelete,
    isLoading,
    setInstanceName,
    setShowNewInstanceDialog,
    setShowDeleteDialog,
    setInstanceToDelete,
    addNewInstance,
    handleInstanceSwitch,
    openDeleteDialog,
    handleDeleteInstance,
    loadInstances
  };
}
