
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background w-full max-w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-auto w-full max-w-full">
          <div className="p-4 sm:p-6 w-full max-w-full overflow-x-hidden">
            {user && (
              <div className="mb-6 w-full max-w-full">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  Bem-vindo, {user.user_metadata?.full_name || user.email}!
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
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
