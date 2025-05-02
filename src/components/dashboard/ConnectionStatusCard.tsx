
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ConnectionStatusCardProps {
  connected: boolean;
  device: string;
  since: number | null;
  isStatusLoading: boolean;
  onCheckStatus: () => void;
}

const ConnectionStatusCard = ({ 
  connected, 
  device, 
  since, 
  isStatusLoading, 
  onCheckStatus 
}: ConnectionStatusCardProps) => {
  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return '--';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' às ' + date.toLocaleTimeString().substring(0, 5);
  };

  return (
    <Card className="p-6 dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Status da Conexão</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs">{connected ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      <div className="text-sm">
        <p className="font-medium">{device ? `Dispositivo: ${device}` : 'Não conectado'}</p>
        <p className="text-muted-foreground mt-1">
          {since ? `Desde: ${formatTimestamp(since)}` : 'Conecte o WhatsApp para começar'}
        </p>
      </div>
      <div className="mt-4">
        <Button 
          onClick={onCheckStatus} 
          className="w-full"
          variant="outline"
          disabled={isStatusLoading}
        >
          {isStatusLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            </>
          ) : (
            'Verificar Status'
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ConnectionStatusCard;
