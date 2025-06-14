
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  HardDrive, 
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

export function SystemMonitoringDashboard() {
  const {
    metrics,
    alerts,
    resolvedAlerts,
    isLoading,
    collectMetrics,
    resolveAlert,
    clearResolvedAlerts
  } = useSystemMonitoring();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'text-green-600';
    if (value <= thresholds[1]) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value <= thresholds[1]) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Métricas do Sistema */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Monitoramento do Sistema</h2>
        <Button onClick={collectMetrics} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Atualizar Métricas
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tempo de Resposta */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metrics.responseTime, [1000, 2000])}`}>
                {metrics.responseTime}ms
              </div>
              <div className="flex items-center mt-2">
                {getStatusIcon(metrics.responseTime, [1000, 2000])}
                <p className="text-xs text-muted-foreground ml-1">
                  {metrics.responseTime <= 1000 ? 'Excelente' : 
                   metrics.responseTime <= 2000 ? 'Aceitável' : 'Lento'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Taxa de Erro */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metrics.errorRate, [1, 3])}`}>
                {metrics.errorRate.toFixed(2)}%
              </div>
              <div className="flex items-center mt-2">
                {getStatusIcon(metrics.errorRate, [1, 3])}
                <p className="text-xs text-muted-foreground ml-1">
                  {metrics.errorRate <= 1 ? 'Baixa' : 
                   metrics.errorRate <= 3 ? 'Moderada' : 'Alta'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usuários Ativos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.activeUsers}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground ml-1">
                  Total de usuários
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Uso de Memória */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, [70, 85])}`}>
                {metrics.memoryUsage.toFixed(1)}%
              </div>
              <div className="flex items-center mt-2">
                {getStatusIcon(metrics.memoryUsage, [70, 85])}
                <p className="text-xs text-muted-foreground ml-1">
                  {metrics.memoryUsage <= 70 ? 'Normal' : 
                   metrics.memoryUsage <= 85 ? 'Elevado' : 'Crítico'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas Ativos */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Alertas Ativos ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>Alerta {alert.type.toUpperCase()}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                      {alert.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolver
                    </Button>
                  </div>
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <p>{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="font-medium">{metrics.lastUpdated.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Geral</p>
                <div className="flex items-center">
                  {metrics.responseTime <= 2000 && metrics.errorRate <= 3 && metrics.memoryUsage <= 85 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">Sistema Saudável</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-yellow-600 font-medium">Requer Atenção</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {resolvedAlerts.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    Alertas Resolvidos ({resolvedAlerts.length})
                  </p>
                  <Button size="sm" variant="ghost" onClick={clearResolvedAlerts}>
                    Limpar Histórico
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
