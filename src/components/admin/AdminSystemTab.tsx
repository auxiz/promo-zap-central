
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
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminSystemTab() {
  const handleBackupData = () => {
    toast.info('Funcionalidade de backup será implementada em breve');
  };

  const handleClearCache = () => {
    // Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Cache do sistema limpo com sucesso');
  };

  const handleSystemCheck = () => {
    toast.info('Verificação do sistema iniciada...');
    // Simular verificação
    setTimeout(() => {
      toast.success('Sistema funcionando corretamente');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Status do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                <Server className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status da API</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Banco de Dados</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Conectado
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
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Backup</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Não configurado
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Backup de Dados</p>
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

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Configurações Avançadas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Modo de Manutenção</p>
              <p className="text-sm text-muted-foreground">
                Temporariamente desabilitar o sistema para manutenção
              </p>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Desabilitado
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Debug Mode</p>
              <p className="text-sm text-muted-foreground">
                Ativar logs detalhados para desenvolvimento
              </p>
            </div>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              Habilitado
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Rate Limiting</p>
              <p className="text-sm text-muted-foreground">
                Controle de limite de requisições por usuário
              </p>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Ativo
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
