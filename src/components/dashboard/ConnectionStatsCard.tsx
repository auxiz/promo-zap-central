
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WhatsAppMetricsData } from '@/hooks/whatsapp/useWhatsAppStatus';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Clock, MessageSquare, Activity, TrendingUp } from 'lucide-react';

interface ConnectionStatsCardProps {
  metrics: WhatsAppMetricsData | null;
  connected: boolean;
  since: number | null;
  isLoading: boolean;
}

const ConnectionStatsCard = ({
  metrics,
  connected,
  since,
  isLoading
}: ConnectionStatsCardProps) => {
  const formatUptime = (milliseconds: number): string => {
    if (!milliseconds) return '0m';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  const getMessageRatio = (): number => {
    if (!metrics || !metrics.messages.sent) return 100;
    const total = metrics.messages.sent + metrics.messages.failed;
    if (total === 0) return 100;
    return Math.round((metrics.messages.sent / total) * 100);
  };
  
  const getConnectionTime = (): string => {
    if (!connected || !since) return 'Não conectado';
    return `${formatDistanceToNow(since, { locale: pt })}`;
  };

  return (
    <Card className="p-6 dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          Status da Conexão
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs">{connected ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-muted-foreground" />
            <span>Uptime:</span>
          </div>
          <div className="font-medium">
            {metrics ? formatUptime(metrics.uptime) : '0m'}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <MessageSquare size={14} className="text-muted-foreground" />
            <span>Mensagens:</span>
          </div>
          <div className="font-medium">
            {metrics ? metrics.messages.sent + metrics.messages.received : 0}
          </div>
        </div>
        
        {metrics && metrics.messages.failed > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Taxa de entrega:</span>
              <span>{getMessageRatio()}%</span>
            </div>
            <Progress value={getMessageRatio()} className="h-1" />
          </div>
        )}
        
        {metrics && metrics.rateLimits.isThrottled && (
          <Badge variant="destructive" className="w-full justify-center">
            WhatsApp com limitação de taxa
          </Badge>
        )}
        
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp size={12} />
            <span>
              {connected 
                ? `Conectado há ${getConnectionTime()}` 
                : 'Não conectado'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConnectionStatsCard;
