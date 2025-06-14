import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  BarChart3,
  Activity,
  Zap,
  Shield,
  TrendingUp,
  HardDrive
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSystemTab } from '@/components/admin/AdminSystemTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminAnalyticsTab } from '@/components/admin/AdminAnalyticsTab';
import { AdminActivityTab } from '@/components/admin/AdminActivityTab';

import { SystemMonitoringDashboard } from '@/components/admin/SystemMonitoringDashboard';
import { PerformanceOptimizationPanel } from '@/components/admin/PerformanceOptimizationPanel';
import { RateLimitMonitor } from '@/components/admin/RateLimitMonitor';
import { AdvancedAnalyticsPanel } from '@/components/admin/AdvancedAnalyticsPanel';
import { ResourceMonitoringPanel } from '@/components/admin/ResourceMonitoringPanel';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('system');

  useEffect(() => {
    // Optional: Persist tab selection in localStorage
    const storedTab = localStorage.getItem('admin-active-tab');
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);

  useEffect(() => {
    // Optional: Persist tab selection in localStorage
    localStorage.setItem('admin-active-tab', activeTab);
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system':
        return <AdminSystemTab />;
      case 'users':
        return <AdminUsersTab />;
      case 'analytics':
        return <AdminAnalyticsTab />;
      case 'activity':
        return <AdminActivityTab />;
      case 'monitoring':
        return <SystemMonitoringDashboard />;
      case 'performance':
        return <PerformanceOptimizationPanel />;
      case 'rate-limit':
        return <RateLimitMonitor />;
      case 'advanced-analytics':
        return <AdvancedAnalyticsPanel />;
      case 'resources':
        return <ResourceMonitoringPanel />;
      default:
        return <AdminSystemTab />;
    }
  };

  const tabs = [
    { id: 'system', label: 'Sistema', icon: Settings },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'activity', label: 'Atividade', icon: Activity },
    { id: 'monitoring', label: 'Monitoramento', icon: Activity },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'rate-limit', label: 'Rate Limiting', icon: Shield },
    { id: 'advanced-analytics', label: 'Analytics Avançado', icon: TrendingUp },
    { id: 'resources', label: 'Recursos', icon: HardDrive }
  ];

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Painel de Administração</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                {renderTabContent()}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
