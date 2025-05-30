
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
    <header className="border-b bg-background w-full max-w-full overflow-x-hidden flex-shrink-0">
      <div className="flex h-16 items-center px-4 sm:px-6 w-full max-w-full">
        <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 min-w-0" />
        
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
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
