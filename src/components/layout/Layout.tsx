
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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {user && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                Bem-vindo, {user.user_metadata?.full_name || user.email}!
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas conexões WhatsApp e credenciais Shopee no seu painel pessoal.
              </p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
