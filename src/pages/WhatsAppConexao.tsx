
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConnectionStatus from '@/components/whatsapp/ConnectionStatus';
import Instructions from '@/components/whatsapp/Instructions';
import useWhatsAppConnection from '@/hooks/useWhatsAppConnection';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

export default function WhatsAppConexao() {
  const [instanceName, setInstanceName] = useState('');
  const [instances, setInstances] = useState<{ id: string; name: string }[]>([{ id: 'default', name: 'Principal' }]);
  const [currentInstance, setCurrentInstance] = useState('default');
  const [showNewInstanceDialog, setShowNewInstanceDialog] = useState(false);
  
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

  const addNewInstance = () => {
    if (!instanceName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }

    const newInstanceId = `instance-${Date.now()}`;
    const newInstance = { id: newInstanceId, name: instanceName };
    
    setInstances(prev => [...prev, newInstance]);
    setCurrentInstance(newInstanceId);
    setInstanceName('');
    setShowNewInstanceDialog(false);
    
    toast.success(`Nova instância "${instanceName}" adicionada`);
  };

  const handleInstanceSwitch = (instanceId: string) => {
    setCurrentInstance(instanceId);
  };

  const handleDisconnectAndShowQR = async () => {
    await handleDisconnect();
    // Após desconectar, conecta novamente para mostrar o QR code
    handleConnect();
  };

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

      {instances.length > 1 && (
        <Card className="overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle className="text-md">Instâncias WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap gap-2 p-4">
              {instances.map(instance => (
                <Button
                  key={instance.id}
                  variant={currentInstance === instance.id ? "default" : "outline"}
                  onClick={() => handleInstanceSwitch(instance.id)}
                  className="text-sm"
                >
                  {instance.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <ConnectionStatus
        connectionStatus={connectionStatus}
        qrCode={qrCode}
        deviceInfo={deviceInfo}
        isLoading={isLoading}
        backendError={backendError}
        handleConnect={handleConnect}
        handleQrCodeScanned={handleQrCodeScanned}
        handleDisconnect={handleDisconnectAndShowQR}
        instanceName={instances.find(i => i.id === currentInstance)?.name || ''}
      />
      
      <Instructions />

      <AlertDialog open={showNewInstanceDialog} onOpenChange={setShowNewInstanceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nova Instância WhatsApp</AlertDialogTitle>
            <AlertDialogDescription>
              Digite um nome para identificar esta instância do WhatsApp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nome da instância (ex: Vendas, Suporte)"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInstanceName('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={addNewInstance}>Adicionar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
