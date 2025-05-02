
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Activity, RefreshCw } from 'lucide-react';

// Replace with your actual VPS IPv4 address and port
const API_BASE = 'http://168.231.98.177:4000';

interface WhatsAppStatus {
  connected: boolean;
  device: string;
  since: number | null;
  status: string;
}

interface GroupCount {
  total: number;
  active: number;
}

interface ActivityEvent {
  type: string;
  title: string;
  timestamp: number;
}

const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp) return '--';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' às ' + date.toLocaleTimeString().substring(0, 5);
};

const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds} segundos atrás`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas atrás`;
  return `${Math.floor(seconds / 86400)} dias atrás`;
};

const isToday = (timestamp: number): boolean => {
  const today = new Date().setHours(0, 0, 0, 0);
  const date = new Date(timestamp).setHours(0, 0, 0, 0);
  return today === date;
};

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({
    connected: false,
    device: '',
    since: null,
    status: 'DISCONNECTED'
  });
  const [monitoredGroups, setMonitoredGroups] = useState<GroupCount>({ total: 0, active: 0 });
  const [sendGroups, setSendGroups] = useState<GroupCount>({ total: 0, active: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);

  // Fetch all data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      await Promise.all([
        fetchWhatsappStatus(),
        fetchMonitoredGroups(),
        fetchSendGroups(),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível atualizar o dashboard. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWhatsappStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/status`);
      if (response.ok) {
        const data = await response.json();
        setWhatsappStatus(data);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
    }
  };

  const fetchMonitoredGroups = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/monitored/count`);
      if (response.ok) {
        const data = await response.json();
        setMonitoredGroups(data);
      }
    } catch (error) {
      console.error('Error fetching monitored groups count:', error);
    }
  };

  const fetchSendGroups = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/send/count`);
      if (response.ok) {
        const data = await response.json();
        setSendGroups(data);
      }
    } catch (error) {
      console.error('Error fetching send groups count:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/activity/recent`);
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.events);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  // Count today's conversions
  const todayConversions = recentActivity.filter(
    event => event.type === 'converted' && isToday(event.timestamp)
  ).length;

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
        <Card className="p-6 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Grupos Monitorados</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{monitoredGroups.active} Ativos</span>
          </div>
          <div className="text-3xl font-bold">{monitoredGroups.total}</div>
          <div className="text-sm text-muted-foreground mt-1">Total de grupos</div>
        </Card>
        
        <Card className="p-6 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Grupos de Envio</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{sendGroups.active} Ativos</span>
          </div>
          <div className="text-3xl font-bold">{sendGroups.total}</div>
          <div className="text-sm text-muted-foreground mt-1">Total de grupos</div>
        </Card>
        
        <Card className="p-6 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Links Gerados</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Hoje</span>
          </div>
          <div className="text-3xl font-bold">{todayConversions}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {todayConversions > 0 ? `${Math.round(todayConversions / recentActivity.filter(e => e.type === 'converted').length * 100)}% do total` : 'Nenhuma conversão hoje'}
          </div>
        </Card>
        
        <Card className="p-6 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Status da Conexão</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${whatsappStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs">{whatsappStatus.connected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-medium">{whatsappStatus.device ? `Dispositivo: ${whatsappStatus.device}` : 'Não conectado'}</p>
            <p className="text-muted-foreground mt-1">
              {whatsappStatus.since ? `Desde: ${formatTimestamp(whatsappStatus.since)}` : 'Conecte o WhatsApp para começar'}
            </p>
          </div>
          <div className="mt-4">
            <Button 
              onClick={fetchWhatsappStatus} 
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              Verificar Status
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 dashboard-card">
          <div className="border-b p-4 font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividade Recente
          </div>
          <div className="p-4">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((event, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <path d="M3 9h18"></path>
                        <path d="M9 21V9"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm">
                        {event.type === 'converted' ? 'Novo link convertido: ' : ''} 
                        <span className="font-medium">{event.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getTimeAgo(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma atividade recente
              </div>
            )}
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <div className="border-b p-4 font-medium">Informações</div>
          <div className="p-4">
            <div className="space-y-4 text-sm">
              <p>
                O PromoZap monitora automaticamente os links de produtos da Shopee 
                em grupos do WhatsApp e os converte para links de afiliado.
              </p>
              
              <div className="flex flex-col gap-2 mt-4">
                <h4 className="font-medium">Links processados</h4>
                <div className="text-2xl font-bold">{recentActivity.filter(e => e.type === 'converted').length}</div>
                <div className="text-xs text-muted-foreground">Total de conversões</div>
              </div>
              
              <div className="mt-4">
                <Button className="w-full" asChild>
                  <a href="/whatsapp-conexao">Gerenciar Conexão</a>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
