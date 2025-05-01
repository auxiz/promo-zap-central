
import React from 'react';
import { Check, PhoneOff } from 'lucide-react';

type StatusIndicatorProps = {
  connectionStatus: string;
  deviceInfo?: { 
    name: string; 
    lastConnection: string;
  };
  isLoading: boolean;
  handleConnect: () => void;
  handleDisconnect: () => void;
}

export default function StatusIndicator({
  connectionStatus,
  deviceInfo,
  isLoading,
  handleConnect,
  handleDisconnect
}: StatusIndicatorProps) {
  return (
    <div className="text-center">
      {connectionStatus === 'disconnected' && (
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center">
            <PhoneOff size={48} className="text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">WhatsApp Desconectado</h3>
          <p className="text-muted-foreground mt-2">
            Conecte-se ao WhatsApp para começar a monitorar e enviar mensagens.
          </p>
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 mx-auto flex items-center justify-center">
            <Check size={48} className="text-green-500" />
          </div>
          <h3 className="mt-4 text-lg font-medium">WhatsApp Conectado!</h3>
          <p className="text-green-500 font-medium mt-1">{deviceInfo?.name}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Conectado desde {deviceInfo?.lastConnection}
          </p>
        </div>
      )}

      {connectionStatus === 'disconnected' ? (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Conectando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Conectar WhatsApp
            </span>
          )}
        </button>
      ) : connectionStatus === 'connected' && (
        <div className="mt-6">
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/80 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Desconectando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PhoneOff size={18} />
                Desconectar
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
