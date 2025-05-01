
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, X } from 'lucide-react';

// Mock data
const mockGroups = [
  { id: 1, name: 'Ofertas Amazon Brasil', messageCount: 154, lastSent: '01/05/2025 10:35' },
  { id: 2, name: 'Descontos Shopee Oficial', messageCount: 89, lastSent: '01/05/2025 09:12' },
  { id: 3, name: 'Cupons Magalu', messageCount: 56, lastSent: '30/04/2025 22:45' },
  { id: 4, name: 'Clube de Descontos', messageCount: 42, lastSent: '30/04/2025 18:30' },
  { id: 5, name: 'Promoções Relâmpago', messageCount: 122, lastSent: '01/05/2025 08:15' },
];

export default function GruposEnvio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState(mockGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeGroup = (id: number) => {
    setGroups(groups.filter(group => group.id !== id));
  };

  const addGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: Math.max(...groups.map(g => g.id)) + 1,
        name: newGroupName.trim(),
        messageCount: 0,
        lastSent: '—'
      };
      
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grupos de Envio</h1>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} className="inline mr-1" />
          Adicionar Grupo
        </button>
      </div>
      
      {showAddForm && (
        <Card className="p-4 dashboard-card">
          <h3 className="font-medium mb-3">Adicionar Novo Grupo</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do grupo"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-1"
            />
            <button 
              onClick={addGroup}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-700 transition-colors"
            >
              Adicionar
            </button>
            <button 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors"
            >
              Cancelar
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Nota: O grupo deve estar na sua lista de contatos do WhatsApp.
          </p>
        </Card>
      )}
      
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nome do Grupo</th>
                  <th className="text-center py-3 px-4 font-medium">Mensagens Enviadas</th>
                  <th className="text-center py-3 px-4 font-medium">Último Envio</th>
                  <th className="text-center py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4">{group.name}</td>
                    <td className="py-3 px-4 text-center">{group.messageCount}</td>
                    <td className="py-3 px-4 text-center">{group.lastSent}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
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
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      Nenhum grupo encontrado com esse termo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
            <div className="text-sm text-muted-foreground">Mensagens Enviadas (Hoje)</div>
            <div className="text-2xl font-bold mt-1">42</div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Mensagens Enviadas (Total)</div>
            <div className="text-2xl font-bold mt-1">{groups.reduce((sum, group) => sum + group.messageCount, 0)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
