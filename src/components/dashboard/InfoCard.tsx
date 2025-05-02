
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface InfoCardProps {
  totalLinks: number;
}

const InfoCard = ({ totalLinks }: InfoCardProps) => {
  return (
    <Card className="dashboard-card">
      <div className="border-b p-4 font-medium">Informações</div>
      <div className="p-4">
        <div className="space-y-4 text-sm">
          <p>
            O PromoZap monitora automaticamente os links de produtos da Shopee 
            em grupos do WhatsApp e os converte para links de afiliado.
          </p>
          
          <div className="flex flex-col gap-2 mt-4">
            <h4 className="font-medium">Links processados</h4>
            <div className="text-2xl font-bold">{totalLinks}</div>
            <div className="text-xs text-muted-foreground">Total de conversões</div>
          </div>
          
          <div className="mt-4">
            <Button className="w-full" asChild>
              <Link to="/whatsapp-conexao">Gerenciar Conexão</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InfoCard;
