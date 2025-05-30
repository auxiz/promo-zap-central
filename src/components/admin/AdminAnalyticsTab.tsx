
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Smartphone, 
  MessageSquare, 
  Activity,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStats {
  totalUsers: number;
  totalWhatsAppInstances: number;
  activeInstances: number;
  totalGroups: number;
  totalTemplates: number;
  recentActivity: number;
}

export function AdminAnalyticsTab() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalWhatsAppInstances: 0,
    activeInstances: 0,
    totalGroups: 0,
    totalTemplates: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchSystemStats = async () => {
    try {
      // Total de usuários
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total de instâncias WhatsApp
      const { count: instancesCount } = await supabase
        .from('user_whatsapp_instances')
        .select('*', { count: 'exact', head: true });

      // Instâncias ativas
      const { count: activeInstancesCount } = await supabase
        .from('user_whatsapp_instances')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Total de grupos
      const { count: groupsCount } = await supabase
        .from('user_groups')
        .select('*', { count: 'exact', head: true });

      // Total de templates
      const { count: templatesCount } = await supabase
        .from('user_templates')
        .select('*', { count: 'exact', head: true });

      // Atividade recente (últimas 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentActivityCount } = await supabase
        .from('user_activity')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      setStats({
        totalUsers: usersCount || 0,
        totalWhatsAppInstances: instancesCount || 0,
        activeInstances: activeInstancesCount || 0,
        totalGroups: groupsCount || 0,
        totalTemplates: templatesCount || 0,
        recentActivity: recentActivityCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Instâncias WhatsApp',
      value: stats.totalWhatsAppInstances,
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Instâncias Ativas',
      value: stats.activeInstances,
      icon: Activity,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950'
    },
    {
      title: 'Grupos Monitorados',
      value: stats.totalGroups,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Templates Criados',
      value: stats.totalTemplates,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950'
    },
    {
      title: 'Atividade (24h)',
      value: stats.recentActivity,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950'
    }
  ];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Estatísticas do Sistema</h3>
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

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Resumo de Performance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Taxa de Instâncias Ativas</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalWhatsAppInstances > 0 ? (stats.activeInstances / stats.totalWhatsAppInstances) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <Badge variant="secondary">
                {stats.totalWhatsAppInstances > 0 ? 
                  Math.round((stats.activeInstances / stats.totalWhatsAppInstances) * 100) : 0
                }%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Usuários com Templates</span>
            <Badge variant="outline">
              {stats.totalTemplates} templates criados
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>Atividade do Sistema</span>
            <Badge variant={stats.recentActivity > 10 ? "default" : "secondary"}>
              {stats.recentActivity > 10 ? "Alta" : "Normal"}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
