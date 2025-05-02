
import React from 'react';
import { Button } from '@/components/ui/button';
import ConnectionStatus from '@/components/whatsapp/ConnectionStatus';
import Instructions from '@/components/whatsapp/Instructions';
import useWhatsAppConnection from '@/hooks/useWhatsAppConnection';
import { PlusCircle, BarChart } from 'lucide-react';
import { useWhatsAppInstances } from '@/hooks/useWhatsAppInstances';
import InstancesList from '@/components/whatsapp/InstancesList';
import NewInstanceDialog from '@/components/whatsapp/NewInstanceDialog';
import DeleteInstanceDialog from '@/components/whatsapp/DeleteInstanceDialog';
import ErrorMonitor from '@/components/whatsapp/ErrorMonitor';
import { useState } from 'react';

export default function WhatsAppConexao() {
  const [showErrorMonitor, setShowErrorMonitor] = useState(false);
  
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">WhatsApp Conexão</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowErrorMonitor(!showErrorMonitor)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <BarChart size={16} />
            {showErrorMonitor ? 'Ocultar Monitor' : 'Monitor de Erros'}
          </Button>
          <Button 
            onClick={() => setShowNewInstanceDialog(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Nova Instância
          </Button>
        </div>
      </div>

      <InstancesList 
        instances={instances} 
        currentInstance={currentInstance}
        handleInstanceSwitch={handleInstanceSwitch}
        openDeleteDialog={openDeleteDialog}
      />
      
      {showErrorMonitor && (
        <ErrorMonitor 
          instanceId={currentInstance}
          autoRefresh={connectionStatus === 'connecting'}
          showDetails={true}
        />
      )}
      
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
