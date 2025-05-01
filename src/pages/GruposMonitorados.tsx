
import React from 'react';
import { Check } from 'lucide-react';
import GroupList from '@/components/groups/GroupList';
import useGroupManagement from '@/hooks/useGroupManagement';
import ConnectWhatsAppPrompt from '@/components/whatsapp/ConnectWhatsAppPrompt';

export default function GruposMonitorados() {
  const {
    searchTerm,
    setSearchTerm,
    filteredGroups,
    selectedGroupIds,
    isLoading,
    isProcessing,
    connectionStatus,
    handleAddGroup,
    handleRemoveGroup
  } = useGroupManagement({
    endpoint: 'monitored',
    endpointLabel: 'monitoramento'
  });

  if (connectionStatus !== 'connected') {
    return <ConnectWhatsAppPrompt title="Grupos Monitorados" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grupos Monitorados</h1>
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
        groupType="Grupos"
        selectedLabel="Monitorado"
        unselectedLabel="Não Monitorado"
        addButtonIcon={<Check size={16} className="mr-1" />}
      />
    </div>
  );
}
