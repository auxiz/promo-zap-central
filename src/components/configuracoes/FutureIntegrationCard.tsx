
import { Card } from '@/components/ui/card';

interface FutureIntegrationCardProps {
  title: string;
}

export function FutureIntegrationCard({ title }: FutureIntegrationCardProps) {
  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="border-b p-4 bg-card">
        <h2 className="font-medium">{title}</h2>
      </div>
      
      <div className="p-6 flex items-center justify-center h-32 text-muted-foreground">
        <span>Em breve</span>
      </div>
    </Card>
  );
}
