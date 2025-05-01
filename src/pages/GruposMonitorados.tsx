
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Search, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useWhatsAppConnection from '@/hooks/useWhatsAppConnection';

// API endpoint base URL from the hook
const API_BASE = 'http://168.231.98.177:4000';
const API_BASE_URL = `${API_BASE}/api/whatsapp`;

interface Group {
  id: string;
  name: string;
}

export default function GruposMonitorados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [monitoredIds, setMonitoredIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const { connectionStatus } = useWhatsAppConnection();

  // Fetch all groups and monitored groups
  useEffect(() => {
    const fetchData = async () => {
      if (connectionStatus !== 'connected') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all groups
        const groupsResponse = await fetch(`${API_BASE_URL}/groups`);
        if (!groupsResponse.ok) {
          throw new Error('Falha ao carregar grupos');
        }
        const groupsData = await groupsResponse.json();

        // Fetch monitored groups
        const monitoredResponse = await fetch(`${API_BASE_URL}/monitored`);
        if (!monitoredResponse.ok) {
          throw new Error('Falha ao carregar grupos monitorados');
        }
        const monitoredData = await monitoredResponse.json();

        setGroups(groupsData.groups || []);
        setMonitoredIds(monitoredData.monitored || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Erro ao carregar dados dos grupos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [connectionStatus]);

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToMonitored = async (groupId: string) => {
    setIsProcessing(prev => ({ ...prev, [groupId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/monitored`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar grupo monitorado');
      }

      const data = await response.json();
      setMonitoredIds(data.monitored);
      toast.success('Grupo adicionado à lista de monitoramento');
    } catch (error) {
      console.error('Error adding monitored group:', error);
      toast.error('Erro ao adicionar grupo monitorado');
    } finally {
      setIsProcessing(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleRemoveFromMonitored = async (groupId: string) => {
    setIsProcessing(prev => ({ ...prev, [groupId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/monitored/${groupId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Falha ao remover grupo monitorado');
      }

      const data = await response.json();
      setMonitoredIds(data.monitored);
      toast.success('Grupo removido da lista de monitoramento');
    } catch (error) {
      console.error('Error removing monitored group:', error);
      toast.error('Erro ao remover grupo monitorado');
    } finally {
      setIsProcessing(prev => ({ ...prev, [groupId]: false }));
    }
  };

  if (connectionStatus !== 'connected') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Grupos Monitorados</h1>
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              WhatsApp não está conectado. Por favor, conecte o WhatsApp primeiro.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/whatsapp-conexao'}
              className="mt-4"
            >
              Ir para página de conexão
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grupos Monitorados</h1>
      </div>
      
      <Card className="dashboard-card">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando grupos...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Grupo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      {groups.length === 0 
                        ? 'Nenhum grupo disponível' 
                        : 'Nenhum grupo encontrado com esse termo de pesquisa'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => {
                    const isMonitored = monitoredIds.includes(group.id);
                    return (
                      <TableRow key={group.id}>
                        <TableCell>{group.name}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isMonitored
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            {isMonitored ? 'Monitorado' : 'Não Monitorado'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {isMonitored ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFromMonitored(group.id)}
                                disabled={isProcessing[group.id]}
                              >
                                {isProcessing[group.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <X size={16} className="mr-1" />
                                )}
                                Remover
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAddToMonitored(group.id)}
                                disabled={isProcessing[group.id]}
                              >
                                {isProcessing[group.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Check size={16} className="mr-1" />
                                )}
                                Adicionar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
