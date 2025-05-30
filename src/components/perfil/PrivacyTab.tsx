
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

export function PrivacyTab() {
  const [privacySettings, setPrivacySettings] = useState({
    allowCookies: true,
  });

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Configuração de privacidade atualizada');
  };

  return (
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
  );
}
