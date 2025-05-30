
import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { User, Mail, Save, Loader2, Bell, Sun, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Perfil() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    whatsappAlerts: true,
    systemUpdates: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    allowCookies: true,
  });

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setIsUpdating(true);
      await updateProfile({ full_name: fullName });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Configuração de notificação atualizada');
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Configuração de privacidade atualizada');
  };

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AA';
  };

  if (loading) {
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
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
                  <AvatarFallback className="text-lg">
                    {getInitials(profile?.full_name, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">Foto do Perfil</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload de avatar será implementado em breve
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5" />
                <h3 className="text-lg font-medium">Aparência</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tema</p>
                  <p className="text-sm text-muted-foreground">
                    Escolha entre claro, escuro ou automático
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <h3 className="text-lg font-medium">Notificações</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações no navegador
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(value) => handleNotificationChange('pushNotifications', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp-alerts">Alertas WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre status da conexão WhatsApp
                    </p>
                  </div>
                  <Switch
                    id="whatsapp-alerts"
                    checked={notificationSettings.whatsappAlerts}
                    onCheckedChange={(value) => handleNotificationChange('whatsappAlerts', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-updates">Atualizações do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre novas funcionalidades
                    </p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(value) => handleNotificationChange('systemUpdates', value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacidade" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <h3 className="text-lg font-medium">Privacidade e Dados</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-cookies">Permitir Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Cookies são usados para salvar suas preferências de tema, estado da sidebar e autenticação
                    </p>
                  </div>
                  <Switch
                    id="allow-cookies"
                    checked={privacySettings.allowCookies}
                    onCheckedChange={(value) => handlePrivacyChange('allowCookies', value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
