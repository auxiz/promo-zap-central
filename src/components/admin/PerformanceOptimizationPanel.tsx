
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAdvancedCache } from '@/hooks/useAdvancedCache';
import { useOptimizedQuery } from '@/hooks/useQueryOptimization';
import { 
  Zap, 
  Database, 
  RefreshCw, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  recommendation?: string;
}

export function PerformanceOptimizationPanel() {
  const cache = useAdvancedCache();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);

  // Simulated performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Tempo de Carregamento',
      value: 1200,
      unit: 'ms',
      status: 'good',
    },
    {
      name: 'First Contentful Paint',
      value: 800,
      unit: 'ms',
      status: 'good',
    },
    {
      name: 'Largest Contentful Paint',
      value: 2100,
      unit: 'ms',
      status: 'warning',
      recommendation: 'Otimizar imagens e recursos estáticos'
    },
    {
      name: 'Cumulative Layout Shift',
      value: 0.15,
      unit: '',
      status: 'warning',
      recommendation: 'Definir dimensões para elementos dinâmicos'
    },
    {
      name: 'Time to Interactive',
      value: 3200,
      unit: 'ms',
      status: 'critical',
      recommendation: 'Reduzir JavaScript bundle e usar lazy loading'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clear cache as part of optimization
    cache.clear();
    
    setLastOptimization(new Date());
    setIsOptimizing(false);
  };

  const overallScore = Math.round(
    performanceMetrics.reduce((acc, metric) => {
      const score = metric.status === 'good' ? 100 : metric.status === 'warning' ? 70 : 40;
      return acc + score;
    }, 0) / performanceMetrics.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Otimização de Performance</h2>
        <Button 
          onClick={runOptimization} 
          disabled={isOptimizing}
          className="flex items-center gap-2"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Otimizando...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Executar Otimização
            </>
          )}
        </Button>
      </div>

      {/* Score Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Score de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{overallScore}</p>
              <p className="text-sm text-muted-foreground">Score geral de 100</p>
            </div>
            <div className={`text-right ${getStatusColor(overallScore >= 80 ? 'good' : overallScore >= 60 ? 'warning' : 'critical')}`}>
              {getStatusIcon(overallScore >= 80 ? 'good' : overallScore >= 60 ? 'warning' : 'critical')}
            </div>
          </div>
          <Progress value={overallScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.value}{metric.unit}
              </div>
              {metric.recommendation && (
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.recommendation}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status do Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status do Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{cache.stats.size}</p>
              <p className="text-sm text-muted-foreground">Itens no Cache</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {(cache.stats.hitRate * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{cache.stats.hits}</p>
              <p className="text-sm text-muted-foreground">Cache Hits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{cache.stats.misses}</p>
              <p className="text-sm text-muted-foreground">Cache Misses</p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => cache.clear()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
            <Badge variant="secondary">
              Estratégia: {cache.config.strategy}
            </Badge>
            <Badge variant="secondary">
              Max: {cache.config.maxSize} itens
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendações de Otimização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {performanceMetrics
            .filter(metric => metric.recommendation)
            .map((metric, index) => (
              <Alert key={index} variant={metric.status === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{metric.name}</AlertTitle>
                <AlertDescription>{metric.recommendation}</AlertDescription>
              </Alert>
            ))}
        </CardContent>
      </Card>

      {/* Última Otimização */}
      {lastOptimization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Última Otimização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                Executada em {lastOptimization.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
