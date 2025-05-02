
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';

interface ShopeeStatusBadgeProps {
  status: 'online' | 'offline';
}

export function ShopeeStatusBadge({ status }: ShopeeStatusBadgeProps) {
  return status === 'online' ? (
    <Badge className="bg-green-500 hover:bg-green-600">
      <Check size={14} className="mr-1" /> Online
    </Badge>
  ) : (
    <Badge variant="destructive">
      <AlertCircle size={14} className="mr-1" /> Offline
    </Badge>
  );
}
