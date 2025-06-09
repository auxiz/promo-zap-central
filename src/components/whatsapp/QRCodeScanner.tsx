
import React from 'react';
import { Loader2, ServerCrash, AlertTriangle, Ban, History, Clock } from 'lucide-react';
import { useWhatsAppErrorMonitor } from '@/hooks/whatsapp/useWhatsAppErrorMonitor';

type QRCodeScannerProps = {
  qrCode: string;
  connectionStatus: string;
  backendError: boolean;
  instanceId?: string;
}

export default function QRCodeScanner({ 
  qrCode, 
  connectionStatus, 
  backendError,
  instanceId = 'default'
}: QRCodeScannerProps) {
  // Get error stats for this instance (don't auto refresh to avoid additional load)
  const { errorStats } = useWhatsAppErrorMonitor(instanceId, false);

  if (connectionStatus === 'connected') {
    return <p className="text-center text-green-500 font-medium">✅ WhatsApp conectado!</p>;
  }

  // Determine if we have excessive retries
  const hasExcessiveRetries = errorStats?.retryAttempts && errorStats.retryAttempts > 8;

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
              <p className="text-sm text-destructive mt-2">Erro de conexão com o servidor</p>
              <p className="text-xs text-muted-foreground mt-1">Verifique se o servidor está ativo e acessível</p>
            </div>
          ) : hasExcessiveRetries ? (
            <div className="flex flex-col items-center justify-center">
              <Ban size={48} className="text-amber-500" />
              <p className="text-sm text-amber-500 mt-2">
                {errorStats?.qrCodeErrors ? "Muitas falhas na geração do QR Code" : "Muitas tentativas de reconexão"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {errorStats?.qrCodeErrors 
                  ? `${errorStats.qrCodeErrors} erros de QR Code detectados` 
                  : "O sistema pode estar sobrecarregado"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente desconectar e reconectar depois de alguns minutos
              </p>
            </div>
          ) : qrCode ? (
            <img
              src={qrCode}
              alt="QR Code para conectar WhatsApp"
              className="w-64 h-64"
            />
          ) : connectionStatus === 'connecting' ? (
            <div className="flex flex-col items-center justify-center">
              {/* Show different message for potential session restore */}
              <History size={48} className="text-blue-400 animate-pulse" />
              <p className="text-sm text-blue-600 mt-2">Verificando sessão existente...</p>
              <p className="text-xs text-muted-foreground mt-1">
                A sessão anterior pode ser restaurada automaticamente
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <AlertTriangle size={48} className="text-amber-500" />
              <p className="text-sm text-amber-500 mt-2">QR Code não disponível</p>
              <p className="text-xs text-muted-foreground mt-1">Clique em Conectar para gerar um novo QR Code</p>
            </div>
          )}
        </div>
      </div>
      
      {!backendError && connectionStatus === 'connecting' && qrCode && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Clock size={16} className="text-green-600" />
            <span className="text-green-600 font-medium">QR Code disponível por 5 minutos</span>
          </p>
          <p className="mt-1">Escaneie com calma - tempo suficiente para conectar</p>
          <p className="mt-2 text-xs">Após escanear, a sessão será salva e você não precisará escanear novamente</p>
        </div>
      )}
      
      {/* Show session restoration message when connecting without a QR code */}
      {!backendError && connectionStatus === 'connecting' && !qrCode && (
        <div className="mt-4 p-3 bg-blue-50 border-blue-200 border rounded-md text-blue-800">
          <p className="text-sm font-medium">Restaurando sessão anterior</p>
          <p className="text-xs mt-1">
            O sistema está tentando recuperar sua sessão anterior do WhatsApp.
            Se existir uma sessão válida, a conexão será feita automaticamente.
            Caso contrário, um QR Code será gerado e ficará disponível por 5 minutos.
          </p>
        </div>
      )}
      
      {hasExcessiveRetries && (
        <div className="mt-4 p-3 bg-amber-50 border-amber-200 border rounded-md text-amber-800">
          <p className="text-sm font-medium">Dificuldades na conexão detectadas</p>
          <p className="text-xs mt-1">
            O sistema está enfrentando problemas para estabelecer conexão. 
            Isso pode acontecer por sobrecarga no WhatsApp ou restrições temporárias.
            Aguarde alguns minutos antes de tentar novamente.
          </p>
        </div>
      )}
    </div>
  );
}
