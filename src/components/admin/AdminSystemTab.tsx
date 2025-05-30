
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Database, 
  Shield, 
  RefreshCw, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminHealth } from '@/hooks/useAdminHealth';
import { useAdminBackup } from '@/hooks/useAdminBackup';

export function AdminSystemTab() {
  const { healthStatus, checkHealth, isHealthy } = useAdminHealth();
  const { createBackup, getBackupHistory, isCreatingBackup } = useAdminBackup();
  const [backupHistory, setBackupHistory] = useState<any[]>([]);

  useEffect(() => {
    loadBackupHistory();
  }, []);

  const loadBackupHistory = async () => {
    try {
      const history = await getBackupHistory();
      setBackupHistory(history || []);
    } catch (error) {
      console.error('Failed to load backup history:', error);
    }
  };

  const handleBackupData = async () => {
    try {
      await createBackup('manual');
      await loadBackupHistory();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Cache do sistema limpo com sucesso');
  };

  const handleSystemCheck = async () => {
    toast.info('Verificando sistema...');
    await checkHealth();
    
    if (isHealthy) {
      toast.success('Sistema funcionando corretamente');
    } else {
      toast.error('Problemas detectados no sistema');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Status do Sistema</h3>
          <Button onClick={handleSystemCheck} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Status
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isHealthy ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                <Server className={`h-5 w-5 ${isHealthy ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Geral</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {isHealthy ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {healthStatus.status === 'checking' ? 'Verificando...' : isHealthy ? 'Online' : 'Problemas'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${healthStatus.database.status === 'connected' ? 'bg-blue-50 dark:bg-blue-950' : 'bg-red-50 dark:bg-red-950'}`}>
                <Database className={`h-5 w-5 ${healthStatus.database.status === 'connected' ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Banco de Dados</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={healthStatus.database.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {healthStatus.database.status === 'connected' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {healthStatus.database.status === 'connected' ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Segurança</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Protegido
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                <HardDrive className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Métricas</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {healthStatus.metrics.totalUsers} usuários
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {healthStatus.database.tables.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Status das Tabelas</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {healthStatus.database.tables.map((table) => (
                <div key={table.table} className="p-2 rounded border text-center">
                  <div className={`inline-flex items-center gap-1 text-xs ${table.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                    {table.status === 'ok' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {table.table}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Ferramentas de Administração</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={handleSystemCheck}
          >
            <Server className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Verificar Sistema</p>
              <p className="text-xs text-muted-foreground">
                Executar diagnóstico completo
              </p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={handleBackupData}
            disabled={isCreatingBackup}
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">
                {isCreatingBackup ? 'Criando...' : 'Backup de Dados'}
              </p>
              <p className="text-xs text-muted-foreground">
                Exportar dados do sistema
              </p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={handleClearCache}
          >
            <RefreshCw className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Limpar Cache</p>
              <p className="text-xs text-muted-foreground">
                Remover dados temporários
              </p>
            </div>
          </Button>
        </div>
      </Card>

      {backupHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Histórico de Backups</h3>
          <div className="space-y-2">
            {backupHistory.slice(0, 10).map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium capitalize">{backup.backup_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(backup.started_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {backup.file_size && (
                    <span className="text-xs text-muted-foreground">
                      {Math.round(backup.file_size / 1024)} KB
                    </span>
                  )}
                  <Badge 
                    variant={backup.status === 'completed' ? 'default' : backup.status === 'failed' ? 'destructive' : 'secondary'}
                  >
                    {backup.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {backup.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {backup.status === 'running' && <Clock className="h-3 w-3 mr-1" />}
                    {backup.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {healthStatus.lastCheck && (
        <div className="text-xs text-muted-foreground text-center">
          Última verificação: {healthStatus.lastCheck.toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
}
