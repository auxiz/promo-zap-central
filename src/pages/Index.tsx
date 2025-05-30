
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWhatsAppStatus } from '@/hooks/whatsapp/useWhatsAppStatus';
import StatusCard from '@/components/dashboard/StatusCard';
import ConnectionStatusCard from '@/components/dashboard/ConnectionStatusCard';
import ConnectionStatsCard from '@/components/dashboard/ConnectionStatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import InfoCard from '@/components/dashboard/InfoCard';
import { useEffect } from 'react';

const Index = () => {
  const {
    isLoading,
    monitoredGroups,
    sendGroups,
    recentActivity,
    getTodayConversions,
    fetchData
  } = useDashboardData();

  const {
    isStatusLoading,
    whatsappStatus,
    metricsData,
    fetchWhatsappStatus,
    fetchMetrics,
    handleCheckStatus
  } = useWhatsAppStatus();

  // Count today's conversions
  const todayConversions = getTodayConversions();
  const totalConversions = recentActivity.filter(e => e.type === 'converted').length;
  
  // Fetch metrics on load
  useEffect(() => {
    if (whatsappStatus.connected) {
      fetchMetrics();
    }
  }, [whatsappStatus.connected, fetchMetrics]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <Button 
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={fetchData}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          <div className="w-full max-w-full">
            <StatusCard 
              title="Grupos Monitorados" 
              value={monitoredGroups.total} 
              subtitle="Total de grupos"
              badge={{ text: `${monitoredGroups.active} Ativos` }}
            />
          </div>
          
          <div className="w-full max-w-full">
            <StatusCard 
              title="Grupos de Envio" 
              value={sendGroups.total} 
              subtitle="Total de grupos"
              badge={{ text: `${sendGroups.active} Ativos` }}
            />
          </div>
          
          <div className="w-full max-w-full">
            <StatusCard 
              title="Links Gerados" 
              value={todayConversions} 
              subtitle={todayConversions > 0 && totalConversions > 0
                ? `${Math.round(todayConversions / totalConversions * 100)}% do total` 
                : 'Nenhuma conversão hoje'}
              badge={{ text: 'Hoje' }}
            />
          </div>
          
          <div className="w-full max-w-full">
            {metricsData ? (
              <ConnectionStatsCard
                metrics={metricsData}
                connected={whatsappStatus.connected}
                since={whatsappStatus.since}
                isLoading={isStatusLoading}
              />
            ) : (
              <ConnectionStatusCard 
                connected={whatsappStatus.connected}
                device={whatsappStatus.device}
                since={whatsappStatus.since}
                isStatusLoading={isStatusLoading}
                onCheckStatus={handleCheckStatus}
              />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          <div className="lg:col-span-2 w-full max-w-full">
            <RecentActivity events={recentActivity} />
          </div>
          <div className="w-full max-w-full">
            <InfoCard totalLinks={totalConversions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
