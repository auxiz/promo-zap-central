
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { RefreshCw } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWhatsAppStatus } from '@/hooks/whatsapp/useWhatsAppStatus';
import StatusCard from '@/components/dashboard/StatusCard';
import ConnectionStatusCard from '@/components/dashboard/ConnectionStatusCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import InfoCard from '@/components/dashboard/InfoCard';

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
    handleCheckStatus
  } = useWhatsAppStatus();

  // Count today's conversions
  const todayConversions = getTodayConversions();
  const totalConversions = recentActivity.filter(e => e.type === 'converted').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button 
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={fetchData}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard 
          title="Grupos Monitorados" 
          value={monitoredGroups.total} 
          subtitle="Total de grupos"
          badge={{ text: `${monitoredGroups.active} Ativos` }}
        />
        
        <StatusCard 
          title="Grupos de Envio" 
          value={sendGroups.total} 
          subtitle="Total de grupos"
          badge={{ text: `${sendGroups.active} Ativos` }}
        />
        
        <StatusCard 
          title="Links Gerados" 
          value={todayConversions} 
          subtitle={todayConversions > 0 && totalConversions > 0
            ? `${Math.round(todayConversions / totalConversions * 100)}% do total` 
            : 'Nenhuma conversão hoje'}
          badge={{ text: 'Hoje' }}
        />
        
        <ConnectionStatusCard 
          connected={whatsappStatus.connected}
          device={whatsappStatus.device}
          since={whatsappStatus.since}
          isStatusLoading={isStatusLoading}
          onCheckStatus={handleCheckStatus}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity events={recentActivity} />
        <InfoCard totalLinks={totalConversions} />
      </div>
    </div>
  );
};

export default Index;
