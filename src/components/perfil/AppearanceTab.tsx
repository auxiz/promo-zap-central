
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Sun } from 'lucide-react';

export function AppearanceTab() {
  return (
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
  );
}
