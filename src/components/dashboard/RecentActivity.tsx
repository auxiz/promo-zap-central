
import React from 'react';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ActivityEvent {
  type: string;
  title: string;
  timestamp: number;
}

interface RecentActivityProps {
  events: ActivityEvent[];
}

const RecentActivity = ({ events }: RecentActivityProps) => {
  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} segundos atrás`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas atrás`;
    return `${Math.floor(seconds / 86400)} dias atrás`;
  };

  return (
    <Card className="col-span-1 lg:col-span-2 dashboard-card">
      <div className="border-b p-4 font-medium flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Atividade Recente
      </div>
      <div className="p-4">
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.slice(0, 5).map((event, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M3 9h18"></path>
                    <path d="M9 21V9"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm">
                    {event.type === 'converted' ? 'Novo link convertido: ' : ''} 
                    <span className="font-medium">{event.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getTimeAgo(event.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Nenhuma atividade recente
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;
