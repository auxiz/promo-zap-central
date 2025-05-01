
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, X, Search } from 'lucide-react';

// Mock data
const mockGroups = [
  { id: 1, name: 'Promoções Amazon Oficial', status: 'active', memberCount: 142, lastMessage: 'Há 5 minutos' },
  { id: 2, name: 'Ofertas Shopee BR', status: 'active', memberCount: 89, lastMessage: 'Há 20 minutos' },
  { id: 3, name: 'Compartilhamento de Cupons Magalu', status: 'active', memberCount: 56, lastMessage: 'Há 1 hora' },
  { id: 4, name: 'Descontos Incríveis Natura', status: 'paused', memberCount: 75, lastMessage: 'Há 3 horas' },
  { id: 5, name: 'Grupo de Ofertas Relâmpago', status: 'active', memberCount: 122, lastMessage: 'Há 30 minutos' },
  { id: 6, name: 'Cupons Secretos Amazon', status: 'active', memberCount: 61, lastMessage: 'Há 2 horas' },
  { id: 7, name: 'Grupo de Testes', status: 'paused', memberCount: 3, lastMessage: 'Há 1 dia' },
];

export default function GruposMonitorados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState(mockGroups);

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleGroupStatus = (id: number) => {
    setGroups(groups.map(group => 
      group.id === id 
        ? { ...group, status: group.status === 'active' ? 'paused' : 'active' } 
        : group
    ));
  };

  const removeGroup = (id: number) => {
    setGroups(groups.filter(group => group.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grupos Monitorados</h1>
        
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-700 transition-colors">
          Adicionar Grupo
        </button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nome do Grupo</th>
                  <th className="text-center py-3 px-4 font-medium">Membros</th>
                  <th className="text-center py-3 px-4 font-medium">Última Mensagem</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-center py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4">{group.name}</td>
                    <td className="py-3 px-4 text-center">{group.memberCount}</td>
                    <td className="py-3 px-4 text-center">{group.lastMessage}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      }`}>
                        {group.status === 'active' ? 'Ativo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toggleGroupStatus(group.id)}
                          className={`p-1.5 rounded-md ${
                            group.status === 'active'
                              ? 'text-yellow-500 hover:bg-yellow-500/10'
                              : 'text-green-500 hover:bg-green-500/10'
                          }`}
                          title={group.status === 'active' ? 'Pausar' : 'Ativar'}
                        >
                          {group.status === 'active' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="6" y="4" width="4" height="16"></rect>
                              <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                          ) : (
                            <Check size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => removeGroup(group.id)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md"
                          title="Remover"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredGroups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      Nenhum grupo encontrado com esse termo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
