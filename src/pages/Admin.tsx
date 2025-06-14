
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, BarChart3, Activity, Zap, Shield } from 'lucide-react';
import AdminRoute from '@/components/admin/AdminRoute';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminSystemTab } from '@/components/admin/AdminSystemTab';
import { AdminAnalyticsTab } from '@/components/admin/AdminAnalyticsTab';
import { AdminActivityTab } from '@/components/admin/AdminActivityTab';
import { SystemMonitoringDashboard } from '@/components/admin/SystemMonitoringDashboard';
import { PerformanceOptimizationPanel } from '@/components/admin/PerformanceOptimizationPanel';
import { RateLimitMonitor } from '@/components/admin/RateLimitMonitor';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    {
      id: 'users',
      label: 'Usuários',
      icon: <Users className="h-4 w-4" />,
      content: <AdminUsersTab />
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: <Settings className="h-4 w-4" />,
      content: <AdminSystemTab />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      content: <AdminAnalyticsTab />
    },
    {
      id: 'activity',
      label: 'Atividade',
      icon: <Activity className="h-4 w-4" />,
      content: <AdminActivityTab />
    },
    {
      id: 'monitoring',
      label: 'Monitoramento',
      icon: <Activity className="h-4 w-4" />,
      content: <SystemMonitoringDashboard />
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <Zap className="h-4 w-4" />,
      content: <PerformanceOptimizationPanel />
    },
    {
      id: 'ratelimit',
      label: 'Rate Limiting',
      icon: <Shield className="h-4 w-4" />,
      content: <RateLimitMonitor />
    }
  ];

  return (
    <AdminRoute>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, sistema e monitore a performance da aplicação.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
}
