
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Search, Plus, Loader2 } from 'lucide-react';
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

export default function GruposEnvio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [sendGroupIds, setSendGroupIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const { connectionStatus } = useWhatsAppConnection();

  // Fetch all groups and send groups
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

        // Fetch send groups
        const sendResponse = await fetch(`${API_BASE_URL}/send`);
        if (!sendResponse.ok) {
          throw new Error('Falha ao carregar grupos de envio');
        }
        const sendData = await sendResponse.json();

        setGroups(groupsData.groups || []);
        setSendGroupIds(sendData.send || []);
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

  const handleAddToSend = async (groupId: string) => {
    setIsProcessing(prev => ({ ...prev, [groupId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar grupo de envio');
      }

      const data = await response.json();
      setSendGroupIds(data.send);
      toast.success('Grupo adicionado à lista de envio');
    } catch (error) {
      console.error('Error adding send group:', error);
      toast.error('Erro ao adicionar grupo de envio');
    } finally {
      setIsProcessing(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleRemoveFromSend = async (groupId: string) => {
    setIsProcessing(prev => ({ ...prev, [groupId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/send/${groupId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Falha ao remover grupo de envio');
      }

      const data = await response.json();
      setSendGroupIds(data.send);
      toast.success('Grupo removido da lista de envio');
    } catch (error) {
      console.error('Error removing send group:', error);
      toast.error('Erro ao remover grupo de envio');
    } finally {
      setIsProcessing(prev => ({ ...prev, [groupId]: false }));
    }
  };

  if (connectionStatus !== 'connected') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Grupos de Envio</h1>
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
        <h1 className="text-3xl font-bold">Grupos de Envio</h1>
      </div>
      
      <Card className="dashboard-card">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar grupos de envio..."
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
                    const isInSendList = sendGroupIds.includes(group.id);
                    return (
                      <TableRow key={group.id}>
                        <TableCell>{group.name}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isInSendList
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            {isInSendList ? 'Grupo de Envio' : 'Normal'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {isInSendList ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFromSend(group.id)}
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
                                onClick={() => handleAddToSend(group.id)}
                                disabled={isProcessing[group.id]}
                              >
                                {isProcessing[group.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Plus size={16} className="mr-1" />
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
      
      <Card className="p-6 dashboard-card">
        <h3 className="font-medium mb-3">Estatísticas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Total de Grupos</div>
            <div className="text-2xl font-bold mt-1">{groups.length}</div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Grupos de Envio</div>
            <div className="text-2xl font-bold mt-1">{sendGroupIds.length}</div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Porcentagem Selecionada</div>
            <div className="text-2xl font-bold mt-1">
              {groups.length > 0 ? Math.round((sendGroupIds.length / groups.length) * 100) : 0}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
