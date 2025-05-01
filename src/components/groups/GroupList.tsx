
import React from 'react';
import { Search, Loader2, Check, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from '@/components/ui/card';
import { Group } from '@/hooks/useGroupManagement';

interface GroupListProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredGroups: Group[];
  selectedGroupIds: string[];
  isLoading: boolean;
  isProcessing: Record<string, boolean>;
  onAddGroup: (groupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  groupType: string;
  selectedLabel: string;
  unselectedLabel: string;
  addButtonIcon?: React.ReactNode;
}

export default function GroupList({
  searchTerm,
  onSearchChange,
  filteredGroups,
  selectedGroupIds,
  isLoading,
  isProcessing,
  onAddGroup,
  onRemoveGroup,
  groupType,
  selectedLabel,
  unselectedLabel,
  addButtonIcon = <Plus size={16} className="mr-1" />
}: GroupListProps) {
  return (
    <Card className="dashboard-card">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder={`Buscar ${groupType.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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
                    {filteredGroups.length === 0 
                      ? 'Nenhum grupo disponível' 
                      : 'Nenhum grupo encontrado com esse termo de pesquisa'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = selectedGroupIds.includes(group.id);
                  return (
                    <TableRow key={group.id}>
                      <TableCell>{group.name}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isSelected
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        }`}>
                          {isSelected ? selectedLabel : unselectedLabel}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {isSelected ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onRemoveGroup(group.id)}
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
                              onClick={() => onAddGroup(group.id)}
                              disabled={isProcessing[group.id]}
                            >
                              {isProcessing[group.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                addButtonIcon
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
  );
}
