
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import useWhatsAppConnection from './useWhatsAppConnection';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export interface Group {
  id: string;
  name: string;
}

interface UseGroupManagementProps {
  endpoint: 'monitored' | 'send';
  endpointLabel: string;
}

export default function useGroupManagement({ endpoint, endpointLabel }: UseGroupManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const { connectionStatus } = useWhatsAppConnection();

  // Fetch all groups and selected groups
  useEffect(() => {
    const fetchData = async () => {
      if (connectionStatus !== 'connected') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all groups
        const groupsResponse = await fetch(`${WHATSAPP_API_BASE_URL}/groups`);
        if (!groupsResponse.ok) {
          throw new Error(`Falha ao carregar grupos`);
        }
        const groupsData = await groupsResponse.json();

        // Fetch selected groups (monitored or send)
        const selectedResponse = await fetch(`${WHATSAPP_API_BASE_URL}/${endpoint}`);
        if (!selectedResponse.ok) {
          throw new Error(`Falha ao carregar grupos ${endpointLabel.toLowerCase()}`);
        }
        const selectedData = await selectedResponse.json();

        setGroups(groupsData.groups || []);
        setSelectedGroupIds(selectedData[endpoint] || []);
        
        // Show success notification when groups load after connection
        if (connectionStatus === 'connected' && groupsData.groups?.length > 0) {
          toast.success(`${groupsData.groups.length} grupos carregados com sucesso!`);
        }
      } catch (error) {
        console.error(`Error fetching groups:`, error);
        toast.error('Erro ao carregar dados dos grupos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [connectionStatus, endpoint, endpointLabel]);

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
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });

      if (!response.ok) {
        throw new Error(`Falha ao adicionar grupo ${endpointLabel.toLowerCase()}`);
      }

      const data = await response.json();
      setSelectedGroupIds(data[endpoint]);
      toast.success(`Grupo adicionado à lista de ${endpointLabel.toLowerCase()}`);
    } catch (error) {
      console.error(`Error adding ${endpoint} group:`, error);
      toast.error(`Erro ao adicionar grupo ${endpointLabel.toLowerCase()}`);
    } finally {
      setIsProcessing(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    setIsProcessing(prev => ({ ...prev, [groupId]: true }));
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/${endpoint}/${groupId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Falha ao remover grupo ${endpointLabel.toLowerCase()}`);
      }

      const data = await response.json();
      setSelectedGroupIds(data[endpoint]);
      toast.success(`Grupo removido da lista de ${endpointLabel.toLowerCase()}`);
    } catch (error) {
      console.error(`Error removing ${endpoint} group:`, error);
      toast.error(`Erro ao remover grupo ${endpointLabel.toLowerCase()}`);
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
