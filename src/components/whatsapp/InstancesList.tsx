
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface InstancesListProps {
  instances: { id: string; name: string }[];
  currentInstance: string;
  handleInstanceSwitch: (instanceId: string) => void;
  openDeleteDialog: (instance: { id: string; name: string }) => void;
}

const InstancesList = ({ 
  instances, 
  currentInstance, 
  handleInstanceSwitch, 
  openDeleteDialog 
}: InstancesListProps) => {
  if (instances.length <= 1) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-4">
        <CardTitle className="text-md">Instâncias WhatsApp</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-2 p-4">
          {instances.map(instance => (
            <div key={instance.id} className="flex items-center gap-1">
              <Button
                variant={currentInstance === instance.id ? "default" : "outline"}
                onClick={() => handleInstanceSwitch(instance.id)}
                className="text-sm"
              >
                {instance.name}
              </Button>
              
              {/* Não permitir excluir a instância principal */}
              {instance.id !== 'default' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDeleteDialog(instance)}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstancesList;
