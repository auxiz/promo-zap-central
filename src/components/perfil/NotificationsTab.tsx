
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationsTab() {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    whatsappAlerts: true,
    systemUpdates: true,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Configuração de notificação atualizada');
  };

  return (
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
  );
}
