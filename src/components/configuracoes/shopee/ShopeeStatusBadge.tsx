
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';

interface ShopeeStatusBadgeProps {
  status: 'online' | 'offline';
}

export function ShopeeStatusBadge({ status }: ShopeeStatusBadgeProps) {
  if (status === 'online') {
    return (
      <Badge className="bg-green-500 hover:bg-green-600 flex gap-1">
        <Check size={14} /> API Conectada
      </Badge>
    );
  }
  
  return (
    <Badge variant="destructive" className="flex gap-1">
      <AlertCircle size={14} /> Offline
    </Badge>
  );
}
