
import React from 'react';
import { Card } from '@/components/ui/card';
import StatusIndicator from './StatusIndicator';
import QRCodeScanner from './QRCodeScanner';

type ConnectionStatusProps = {
  connectionStatus: string;
  qrCode: string;
  deviceInfo: { name: string; lastConnection: string };
  isLoading: boolean;
  backendError?: boolean;
  handleConnect: () => void;
  handleQrCodeScanned: () => void;
  handleDisconnect: () => void;
  instanceName?: string;
}

export default function ConnectionStatus({
  connectionStatus,
  qrCode,
  deviceInfo,
  isLoading,
  backendError = false,
  handleConnect,
  handleQrCodeScanned,
  handleDisconnect,
  instanceName = ''
}: ConnectionStatusProps) {
  return (
    <Card className="dashboard-card overflow-visible">
      <div className="border-b p-6">
        <h2 className="text-xl font-medium">
          Status da Conexão {instanceName && `- ${instanceName}`}
        </h2>
      </div>
      
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          {connectionStatus === 'connecting' ? (
            <QRCodeScanner 
              qrCode={qrCode}
              connectionStatus={connectionStatus}
              backendError={backendError}
            />
          ) : (
            <StatusIndicator
              connectionStatus={connectionStatus}
              deviceInfo={deviceInfo}
              isLoading={isLoading}
              backendError={backendError}
              handleConnect={handleConnect}
              handleDisconnect={handleDisconnect}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
