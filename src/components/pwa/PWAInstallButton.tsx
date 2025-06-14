
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

export const PWAInstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled || !isInstallable) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    
    if (!success) {
      console.log('Installation was cancelled or failed');
    }
  };

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isInstalling ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      ) : (
        <Download className="h-4 w-4" />
      )}
      <Smartphone className="h-4 w-4" />
      Instalar App
    </Button>
  );
};
