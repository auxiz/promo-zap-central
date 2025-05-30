
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Smartphone, 
  MessageSquare, 
  Activity,
  TrendingUp,
  Calendar,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminAnalyticsTab() {
  const [timeframe, setTimeframe] = useState('24h');
  const { analytics, loading, error, refetch } = useAdminAnalytics(timeframe);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-red-500">Erro ao carregar analytics: {error}</p>
          <Button onClick={refetch} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  if (!analytics) return null;

  const statCards = [
    {
      title: 'Total de Usuários',
      value: analytics.overview.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Instâncias WhatsApp',
      value: analytics.overview.totalInstances,
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Instâncias Ativas',
      value: analytics.overview.activeInstances,
      icon: Activity,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950'
    },
    {
      title: 'Grupos Monitorados',
      value: analytics.overview.totalGroups,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Templates Criados',
      value: analytics.overview.totalTemplates,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950'
    },
    {
      title: `Atividade (${timeframe})`,
      value: analytics.overview.recentActivity,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Estatísticas do Sistema</h3>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Performance do Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Taxa de Instâncias Ativas</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analytics.performance.instanceUtilization}%` }}
                  ></div>
                </div>
                <Badge variant="secondary">
                  {analytics.performance.instanceUtilization}%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Adoção de Templates</span>
              <Badge variant="outline">
                {analytics.performance.templatesAdoption}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Grupos por Usuário</span>
              <Badge variant="outline">
                {analytics.performance.averageGroupsPerUser} média
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Atividade Diária</h3>
          <div className="space-y-2">
            {Object.entries(analytics.trends.dailyActivity).slice(-7).map(([date, count]) => (
              <div key={date} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{date}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((count / Math.max(...Object.values(analytics.trends.dailyActivity))) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {analytics.errors.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4 text-red-600">Erros Recentes</h3>
          <div className="space-y-2">
            {analytics.errors.slice(0, 5).map((error, index) => (
              <div key={index} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{error.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(error.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                {error.context && (
                  <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Última atualização: {new Date(analytics.lastUpdated).toLocaleString('pt-BR')}
      </div>
    </div>
  );
}
