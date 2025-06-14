
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { BarChart3, Clock, Eye, MousePointer } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { pageViews, events, sessionDuration } = useAnalytics();

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTopPages = () => {
    const pageCounts = pageViews.reduce((acc, view) => {
      acc[view.path] = (acc[view.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getRecentEvents = () => {
    return events
      .filter(event => event.event !== 'session_heartbeat')
      .slice(-10)
      .reverse();
  };

  const totalInteractions = events.filter(e => e.event === 'user_interaction').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo de Sessão</p>
              <p className="text-2xl font-bold">{formatDuration(sessionDuration)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Páginas Visitadas</p>
              <p className="text-2xl font-bold">{pageViews.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
              <MousePointer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interações</p>
              <p className="text-2xl font-bold">{totalInteractions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950">
              <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Eventos</p>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Páginas Mais Visitadas</h3>
          <div className="space-y-3">
            {getTopPages().map(([path, count]) => (
              <div key={path} className="flex items-center justify-between">
                <span className="text-sm font-medium">{path}</span>
                <Badge variant="secondary">{count} visualizações</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Eventos Recentes</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {getRecentEvents().map((event, index) => (
              <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                <div className="font-medium">{event.event}</div>
                <div className="text-muted-foreground text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
