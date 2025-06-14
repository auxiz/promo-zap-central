
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  Clock,
  Zap,
  Target,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export function AdvancedAnalyticsPanel() {
  const { analyticsData, isCollecting, collectMetrics, generateReport } = useAdvancedAnalytics();
  
  const report = generateReport();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 50) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Coletando dados analíticos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Avançado</h2>
        <Button onClick={collectMetrics} disabled={isCollecting}>
          {isCollecting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Coletando...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              Atualizar Dados
            </>
          )}
        </Button>
      </div>

      {/* Score Geral */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Score de Performance Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className={`text-4xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score}
                </p>
                <p className="text-sm text-muted-foreground">de 100 pontos</p>
              </div>
              <div className="text-right">
                {getScoreIcon(report.score)}
                {report.trends && (
                  <div className="flex items-center gap-1 mt-2">
                    {report.trends.performance === 'improving' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {report.trends.change}% vs período anterior
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Progress value={report.score} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Carregamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analyticsData.performance.pageLoadTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo total de carregamento da página
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Contentful Paint</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analyticsData.performance.firstContentfulPaint)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo até o primeiro conteúdo visível
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analyticsData.performance.largestContentfulPaint)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo até o maior elemento carregado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Layout Shift</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.performance.cumulativeLayoutShift.toFixed(3)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estabilidade visual da página
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData.userBehavior.bounceRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários que saem sem interagir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração da Sessão</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analyticsData.userBehavior.sessionDuration * 1000)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo médio por sessão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recursos do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recursos do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memória</span>
                <span>{analyticsData.systemResources.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={analyticsData.systemResources.memoryUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU</span>
                <span>{analyticsData.systemResources.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress value={analyticsData.systemResources.cpuUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disco</span>
                <span>{analyticsData.systemResources.diskUsage.toFixed(1)}%</span>
              </div>
              <Progress value={analyticsData.systemResources.diskUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Latência</span>
                <span>{analyticsData.systemResources.networkLatency.toFixed(0)}ms</span>
              </div>
              <Progress 
                value={Math.min((analyticsData.systemResources.networkLatency / 500) * 100, 100)} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      {report && report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recomendações de Otimização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
