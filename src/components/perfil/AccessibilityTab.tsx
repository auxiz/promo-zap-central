
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';
import { 
  Eye, 
  Type, 
  MousePointer, 
  Keyboard, 
  Volume2, 
  Download, 
  Upload,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AccessibilityTab() {
  const { 
    settings, 
    updateSetting, 
    resetSettings, 
    exportSettings, 
    importSettings,
    isLoading 
  } = useAccessibilitySettings();
  const { toast } = useToast();

  const handleExport = () => {
    const settingsData = exportSettings();
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accessibility-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configurações exportadas",
      description: "Suas configurações de acessibilidade foram salvas em um arquivo.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        importSettings(result);
        toast({
          title: "Configurações importadas",
          description: "Suas configurações de acessibilidade foram aplicadas com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao importar",
          description: "Não foi possível importar as configurações. Verifique o arquivo.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetSettings();
    toast({
      title: "Configurações redefinidas",
      description: "Todas as configurações de acessibilidade foram restauradas ao padrão.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Configurações de Acessibilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <Label htmlFor="font-size">Tamanho da Fonte</Label>
            </div>
            <Select 
              value={settings.fontSize} 
              onValueChange={(value: any) => updateSetting('fontSize', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno (14px)</SelectItem>
                <SelectItem value="medium">Médio (16px)</SelectItem>
                <SelectItem value="large">Grande (18px)</SelectItem>
                <SelectItem value="extra-large">Extra Grande (22px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Visual Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Configurações Visuais
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Alto Contraste</Label>
                <p className="text-sm text-muted-foreground">
                  Aumenta o contraste para melhor visibilidade
                </p>
              </div>
              <Switch 
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Reduzir Movimento</Label>
                <p className="text-sm text-muted-foreground">
                  Reduz animações e transições
                </p>
              </div>
              <Switch 
                checked={settings.reduceMotion}
                onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Indicadores de Foco</Label>
                <p className="text-sm text-muted-foreground">
                  Destaca elementos focados para navegação por teclado
                </p>
              </div>
              <Switch 
                checked={settings.focusIndicators}
                onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Navigation Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Navegação
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Navegação por Teclado</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita navegação completa usando apenas o teclado
                </p>
              </div>
              <Switch 
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Compatibilidade com Leitor de Tela</Label>
                <p className="text-sm text-muted-foreground">
                  Otimiza a interface para leitores de tela
                </p>
              </div>
              <Switch 
                checked={settings.screenReader}
                onCheckedChange={(checked) => updateSetting('screenReader', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Gerenciar Configurações
            </h4>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              
              <Button variant="outline" asChild className="flex items-center gap-2">
                <label htmlFor="import-settings" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Importar
                </label>
              </Button>
              <input
                id="import-settings"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              
              <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Redefinir
              </Button>
            </div>
          </div>

          {/* Current Status */}
          <div className="pt-4 border-t">
            <h5 className="font-medium mb-3">Status Atual</h5>
            <div className="flex flex-wrap gap-2">
              {settings.highContrast && (
                <Badge variant="secondary">Alto Contraste</Badge>
              )}
              {settings.reduceMotion && (
                <Badge variant="secondary">Movimento Reduzido</Badge>
              )}
              {settings.screenReader && (
                <Badge variant="secondary">Leitor de Tela</Badge>
              )}
              {settings.keyboardNavigation && (
                <Badge variant="secondary">Navegação por Teclado</Badge>
              )}
              {settings.fontSize !== 'medium' && (
                <Badge variant="secondary">Fonte {settings.fontSize}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
