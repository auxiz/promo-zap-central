
import { useState, useEffect } from 'react';
import { Bell, BellDot, Check, Trash2 } from 'lucide-react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  } = useNotificationContext();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'agora mesmo';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)} min atrás`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)} h atrás`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-destructive';
      case 'warning': return 'bg-amber-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-primary';
    }
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-1.5 relative text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
          {unreadCount > 0 ? (
            <>
              <BellDot size={20} />
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            </>
          ) : (
            <Bell size={20} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <h3 className="font-medium">Notificações</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={markAllAsRead}>
              <Check size={14} /> <span className="ml-1 text-xs">Marcar como lido</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={clearAllNotifications}>
              <Trash2 size={14} /> <span className="ml-1 text-xs">Limpar</span>
            </Button>
          </div>
        </div>
        
        {notifications.length > 0 ? (
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className={cn("px-3 py-2 hover:bg-accent cursor-pointer", !notification.read && "bg-accent/30")}>
                <div className="flex gap-2">
                  <div className={cn("w-2 h-2 rounded-full mt-2", getTypeColor(notification.type))} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className={cn("font-medium", !notification.read && "font-semibold")}>{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    
                    <div className="flex gap-2 mt-1.5">
                      <button 
                        onClick={() => markAsRead(notification.id)} 
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Marcar como lido
                      </button>
                      <button 
                        onClick={() => clearNotification(notification.id)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            <p>Nenhuma notificação</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationCenter;
