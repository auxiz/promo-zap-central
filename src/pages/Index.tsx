
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Grupos Monitorados</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">15 Ativos</span>
          </div>
          <div className="text-3xl font-bold">25</div>
          <div className="text-sm text-muted-foreground mt-1">Total de grupos</div>
        </Card>
        
        <Card className="p-6 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Grupos de Envio</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">12 Ativos</span>
          </div>
          <div className="text-3xl font-bold">18</div>
          <div className="text-sm text-muted-foreground mt-1">Total de grupos</div>
        </Card>
        
        <Card className="p-6 dashboard-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Links Gerados</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Hoje</span>
          </div>
          <div className="text-3xl font-bold">124</div>
          <div className="text-sm text-muted-foreground mt-1">+15% em relação a ontem</div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 dashboard-card">
          <div className="border-b p-4 font-medium">Atividade Recente</div>
          <div className="p-4">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                      <path d="M3 9h18"></path>
                      <path d="M9 21V9"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm">Novo link convertido: <span className="font-medium">Produto {i}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Há {i * 5} minutos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <div className="border-b p-4 font-medium">Status da Conexão</div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">WhatsApp Conectado</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Dispositivo: Samsung Galaxy S21</p>
              <p>Conectado desde: 01/05 às 08:35</p>
            </div>
            <div className="mt-4">
              <button className="w-full bg-primary hover:bg-primary-700 text-white py-2 rounded-md transition-colors">
                Verificar Status
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
