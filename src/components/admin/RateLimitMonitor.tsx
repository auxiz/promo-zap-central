
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAdvancedRateLimit } from '@/hooks/useAdvancedRateLimit';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Activity,
  Settings,
  RefreshCw
} from 'lucide-react';

interface RateLimitTest {
  id: string;
  timestamp: Date;
  success: boolean;
  remainingRequests: number;
}

export function RateLimitMonitor() {
  const [testKey, setTestKey] = useState('test-endpoint');
  const [testHistory, setTestHistory] = useState<RateLimitTest[]>([]);
  
  const rateLimit = useAdvancedRateLimit(testKey, {
    maxRequests: 10,
    windowMs: 60000, // 1 minuto
    blockDurationMs: 300000 // 5 minutos
  });

  // Simulated global rate limit stats
  const [globalStats, setGlobalStats] = useState({
    totalRequests: 1247,
    blockedRequests: 23,
    activeBlocks: 3,
    peakRequestsPerMinute: 156
  });

  const testRateLimit = () => {
    const success = rateLimit.attemptRequest();
    const test: RateLimitTest = {
      id: Date.now().toString(),
      timestamp: new Date(),
      success,
      remainingRequests: rateLimit.remainingRequests
    };
    
    setTestHistory(prev => [test, ...prev].slice(0, 10));
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  useEffect(() => {
    // Simulate global stats updates
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        blockedRequests: prev.blockedRequests + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const blockRate = globalStats.totalRequests > 0 
    ? (globalStats.blockedRequests / globalStats.totalRequests * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Monitoramento de Rate Limiting</h2>
        <Button onClick={() => rateLimit.reset()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Limites
        </Button>
      </div>

      {/* Status Global */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Nas últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições Bloqueadas</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{globalStats.blockedRequests}</div>
            <p className="text-xs text-muted-foreground">Taxa: {blockRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueios Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{globalStats.activeBlocks}</div>
            <p className="text-xs text-muted-foreground">IPs bloqueados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pico de Requisições</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{globalStats.peakRequestsPerMinute}</div>
            <p className="text-xs text-muted-foreground">Por minuto</p>
          </CardContent>
        </Card>
      </div>

      {/* Status do Rate Limit Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status do Rate Limit - {testKey}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rateLimit.isBlocked ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Endpoint Bloqueado</AlertTitle>
              <AlertDescription>
                Limite de {rateLimit.maxRequests} requisições por minuto excedido.
                Bloqueio será removido em {formatTime(rateLimit.remainingTime)}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Endpoint Ativo</AlertTitle>
              <AlertDescription>
                {rateLimit.remainingRequests} de {rateLimit.maxRequests} requisições disponíveis.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Requisições Utilizadas</span>
              <span>{rateLimit.maxRequests - rateLimit.remainingRequests}/{rateLimit.maxRequests}</span>
            </div>
            <Progress 
              value={(rateLimit.maxRequests - rateLimit.remainingRequests) / rateLimit.maxRequests * 100} 
              className="h-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={rateLimit.isBlocked ? 'destructive' : 'default'}>
              {rateLimit.isBlocked ? 'Bloqueado' : 'Ativo'}
            </Badge>
            <Badge variant="secondary">
              Janela: {(rateLimit.windowMs / 1000 / 60).toFixed(0)}min
            </Badge>
            <Badge variant="secondary">
              Limite: {rateLimit.maxRequests} req/min
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Rate Limit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Teste de Rate Limit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-key">Endpoint para Teste</Label>
              <Input
                id="test-key"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="test-endpoint"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={testRateLimit}
                disabled={rateLimit.isBlocked}
                className="w-full"
              >
                <Activity className="h-4 w-4 mr-2" />
                Testar Requisição
              </Button>
            </div>
          </div>

          {testHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Histórico de Testes</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {testHistory.map((test) => (
                  <div key={test.id} className="flex items-center justify-between text-sm p-2 rounded border">
                    <div className="flex items-center gap-2">
                      {test.success ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                      )}
                      <span>{test.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={test.success ? 'default' : 'destructive'} className="text-xs">
                        {test.success ? 'Sucesso' : 'Bloqueado'}
                      </Badge>
                      <span className="text-muted-foreground">
                        {test.remainingRequests} restantes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações e Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <p className="text-2xl font-bold">{rateLimit.maxRequests}</p>
              <p className="text-sm text-muted-foreground">Máx. Requisições</p>
            </div>
            <div className="text-center p-4 border rounded">
              <p className="text-2xl font-bold">{(rateLimit.windowMs / 1000 / 60).toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Janela (min)</p>
            </div>
            <div className="text-center p-4 border rounded">
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Bloqueio (min)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
