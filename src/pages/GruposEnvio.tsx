
import React from 'react';
import { Plus } from 'lucide-react';
import GroupList from '@/components/groups/GroupList';
import GroupStatistics from '@/components/groups/GroupStatistics';
import useGroupManagement from '@/hooks/useGroupManagement';
import ConnectWhatsAppPrompt from '@/components/whatsapp/ConnectWhatsAppPrompt';

export default function GruposEnvio() {
  const {
    searchTerm,
    setSearchTerm,
    filteredGroups,
    selectedGroupIds,
    groups,
    isLoading,
    isProcessing,
    connectionStatus,
    handleAddGroup,
    handleRemoveGroup
  } = useGroupManagement({
    endpoint: 'send',
    endpointLabel: 'envio'
  });

  if (connectionStatus !== 'connected') {
    return <ConnectWhatsAppPrompt title="Grupos de Envio" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grupos de Envio</h1>
      </div>
      
      <GroupList
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredGroups={filteredGroups}
        selectedGroupIds={selectedGroupIds}
        isLoading={isLoading}
        isProcessing={isProcessing}
        onAddGroup={handleAddGroup}
        onRemoveGroup={handleRemoveGroup}
        groupType="Grupos de Envio"
        selectedLabel="Grupo de Envio"
        unselectedLabel="Normal"
        addButtonIcon={<Plus size={16} className="mr-1" />}
      />
      
      <GroupStatistics 
        totalGroups={groups.length}
        selectedGroups={selectedGroupIds.length}
        groupTypeLabel="Grupos de Envio"
      />
    </div>
  );
}
