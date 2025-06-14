
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface PWAInstallPrompt {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const listenersAddedRef = useRef(false);

  useEffect(() => {
    // Prevent adding listeners multiple times
    if (listenersAddedRef.current) return;
    listenersAddedRef.current = true;

    // Check if app is already installed
    const checkInstallStatus = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as any);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      toast.success('App instalado com sucesso!');
    };

    // Listen for online/offline events with debounce
    let onlineTimeout: NodeJS.Timeout;
    let offlineTimeout: NodeJS.Timeout;

    const handleOnline = () => {
      clearTimeout(offlineTimeout);
      onlineTimeout = setTimeout(() => {
        setIsOffline(false);
        toast.success('Conexão restaurada!');
      }, 1000); // Debounce for 1 second
    };

    const handleOffline = () => {
      clearTimeout(onlineTimeout);
      offlineTimeout = setTimeout(() => {
        setIsOffline(true);
        toast.warning('Você está offline. Algumas funcionalidades podem estar limitadas.');
      }, 1000); // Debounce for 1 second
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial install status
    checkInstallStatus();

    return () => {
      // Cleanup
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(onlineTimeout);
      clearTimeout(offlineTimeout);
      listenersAddedRef.current = false;
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return false;

    try {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error installing app:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações.');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  return {
    isInstallable,
    isInstalled,
    isOffline,
    installApp,
    requestNotificationPermission,
  };
};
