
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Shield } from 'lucide-react';

interface ShopeeStatusBadgeProps {
  status: 'online' | 'offline';
  hasToken?: boolean;
}

export function ShopeeStatusBadge({ status, hasToken = false }: ShopeeStatusBadgeProps) {
  if (status === 'online' && hasToken) {
    return (
      <Badge className="bg-green-500 hover:bg-green-600 flex gap-1">
        <Shield size={14} /> Autenticado
      </Badge>
    );
  }
  
  if (status === 'online') {
    return (
      <Badge className="bg-amber-500 hover:bg-amber-600 flex gap-1">
        <Check size={14} /> API Online
      </Badge>
    );
  }
  
  return (
    <Badge variant="destructive" className="flex gap-1">
      <AlertCircle size={14} /> Offline
    </Badge>
  );
}
