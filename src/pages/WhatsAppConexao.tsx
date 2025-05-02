
import React from 'react';
import { Button } from '@/components/ui/button';
import ConnectionStatus from '@/components/whatsapp/ConnectionStatus';
import Instructions from '@/components/whatsapp/Instructions';
import useWhatsAppConnection from '@/hooks/useWhatsAppConnection';
import { PlusCircle } from 'lucide-react';
import { useWhatsAppInstances } from '@/hooks/useWhatsAppInstances';
import InstancesList from '@/components/whatsapp/InstancesList';
import NewInstanceDialog from '@/components/whatsapp/NewInstanceDialog';
import DeleteInstanceDialog from '@/components/whatsapp/DeleteInstanceDialog';

export default function WhatsAppConexao() {
  const {
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
  } = useWhatsAppInstances();
  
  const {
    connectionStatus,
    qrCode,
    deviceInfo,
    isLoading,
    backendError,
    handleConnect,
    handleQrCodeScanned,
    handleDisconnect
  } = useWhatsAppConnection(currentInstance);

  // Remove the combined disconnect and connect logic
  // The disconnect should only disconnect, not immediately reconnect

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">WhatsApp Conexão</h1>
        <Button 
          onClick={() => setShowNewInstanceDialog(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Nova Instância
        </Button>
      </div>

      <InstancesList 
        instances={instances} 
        currentInstance={currentInstance}
        handleInstanceSwitch={handleInstanceSwitch}
        openDeleteDialog={openDeleteDialog}
      />
      
      <ConnectionStatus
        connectionStatus={connectionStatus}
        qrCode={qrCode}
        deviceInfo={deviceInfo}
        isLoading={isLoading}
        backendError={backendError}
        handleConnect={handleConnect}
        handleQrCodeScanned={handleQrCodeScanned}
        handleDisconnect={handleDisconnect}
        instanceName={instances.find(i => i.id === currentInstance)?.name || ''}
      />
      
      <Instructions />

      {/* Diálogos */}
      <NewInstanceDialog 
        showDialog={showNewInstanceDialog}
        setShowDialog={setShowNewInstanceDialog}
        instanceName={instanceName}
        setInstanceName={setInstanceName}
        addNewInstance={addNewInstance}
      />
      
      <DeleteInstanceDialog 
        showDialog={showDeleteDialog}
        setShowDialog={setShowDeleteDialog}
        instanceToDelete={instanceToDelete}
        handleDeleteInstance={handleDeleteInstance}
      />
    </div>
  );
}
