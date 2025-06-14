
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserDropdown from "@/components/auth/UserDropdown";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border/60 p-3 lg:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost" 
            size="sm" 
            onClick={onMenuToggle}
            className="md:hidden p-1.5 h-auto"
          >
            <Menu size={20} />
          </Button>
          
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold">PromoZap Central</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          <PWAInstallButton />
          <NotificationCenter />
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
