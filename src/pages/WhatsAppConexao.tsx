
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Check, AlertTriangle, Phone, PhoneOff } from 'lucide-react';

// Mock QR code image (base64)
const mockQRCode = "data:image/png;base64,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";

export default function WhatsAppConexao() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [qrCode, setQrCode] = useState(mockQRCode);
  const [deviceInfo, setDeviceInfo] = useState({ name: 'Samsung Galaxy S21', lastConnection: '01/05/2025 08:35' });
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setIsLoading(true);
    
    // Simulate API call to get QR code
    setTimeout(() => {
      setIsLoading(false);
      setQrCode(mockQRCode);
    }, 1500);
  };
  
  const handleQrCodeScanned = () => {
    setConnectionStatus('connected');
  };
  
  const handleDisconnect = () => {
    setIsLoading(true);
    
    // Simulate API call to disconnect
    setTimeout(() => {
      setConnectionStatus('disconnected');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">WhatsApp Conexão</h1>
      
      <Card className="dashboard-card overflow-visible">
        <div className="border-b p-6">
          <h2 className="text-xl font-medium">Status da Conexão</h2>
        </div>
        
        <div className="p-6">
          <div className="max-w-xl mx-auto">
            {connectionStatus === 'disconnected' && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center">
                    <PhoneOff size={48} className="text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">WhatsApp Desconectado</h3>
                  <p className="text-muted-foreground mt-2">
                    Conecte-se ao WhatsApp para começar a monitorar e enviar mensagens.
                  </p>
                </div>
                
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
                      <Phone size={18} />
                      Conectar WhatsApp
                    </span>
                  )}
                </button>
              </div>
            )}
            
            {connectionStatus === 'connecting' && (
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-lg font-medium">Leia o QR Code</h3>
                  <p className="text-muted-foreground mt-2">
                    Abra o WhatsApp no seu celular e escaneie o QR Code abaixo:
                  </p>
                  
                  <div className="mt-6 p-4 bg-white rounded-lg inline-block">
                    <img
                      src={qrCode}
                      alt="QR Code para conectar WhatsApp"
                      className="w-64 h-64"
                      onClick={handleQrCodeScanned} // This is just for demo
                    />
                  </div>
                </div>
                
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
              </div>
            )}
            
            {connectionStatus === 'connected' && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 mx-auto flex items-center justify-center">
                    <Check size={48} className="text-green-500" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">WhatsApp Conectado!</h3>
                  <p className="text-green-500 font-medium mt-1">{deviceInfo.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Conectado desde {deviceInfo.lastConnection}
                  </p>
                </div>
                
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
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <Card className="dashboard-card">
        <div className="border-b p-6">
          <h2 className="text-xl font-medium">Instruções</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium">Conecte o WhatsApp</h3>
              <p className="text-muted-foreground mt-1">Clique no botão "Conectar WhatsApp" para gerar um QR Code.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium">Escaneie o QR Code</h3>
              <p className="text-muted-foreground mt-1">Abra o WhatsApp no seu celular, vá em Configurações > Dispositivos conectados > Conectar um dispositivo.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium">Pronto!</h3>
              <p className="text-muted-foreground mt-1">O sistema começará a monitorar os grupos selecionados e enviará mensagens automaticamente.</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md flex gap-3">
            <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Atenção</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                Mantenha seu celular conectado à Internet para que o sistema funcione corretamente. Se o celular ficar offline por muito tempo, a conexão com o WhatsApp pode ser perdida.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
