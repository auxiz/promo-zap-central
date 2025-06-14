
import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { useWelcomeMessage } from '@/hooks/useWelcomeMessage';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2 } from 'lucide-react';
import { EnhancedFeedback } from '@/components/ui/EnhancedFeedback';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { welcomeData, loading: welcomeLoading } = useWelcomeMessage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsTransitioning(true);
    setIsSidebarOpen(!isSidebarOpen);
    
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Enhanced welcome section with better loading state
  const renderWelcomeSection = () => {
    if (!user) return null;

    if (welcomeLoading) {
      return (
        <div className="mb-4 sm:mb-6 w-full max-w-full animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-muted animate-pulse rounded w-64"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-48"></div>
          </div>
        </div>
      );
    }

    if (welcomeData) {
      return (
        <div className="mb-4 sm:mb-6 w-full max-w-full animate-scale-in">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold break-words overflow-wrap-anywhere transition-all duration-300">
            {welcomeData.title}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base break-words mt-1 transition-all duration-300">
            {welcomeData.subtitle}
          </p>
          {welcomeData.suggestions.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mt-3 animate-fade-in">
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
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mb-4 sm:mb-6 w-full max-w-full animate-fade-in">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold break-words overflow-wrap-anywhere">
          Bem-vindo, {user.user_metadata?.full_name || user.email}!
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-1 break-words">
          Gerencie suas automações e integrações.
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background w-full max-w-full overflow-x-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 main-content transition-all duration-300">
        <Header onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-auto w-full max-w-full">
          <div className="p-2 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden">
            {renderWelcomeSection()}
            
            <div className="w-full max-w-full overflow-x-hidden transition-all duration-300">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
