
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Bell, Moon, Sun, Shield, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesUsuario() {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    whatsappAlerts: true,
    systemUpdates: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    shareAnalytics: false,
    allowCookies: true,
  });

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Configure suas preferências e notificações
        </p>
      </div>

      {/* Tema */}
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

      {/* Notificações */}
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

      {/* Privacidade */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <h3 className="text-lg font-medium">Privacidade e Dados</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="share-analytics">Compartilhar Dados de Análise</Label>
                <p className="text-sm text-muted-foreground">
                  Ajude-nos a melhorar o produto compartilhando dados anônimos
                </p>
              </div>
              <Switch
                id="share-analytics"
                checked={privacySettings.shareAnalytics}
                onCheckedChange={(value) => handlePrivacyChange('shareAnalytics', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-cookies">Permitir Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Necessário para funcionalidades básicas
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
    </div>
  );
}
