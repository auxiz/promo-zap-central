
import React from 'react';
import ConnectionStatus from '@/components/whatsapp/ConnectionStatus';
import Instructions from '@/components/whatsapp/Instructions';
import useWhatsAppConnection from '@/hooks/useWhatsAppConnection';

export default function WhatsAppConexao() {
  const {
    connectionStatus,
    qrCode,
    deviceInfo,
    isLoading,
    handleConnect,
    handleQrCodeScanned,
    handleDisconnect
  } = useWhatsAppConnection();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">WhatsApp Conexão</h1>
      
      <ConnectionStatus
        connectionStatus={connectionStatus}
        qrCode={qrCode}
        deviceInfo={deviceInfo}
        isLoading={isLoading}
        handleConnect={handleConnect}
        handleQrCodeScanned={handleQrCodeScanned}
        handleDisconnect={handleDisconnect}
      />
      
      <Instructions />
    </div>
  );
}
