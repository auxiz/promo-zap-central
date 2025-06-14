
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdvancedRateLimit } from '@/hooks/useAdvancedRateLimit';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';

export function RateLimitMonitor() {
  const authRateLimit = useAdvancedRateLimit('auth', {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
    blockDurationMs: 300000 // 5 minutes
  });

  const apiRateLimit = useAdvancedRateLimit('api', {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    blockDurationMs: 60000 // 1 minute
  });

  const uploadRateLimit = useAdvancedRateLimit('upload', {
    maxRequests: 10,
    windowMs: 300000, // 5 minutes
    blockDurationMs: 600000 // 10 minutes
  });

  const rateLimits = [
    {
      name: 'Autenticação',
      key: 'auth',
      limit: authRateLimit,
      icon: <Shield className="h-4 w-4" />,
      description: 'Tentativas de login e registro'
    },
    {
      name: 'API Geral',
      key: 'api',
      limit: apiRateLimit,
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Requisições gerais da API'
    },
    {
      name: 'Upload de Arquivos',
      key: 'upload',
      limit: uploadRateLimit,
      icon: <RefreshCw className="h-4 w-4" />,
      description: 'Upload de imagens e documentos'
    }
  ];

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Monitor de Rate Limiting</h2>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </div>

      {/* Global Alert for Blocked Users */}
      {rateLimits.some(rl => rl.limit.isBlocked) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Atenção: Alguns serviços estão temporariamente bloqueados devido ao rate limiting.
            Aguarde ou entre em contato com o suporte se necessário.
          </AlertDescription>
        </Alert>
      )}

      {/* Rate Limit Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {rateLimits.map((rateLimit) => (
          <Card key={rateLimit.key} className={rateLimit.limit.isBlocked ? 'border-red-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {rateLimit.icon}
                  <span className="ml-2">{rateLimit.name}</span>
                </div>
                <Badge variant={rateLimit.limit.isBlocked ? 'destructive' : 'default'}>
                  {rateLimit.limit.isBlocked ? 'Bloqueado' : 'Ativo'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {rateLimit.description}
              </p>

              {/* Request Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Requisições Restantes</span>
                  <span className="font-medium">
                    {rateLimit.limit.remainingRequests}/{rateLimit.limit.maxRequests}
                  </span>
                </div>
                <Progress 
                  value={(rateLimit.limit.remainingRequests / rateLimit.limit.maxRequests) * 100}
                  className="h-2"
                />
              </div>

              {/* Window Duration */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Janela de Tempo</span>
                <span>{formatTime(rateLimit.limit.windowMs)}</span>
              </div>

              {/* Block Status */}
              {rateLimit.limit.isBlocked && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Bloqueado por mais {formatTime(rateLimit.limit.remainingTime)}
                    </span>
                  </div>
                </div>
              )}

              {/* Warning for Low Remaining Requests */}
              {!rateLimit.limit.isBlocked && rateLimit.limit.remainingRequests <= 2 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Poucas requisições restantes
                    </span>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={rateLimit.limit.reset}
                className="w-full"
                disabled={rateLimit.limit.remainingRequests === rateLimit.limit.maxRequests}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar Limite
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Limit Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Resumo do Rate Limiting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total de Serviços</p>
              <p className="text-2xl font-bold">{rateLimits.length}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Serviços Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">
                {rateLimits.filter(rl => rl.limit.isBlocked).length}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Serviços com Aviso</p>
              <p className="text-2xl font-bold text-yellow-600">
                {rateLimits.filter(rl => !rl.limit.isBlocked && rl.limit.remainingRequests <= 2).length}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Serviços Normais</p>
              <p className="text-2xl font-bold text-green-600">
                {rateLimits.filter(rl => !rl.limit.isBlocked && rl.limit.remainingRequests > 2).length}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Como Funciona o Rate Limiting</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Cada serviço tem um limite de requisições por janela de tempo</li>
              <li>• Quando o limite é excedido, o serviço fica temporariamente bloqueado</li>
              <li>• O bloqueio é automaticamente removido após o período configurado</li>
              <li>• Administradores podem resetar limites manualmente se necessário</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
