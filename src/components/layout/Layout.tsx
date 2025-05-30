
import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
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
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold break-words overflow-wrap-anywhere">
                  Bem-vindo, {user.user_metadata?.full_name || user.email}!
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-1 break-words">
                  Gerencie suas conexões WhatsApp e credenciais Shopee no seu painel pessoal.
                </p>
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
