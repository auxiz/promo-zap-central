
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useResourceMonitoring } from '@/hooks/useResourceMonitoring';
import { 
  HardDrive, 
  Cpu, 
  Wifi, 
  Gauge,
  AlertTriangle,
  PlayCircle,
  StopCircle,
  Trash2,
  Zap,
  Activity,
  Clock
} from 'lucide-react';

export function ResourceMonitoringPanel() {
  const {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    optimizeResources
  } = useResourceMonitoring();

  useEffect(() => {
    // Start monitoring automatically
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Monitoramento de Recursos</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={optimizeResources}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Otimizar
          </Button>
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className="flex items-center gap-2"
          >
            {isMonitoring ? (
              <>
                <StopCircle className="h-4 w-4" />
                Parar
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Iniciar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status de Monitoramento */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {isMonitoring ? 'Monitoramento Ativo' : 'Monitoramento Inativo'}
              </span>
            </div>
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Ativos */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas Ativos ({alerts.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearAlerts}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} variant={getSeverityColor(alert.severity) as any}>
                {getSeverityIcon(alert.severity)}
                <AlertTitle className="capitalize">{alert.type} - {alert.severity}</AlertTitle>
                <AlertDescription>
                  {alert.message} (Atual: {alert.currentValue.toFixed(1)}, Limite: {alert.threshold})
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Métricas de Recursos */}
      {metrics && (
        <>
          {/* Memória e CPU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Memória
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Uso de Memória</span>
                    <span>{metrics.memory.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.memory.percentage} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>Usado: {formatBytes(metrics.memory.used)}</p>
                    </div>
                    <div>
                      <p>Total: {formatBytes(metrics.memory.total)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>FPS</span>
                        <span>{metrics.performance.fps}</span>
                      </div>
                      <Progress value={(metrics.performance.fps / 60) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Render Time</span>
                        <span>{metrics.performance.renderTime.toFixed(1)}ms</span>
                      </div>
                      <Progress value={(metrics.performance.renderTime / 16.67) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rede e Armazenamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Rede
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.network.downloadSpeed.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Mbps Download</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {metrics.network.uploadSpeed.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Mbps Upload</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{metrics.network.latency.toFixed(0)}ms</p>
                      <p className="text-xs text-muted-foreground">Latência</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{metrics.network.requests}</p>
                      <p className="text-xs text-muted-foreground">Requisições</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Armazenamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Uso de Storage</span>
                    <span>{metrics.storage.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.storage.percentage} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>Usado: {formatBytes(metrics.storage.used)}</p>
                    </div>
                    <div>
                      <p>Disponível: {formatBytes(metrics.storage.available)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status Geral do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className={`text-2xl font-bold ${
                    metrics.memory.percentage > 80 ? 'text-red-600' : 
                    metrics.memory.percentage > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {metrics.memory.percentage > 80 ? 'Alto' : 
                     metrics.memory.percentage > 60 ? 'Médio' : 'Baixo'}
                  </div>
                  <p className="text-sm text-muted-foreground">Uso de Memória</p>
                </div>
                
                <div className="text-center p-4 border rounded">
                  <div className={`text-2xl font-bold ${
                    metrics.performance.fps < 30 ? 'text-red-600' : 
                    metrics.performance.fps < 50 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {metrics.performance.fps < 30 ? 'Baixo' : 
                     metrics.performance.fps < 50 ? 'Médio' : 'Alto'}
                  </div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                </div>
                
                <div className="text-center p-4 border rounded">
                  <div className={`text-2xl font-bold ${
                    metrics.network.latency > 200 ? 'text-red-600' : 
                    metrics.network.latency > 100 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {metrics.network.latency > 200 ? 'Alta' : 
                     metrics.network.latency > 100 ? 'Média' : 'Baixa'}
                  </div>
                  <p className="text-sm text-muted-foreground">Latência</p>
                </div>
                
                <div className="text-center p-4 border rounded">
                  <div className={`text-2xl font-bold ${
                    metrics.storage.percentage > 80 ? 'text-red-600' : 
                    metrics.storage.percentage > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {metrics.storage.percentage > 80 ? 'Alto' : 
                     metrics.storage.percentage > 60 ? 'Médio' : 'Baixo'}
                  </div>
                  <p className="text-sm text-muted-foreground">Armazenamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
