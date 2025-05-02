
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppMetrics } from '@/hooks/whatsapp/useWhatsAppMetrics';
import { Activity, AlertTriangle, RefreshCw, Trash2, MessageSquare, Clock, Gauge, Bell, BellOff, TrendingUp, TrendingDown } from 'lucide-react';

interface ConnectionMetricsProps {
  instanceId?: string;
  showDetails?: boolean;
}

export default function ConnectionMetrics({ 
  instanceId = 'default',
  showDetails = true
}: ConnectionMetricsProps) {
  const { 
    metrics, 
    isLoading, 
    fetchMetrics, 
    resetMetrics,
    clearRateLimitWarnings
  } = useWhatsAppMetrics(instanceId, true);
  
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
  
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };
  
  const getMessageRatio = (): number => {
    if (!metrics || !metrics.messages.sent) return 100;
    const total = metrics.messages.sent + metrics.messages.failed;
    if (total === 0) return 100;
    return Math.round((metrics.messages.sent / total) * 100);
  };

  return (
    <Card className="dashboard-card">
      <div className="border-b p-6 flex justify-between items-center">
        <h2 className="text-xl font-medium flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          <span>Métricas de Conexão</span>
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMetrics()}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span className="ml-2">Atualizar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetMetrics()}
            disabled={isLoading}
          >
            <Trash2 size={16} />
            <span className="ml-2">Resetar</span>
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {!metrics ? (
          <div className="text-center text-muted-foreground py-8">
            {isLoading ? "Carregando métricas..." : "Não há dados de métricas disponíveis."}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {metrics.connectionState === 'connected' ? (
                  <Badge variant="default" className="bg-green-500">Conectado</Badge>
                ) : (
                  <Badge variant="secondary">Desconectado</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">
                  Uptime: {formatUptime(metrics.uptime)}
                </span>
              </div>
            </div>
            
            {/* Rate Limit Warning */}
            {metrics.rateLimits.isThrottled && (
              <Alert className="border-amber-600/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Alerta de Limitação de Taxa</AlertTitle>
                <AlertDescription>
                  <p>WhatsApp pode estar limitando suas mensagens.</p>
                  {metrics.rateLimits.lastWarning && (
                    <p className="text-xs mt-2">
                      Último alerta: {formatTimestamp(metrics.rateLimits.lastWarning.timestamp)}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => clearRateLimitWarnings()}
                  >
                    Limpar Alertas
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare size={16} />
                  <span>Mensagens</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <div className="text-2xl font-semibold">{metrics.messages.sent + metrics.messages.received}</div>
                  <div className="text-xs space-x-2">
                    <Badge variant="secondary">
                      <TrendingUp size={12} className="mr-1 text-green-500" />
                      {metrics.messages.sent} enviadas
                    </Badge>
                    <Badge variant="secondary">
                      <TrendingDown size={12} className="mr-1 text-blue-500" />
                      {metrics.messages.received} recebidas
                    </Badge>
                  </div>
                </div>
                {metrics.messages.failed > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Taxa de sucesso: {getMessageRatio()}%
                    </div>
                    <Progress value={getMessageRatio()} className="h-1" />
                  </div>
                )}
              </div>
              
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge size={16} />
                  <span>Reconexões</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-2xl font-semibold">{metrics.reconnections}</div>
                  <div>
                    <Badge 
                      variant={metrics.reconnections > 5 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {metrics.reconnections > 5 ? 'Alto' : 'Normal'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {metrics.rateLimits.warnings.length > 0 ? (
                    <Bell size={16} className="text-amber-500" />
                  ) : (
                    <BellOff size={16} />
                  )}
                  <span>Alertas de taxa</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <div className="text-2xl font-semibold">{metrics.rateLimits.warnings.length}</div>
                  <div>
                    <Badge 
                      variant={metrics.rateLimits.isThrottled ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {metrics.rateLimits.isThrottled ? 'Throttled' : 'Normal'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rate Limit Warnings Table */}
            {showDetails && metrics.rateLimits.warnings.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Histórico de Alertas</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Mensagem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.rateLimits.warnings.map((warning, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">
                            {formatTimestamp(warning.timestamp)}
                          </TableCell>
                          <TableCell>{warning.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
