
import React from 'react';
import { Loader2, ServerCrash } from 'lucide-react';

type QRCodeScannerProps = {
  qrCode: string;
  backendError?: boolean;
  handleQrCodeScanned: () => void;
  handleConnect: () => void;
}

export default function QRCodeScanner({ 
  qrCode, 
  backendError = false,
  handleQrCodeScanned,
  handleConnect 
}: QRCodeScannerProps) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Leia o QR Code</h3>
        <p className="text-muted-foreground mt-2">
          Abra o WhatsApp no seu celular e escaneie o QR Code abaixo:
        </p>
        
        <div className="mt-6 p-4 bg-white rounded-lg inline-block min-h-[264px] min-w-[264px] flex items-center justify-center">
          {backendError ? (
            <div className="flex flex-col items-center justify-center">
              <ServerCrash size={48} className="text-destructive" />
              <p className="text-sm text-destructive mt-2">Erro de conexão com o backend</p>
              <p className="text-xs text-muted-foreground mt-1">Verifique se o servidor Node.js está rodando na porta 4000</p>
            </div>
          ) : qrCode ? (
            <img
              src={qrCode}
              alt="QR Code para conectar WhatsApp"
              className="w-64 h-64"
              onClick={handleQrCodeScanned}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Loader2 size={48} className="text-gray-300 animate-spin" />
              <p className="text-sm text-gray-400 mt-2">Carregando QR Code...</p>
            </div>
          )}
        </div>
      </div>
      
      {!backendError && (
        <>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Aguardando leitura do QR Code...</p>
            <p className="mt-1">O QR Code expira em 60 segundos</p>
          </div>
          
          <button
            onClick={handleConnect}
            className="mt-6 px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
          >
            Gerar Novo QR Code
          </button>
        </>
      )}
      
      {backendError && (
        <button
          onClick={handleConnect}
          className="mt-6 px-4 py-2 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors"
        >
          Tentar Reconectar
        </button>
      )}
    </div>
  );
}
