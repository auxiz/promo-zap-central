
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, Users, BarChart3, Settings, Activity } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminAnalyticsTab } from '@/components/admin/AdminAnalyticsTab';
import { AdminSystemTab } from '@/components/admin/AdminSystemTab';
import { AdminActivityTab } from '@/components/admin/AdminActivityTab';

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-yellow-600" />
        <div>
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, monitore o sistema e configure funcionalidades
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividades
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <AdminUsersTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdminAnalyticsTab />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <AdminActivityTab />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <AdminSystemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
