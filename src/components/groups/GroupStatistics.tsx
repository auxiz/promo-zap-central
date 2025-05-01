
import React from 'react';
import { Card } from '@/components/ui/card';

interface GroupStatisticsProps {
  totalGroups: number;
  selectedGroups: number;
  groupTypeLabel: string;
}

export default function GroupStatistics({ 
  totalGroups, 
  selectedGroups, 
  groupTypeLabel 
}: GroupStatisticsProps) {
  return (
    <Card className="p-6 dashboard-card">
      <h3 className="font-medium mb-3">Estatísticas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-md">
          <div className="text-sm text-muted-foreground">Total de Grupos</div>
          <div className="text-2xl font-bold mt-1">{totalGroups}</div>
        </div>
        <div className="p-4 border rounded-md">
          <div className="text-sm text-muted-foreground">{groupTypeLabel}</div>
          <div className="text-2xl font-bold mt-1">{selectedGroups}</div>
        </div>
        <div className="p-4 border rounded-md">
          <div className="text-sm text-muted-foreground">Porcentagem Selecionada</div>
          <div className="text-2xl font-bold mt-1">
            {totalGroups > 0 ? Math.round((selectedGroups / totalGroups) * 100) : 0}%
          </div>
        </div>
      </div>
    </Card>
  );
}
