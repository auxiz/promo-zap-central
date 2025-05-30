
import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { useWelcomeMessage } from '@/hooks/useWelcomeMessage';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { welcomeData, loading: welcomeLoading } = useWelcomeMessage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Close sidebar on mobile by default
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background w-full max-w-full overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 main-content">
        <Header onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-auto w-full max-w-full">
          <div className="p-2 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden">
            {user && (
              <div className="mb-4 sm:mb-6 w-full max-w-full">
                {welcomeLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Carregando...</span>
                  </div>
                ) : welcomeData ? (
                  <div className="space-y-3">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold break-words overflow-wrap-anywhere">
                      {welcomeData.title}
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm lg:text-base break-words">
                      {welcomeData.subtitle}
                    </p>
                    {welcomeData.suggestions.length > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                            Sugestões para você:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {welcomeData.suggestions.map((suggestion, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold break-words overflow-wrap-anywhere">
                      Bem-vindo, {user.user_metadata?.full_name || user.email}!
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-1 break-words">
                      Gerencie suas automações e integrações.
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
