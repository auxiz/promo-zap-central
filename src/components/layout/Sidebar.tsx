
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

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Auto-collapse on very small screens and set mobile state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(!isOpen); // Use the prop from parent
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobile, isOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      onToggle(); // Use parent toggle for mobile
    } else {
      setIsCollapsed(!isCollapsed); // Keep local state for desktop
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      onToggle(); // Close using parent function
    }
  };

  // For mobile, use the isOpen prop; for desktop, use local isCollapsed state
  const shouldCollapse = isMobile ? !isOpen : isCollapsed;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black/50 z-[900]"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={cn(
        "flex flex-col bg-sidebar border-r transition-all duration-300 flex-shrink-0",
        // Desktop styles
        "md:relative md:h-screen",
        shouldCollapse ? "md:w-16" : "md:w-64",
        // Mobile styles
        isMobile ? [
          "sidebar-mobile fixed top-0 left-0 h-screen z-[1000]",
          "overflow-y-auto overscroll-contain",
          "scrollbar-width-none -ms-overflow-style-none",
          shouldCollapse ? "w-0 opacity-0" : "w-64 opacity-100"
        ] : ""
      )}>
        {/* Header */}
        <div className={cn(
          "border-b flex items-center transition-all duration-300",
          shouldCollapse && !isMobile ? "p-2 justify-center" : "p-4 justify-between"
        )}>
          {/* Only show logo when not collapsed on desktop OR on mobile */}
          {(!shouldCollapse || isMobile) && (
            <h1 className="text-lg sm:text-xl font-bold text-sidebar-foreground truncate">PromoZap</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "transition-all duration-200 flex-shrink-0",
              shouldCollapse && !isMobile ? "p-1 h-8 w-8" : "p-2"
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform duration-300",
              shouldCollapse && !isMobile && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 transition-all duration-300",
          shouldCollapse && !isMobile ? "p-2 overflow-hidden" : "p-4 overflow-y-auto"
        )}>
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center rounded-lg text-sm transition-all duration-200 relative group",
                      shouldCollapse && !isMobile
                        ? "w-12 h-12 justify-center p-0 mx-auto" 
                        : "gap-3 px-3 py-3",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={shouldCollapse && !isMobile ? item.label : undefined}
                  >
                    <Icon 
                      size={20} 
                      className={cn(
                        "shrink-0 transition-all duration-200",
                        shouldCollapse && !isMobile ? "w-5 h-5" : ""
                      )} 
                    />
                    {(!shouldCollapse || isMobile) && <span className="font-medium truncate">{item.label}</span>}
                    
                    {/* Tooltip for collapsed state on desktop */}
                    {shouldCollapse && !isMobile && (
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
          shouldCollapse && !isMobile ? "p-2" : "p-4"
        )}>
          <ul className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center rounded-lg text-sm transition-all duration-200 relative group",
                      shouldCollapse && !isMobile
                        ? "w-12 h-12 justify-center p-0 mx-auto" 
                        : "gap-3 px-3 py-3",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={shouldCollapse && !isMobile ? item.label : undefined}
                  >
                    <Icon 
                      size={20} 
                      className={cn(
                        "shrink-0 transition-all duration-200",
                        shouldCollapse && !isMobile ? "w-5 h-5" : ""
                      )} 
                    />
                    {(!shouldCollapse || isMobile) && <span className="font-medium truncate">{item.label}</span>}
                    
                    {/* Tooltip for collapsed state on desktop */}
                    {shouldCollapse && !isMobile && (
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
    </>
  );
}
