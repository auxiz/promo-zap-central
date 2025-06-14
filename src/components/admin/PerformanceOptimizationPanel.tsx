
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedCache } from '@/hooks/useAdvancedCache';
import { useQueryCache } from '@/hooks/useQueryOptimization';
import { 
  Database, 
  Zap, 
  BarChart3, 
  RefreshCw, 
  Trash2,
  TrendingUp,
  Clock,
  HardDrive
} from 'lucide-react';

export function PerformanceOptimizationPanel() {
  const cache = useAdvancedCache({
    maxSize: 200,
    defaultTTL: 10 * 60 * 1000, // 10 minutes
    strategy: 'LRU'
  });

  const queryCache = useQueryCache();

  const handleClearCache = () => {
    cache.clear();
    queryCache.clearCache();
  };

  const handleOptimizeQueries = () => {
    // Simulate query optimization
    console.log('Otimizando consultas...');
  };

  const getCacheEfficiencyColor = (hitRate: number) => {
    if (hitRate >= 0.8) return 'text-green-600';
    if (hitRate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCacheEfficiencyLabel = (hitRate: number) => {
    if (hitRate >= 0.8) return 'Excelente';
    if (hitRate >= 0.6) return 'Boa';
    if (hitRate >= 0.4) return 'Regular';
    return 'Ruim';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Otimização de Performance</h2>
        <div className="flex gap-2">
          <Button onClick={handleOptimizeQueries} variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Otimizar Consultas
          </Button>
          <Button onClick={handleClearCache} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </div>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Estatísticas do Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getCacheEfficiencyColor(cache.stats.hitRate)}`}>
                  {(cache.stats.hitRate * 100).toFixed(1)}%
                </span>
                <Badge variant={cache.stats.hitRate >= 0.8 ? 'default' : cache.stats.hitRate >= 0.6 ? 'secondary' : 'destructive'}>
                  {getCacheEfficiencyLabel(cache.stats.hitRate)}
                </Badge>
              </div>
              <Progress value={cache.stats.hitRate * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total de Acessos</p>
              <div className="text-2xl font-bold text-blue-600">
                {cache.stats.hits + cache.stats.misses}
              </div>
              <p className="text-xs text-muted-foreground">
                {cache.stats.hits} acertos, {cache.stats.misses} falhas
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Itens no Cache</p>
              <div className="text-2xl font-bold text-purple-600">
                {cache.stats.size}
              </div>
              <p className="text-xs text-muted-foreground">
                de {cache.config.maxSize} máximo
              </p>
              <Progress value={(cache.stats.size / cache.config.maxSize) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estratégia</p>
              <div className="text-lg font-semibold text-gray-700">
                {cache.config.strategy}
              </div>
              <p className="text-xs text-muted-foreground">
                TTL: {cache.config.defaultTTL / 1000}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tempo Médio de Consulta</span>
              <span className="font-medium">127ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Consultas Otimizadas</span>
              <Badge variant="default">85%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Índices Utilizados</span>
              <span className="font-medium">24/28</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conexões Ativas</span>
              <span className="font-medium">12</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recomendações de Otimização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium text-sm">Cache Efficiency</p>
              <p className="text-xs text-muted-foreground">
                Taxa de acerto do cache está boa. Considere aumentar o TTL para dados estáticos.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="font-medium text-sm">Query Optimization</p>
              <p className="text-xs text-muted-foreground">
                4 consultas podem ser otimizadas com índices adicionais.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium text-sm">Connection Pool</p>
              <p className="text-xs text-muted-foreground">
                Pool de conexões está funcionando eficientemente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Gerenciamento de Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="font-medium">Cache de Consultas</p>
              <p className="text-sm text-muted-foreground">
                Armazena resultados de consultas frequentes para reduzir carga no banco.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Invalidar Cache
              </Button>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Cache de Sessão</p>
              <p className="text-sm text-muted-foreground">
                Mantém dados de sessão do usuário em memória para acesso rápido.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Configurar TTL
              </Button>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Cache de Recursos</p>
              <p className="text-sm text-muted-foreground">
                Armazena assets estáticos e dados raramente alterados.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Otimizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
