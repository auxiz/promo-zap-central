
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function InstructionSteps() {
  return (
    <div className="space-y-4">
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
          <p className="text-muted-foreground mt-1">
            Abra o WhatsApp no seu celular, vá em Configurações {'>'}  Dispositivos conectados {'>'}  Conectar um dispositivo.
          </p>
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
  );
}
