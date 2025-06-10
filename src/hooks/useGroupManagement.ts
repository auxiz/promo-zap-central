
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import useWhatsAppConnection from './useWhatsAppConnection';
import { buildInstanceUrl } from '@/utils/api-constants';

export interface Group {
  id: string;
  name: string;
}

interface UseGroupManagementProps {
  endpoint: 'monitored' | 'send';
  endpointLabel: string;
  instanceId?: string;
}

export default function useGroupManagement({ 
  endpoint, 
  endpointLabel, 
  instanceId = 'default' 
}: UseGroupManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const { connectionStatus } = useWhatsAppConnection(instanceId);

  // Fetch all groups and selected groups for the specific instance
  useEffect(() => {
    const fetchData = async () => {
      if (connectionStatus !== 'connected') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all groups for this instance
        const groupsResponse = await fetch(`${buildInstanceUrl(instanceId)}/groups`);
        if (!groupsResponse.ok) {
          throw new Error(`Falha ao carregar grupos`);
        }
        const groupsData = await groupsResponse.json();

        // Fetch selected groups (monitored or send) for this instance
        const selectedResponse = await fetch(`${buildInstanceUrl(instanceId)}/${endpoint}`);
        if (!selectedResponse.ok) {
          throw new Error(`Falha ao carregar grupos ${endpointLabel.toLowerCase()}`);
        }
        const selectedData = await selectedResponse.json();

        setGroups(groupsData.groups || []);
        setSelectedGroupIds(selectedData[endpoint] || []);
        
        // Show success notification when groups load after connection
        if (connectionStatus === 'connected' && groupsData.groups?.length > 0) {
          toast.success(`${groupsData.groups.length} grupos carregados com sucesso para instância ${instanceId}!`);
        }
      } catch (error) {
        console.error(`Error fetching groups for instance ${instanceId}:`, error);
        toast.error(`Erro ao carregar dados dos grupos da instância ${instanceId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [connectionStatus, endpoint, endpointLabel, instanceId]);

  // Auto-refresh when connection status changes to connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      // Small delay to ensure backend is ready
      const timer = setTimeout(() => {
        setIsLoading(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGroup = async (groupId: string) => {
    setIsProcessing(prev => ({ ...prev, [groupId]: true }));
    try {
      const response = await fetch(`${buildInstanceUrl(instanceId)}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });

      if (!response.ok) {
        throw new Error(`Falha ao adicionar grupo ${endpointLabel.toLowerCase()}`);
      }

      const data = await response.json();
      setSelectedGroupIds(data[endpoint]);
      toast.success(`Grupo adicionado à lista de ${endpointLabel.toLowerCase()} da instância ${instanceId}`);
    } catch (error) {
      console.error(`Error adding ${endpoint} group for instance ${instanceId}:`, error);
      toast.error(`Erro ao adicionar grupo ${endpointLabel.toLowerCase()} na instância ${instanceId}`);
    } finally {
      setIsProcessing(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    setIsProcessing(prev => ({ ...prev, [groupId]: true }));
    try {
      const response = await fetch(`${buildInstanceUrl(instanceId)}/${endpoint}/${groupId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Falha ao remover grupo ${endpointLabel.toLowerCase()}`);
      }

      const data = await response.json();
      setSelectedGroupIds(data[endpoint]);
      toast.success(`Grupo removido da lista de ${endpointLabel.toLowerCase()} da instância ${instanceId}`);
    } catch (error) {
      console.error(`Error removing ${endpoint} group for instance ${instanceId}:`, error);
      toast.error(`Erro ao remover grupo ${endpointLabel.toLowerCase()} da instância ${instanceId}`);
    } finally {
      setIsProcessing(prev => ({ ...prev, [groupId]: false }));
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    groups,
    selectedGroupIds,
    filteredGroups,
    isLoading,
    isProcessing,
    connectionStatus,
    handleAddGroup,
    handleRemoveGroup
  };
}
