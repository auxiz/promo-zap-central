
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppErrorMonitor } from '@/hooks/whatsapp/useWhatsAppErrorMonitor';
import { RotateCw, AlertTriangle, Ban, QrCode } from 'lucide-react';

type ErrorMonitorProps = {
  instanceId?: string;
  autoRefresh?: boolean;
  showDetails?: boolean;
}

export default function ErrorMonitor({
  instanceId = 'default',
  autoRefresh = true,
  showDetails = false
}: ErrorMonitorProps) {
  const {
    isLoading,
    errorStats,
    clearErrorHistory,
    fetchErrorStats
  } = useWhatsAppErrorMonitor(instanceId, autoRefresh);

  const [expanded, setExpanded] = useState(false);

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get icon for error type
  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'QR_CODE':
        return <QrCode size={16} className="text-amber-500" />;
      case 'CONNECTION':
        return <Ban size={16} className="text-red-500" />;
      case 'DISCONNECTION':
        return <AlertTriangle size={16} className="text-blue-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchErrorStats();
  };

  // Reset error history
  const handleReset = async () => {
    await clearErrorHistory();
  };

  return (
    <Card className="dashboard-card">
      <div className="border-b p-6 flex justify-between items-center">
        <h2 className="text-xl font-medium">
          Monitor de Erros {instanceId !== 'default' && `- ${instanceId}`}
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RotateCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span className="ml-2">Atualizar</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            disabled={isLoading}
          >
            Limpar
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {!errorStats ? (
          <div className="text-center text-muted-foreground py-6">
            {isLoading ? "Carregando estatísticas de erros..." : "Não há dados de erro disponíveis."}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Erros de QR Code</div>
                <div className="text-2xl font-semibold mt-1">{errorStats.qrCodeErrors}</div>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Erros de Conexão</div>
                <div className="text-2xl font-semibold mt-1">{errorStats.connectionErrors}</div>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Tentativas de Reconexão</div>
                <div className="text-2xl font-semibold mt-1">{errorStats.retryAttempts}</div>
              </div>
            </div>
            
            {/* Last error */}
            {errorStats.lastError && (
              <Alert className={errorStats.lastError.type === 'CONNECTION' ? "border-red-600/50" : "border-amber-600/50"}>
                <AlertTriangle className={
                  errorStats.lastError.type === 'CONNECTION' ? 
                  "h-4 w-4 text-red-600" : 
                  "h-4 w-4 text-amber-600"
                } />
                <AlertTitle>Último erro: {errorStats.lastError.type}</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>{errorStats.lastError.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(errorStats.lastError.timestamp)}
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error history */}
            {(showDetails || expanded) && errorStats.errorHistory.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium">Histórico de Erros</h3>
                  {showDetails && (
                    <Button 
                      variant="link" 
                      onClick={() => setExpanded(!expanded)}
                      className="text-sm p-0 h-auto"
                    >
                      {expanded ? "Ocultar" : "Mostrar todos"}
                    </Button>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left px-4 py-2">Tipo</th>
                        <th className="text-left px-4 py-2">Mensagem</th>
                        <th className="text-left px-4 py-2">Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorStats.errorHistory.map((error, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 flex items-center gap-2">
                            {getErrorIcon(error.type)}
                            <span>{error.type}</span>
                          </td>
                          <td className="px-4 py-2">{error.message}</td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {formatTimestamp(error.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
