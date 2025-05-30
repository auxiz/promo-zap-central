
import { Home, MessageSquare, Users, Send, Settings, User, Smartphone, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const sidebarItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/whatsapp-conexao', label: 'WhatsApp Conexão', icon: Smartphone },
  { href: '/grupos-monitorados', label: 'Grupos Monitorados', icon: Users },
  { href: '/grupos-envio', label: 'Grupos de Envio', icon: Send },
  { href: '/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

const bottomItems = [
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/configuracoes-usuario', label: 'Preferências', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on very small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cn(
      "flex flex-col h-screen bg-sidebar border-r transition-all duration-300 flex-shrink-0",
      isCollapsed ? "w-16" : "w-64",
      "md:relative absolute z-50 md:z-auto"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b flex items-center transition-all duration-300",
        isCollapsed ? "p-2 justify-center" : "p-4 justify-between"
      )}>
        {!isCollapsed && (
          <h1 className="text-lg sm:text-xl font-bold text-sidebar-foreground truncate">PromoZap</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "transition-all duration-200 flex-shrink-0",
            isCollapsed ? "p-1 h-8 w-8" : "p-2"
          )}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 transition-all duration-300 overflow-y-auto",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm transition-all duration-200 relative group",
                    isCollapsed 
                      ? "w-12 h-12 justify-center p-0 mx-auto" 
                      : "gap-3 px-3 py-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon 
                    size={20} 
                    className={cn(
                      "shrink-0 transition-all duration-200",
                      isCollapsed ? "w-5 h-5" : ""
                    )} 
                  />
                  {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-sidebar-accent text-sidebar-accent-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className={cn(
        "border-t transition-all duration-300",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm transition-all duration-200 relative group",
                    isCollapsed 
                      ? "w-12 h-12 justify-center p-0 mx-auto" 
                      : "gap-3 px-3 py-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon 
                    size={20} 
                    className={cn(
                      "shrink-0 transition-all duration-200",
                      isCollapsed ? "w-5 h-5" : ""
                    )} 
                  />
                  {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-sidebar-accent text-sidebar-accent-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
