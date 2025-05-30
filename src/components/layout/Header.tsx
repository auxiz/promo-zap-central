
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserDropdown from "@/components/auth/UserDropdown";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useNotifications } from "@/hooks/useNotifications";

export default function Header() {
  const { unreadCount } = useNotifications();

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <div className="relative">
            <NotificationCenter />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
          
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
