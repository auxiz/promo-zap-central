
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ConnectWhatsAppPromptProps {
  title: string;
}

export default function ConnectWhatsAppPrompt({ title }: ConnectWhatsAppPromptProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            WhatsApp não está conectado. Por favor, conecte o WhatsApp primeiro.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/whatsapp-conexao'}
            className="mt-4"
          >
            Ir para página de conexão
          </Button>
        </div>
      </Card>
    </div>
  );
}
