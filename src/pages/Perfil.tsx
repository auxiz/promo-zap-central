
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { ProfileAvatar } from '@/components/perfil/ProfileAvatar';
import { ProfileForm } from '@/components/perfil/ProfileForm';
import { AppearanceTab } from '@/components/perfil/AppearanceTab';
import { NotificationsTab } from '@/components/perfil/NotificationsTab';
import { PrivacyTab } from '@/components/perfil/PrivacyTab';

export default function Perfil() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const { role, isAdmin, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minha Conta</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <ProfileAvatar 
                profile={profile}
                user={user}
                isAdmin={isAdmin}
                role={role}
              />
              <ProfileForm 
                profile={profile}
                user={user}
                role={role}
                isAdmin={isAdmin}
                updateProfile={updateProfile}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-6">
          <AppearanceTab />
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="privacidade" className="space-y-6">
          <PrivacyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
