
import { Home, MessageSquare, Users, Send, Settings, User, Smartphone, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
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

  return (
    <div className={cn(
      "flex flex-col h-screen bg-sidebar border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-sidebar-foreground">PromoZap</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t">
        <ul className="space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
