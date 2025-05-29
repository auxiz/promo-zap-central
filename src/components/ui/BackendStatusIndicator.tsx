
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServerCrash, Server, RefreshCw } from 'lucide-react';
import { useBackendHealth } from '@/hooks/useBackendHealth';

export function BackendStatusIndicator() {
  const { isOnline, isChecking, lastCheck, error, checkHealth } = useBackendHealth();

  if (isOnline) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
        <Server size={12} className="mr-1" />
        Backend Online
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <ServerCrash size={12} className="mr-1" />
        Backend Offline
      </Badge>
      <Button
        onClick={checkHealth}
        disabled={isChecking}
        size="sm"
        variant="outline"
        className="h-6 px-2 py-0 text-xs"
      >
        {isChecking ? (
          <RefreshCw size={10} className="animate-spin" />
        ) : (
          'Tentar Novamente'
        )}
      </Button>
    </div>
  );
}
