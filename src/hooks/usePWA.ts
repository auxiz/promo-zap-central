
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
  const cleanupRef = useRef<(() => void) | null>(null);

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

    // Online/offline handlers with improved debouncing
    let onlineTimeout: NodeJS.Timeout;
    let offlineTimeout: NodeJS.Timeout;
    let lastOnlineState = navigator.onLine;

    const handleOnline = () => {
      clearTimeout(offlineTimeout);
      if (!lastOnlineState) { // Only if we were offline
        onlineTimeout = setTimeout(() => {
          lastOnlineState = true;
          setIsOffline(false);
          toast.success('Conexão restaurada!');
        }, 2000); // Increased debounce
      }
    };

    const handleOffline = () => {
      clearTimeout(onlineTimeout);
      if (lastOnlineState) { // Only if we were online
        offlineTimeout = setTimeout(() => {
          lastOnlineState = false;
          setIsOffline(true);
          toast.warning('Você está offline. Algumas funcionalidades podem estar limitadas.');
        }, 2000); // Increased debounce
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline, { passive: true });
    window.addEventListener('offline', handleOffline, { passive: true });

    // Check initial install status
    checkInstallStatus();

    // Store cleanup function
    cleanupRef.current = () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(onlineTimeout);
      clearTimeout(offlineTimeout);
    };

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
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

    // Rate limit notification requests
    const lastRequest = sessionStorage.getItem('last_notification_request');
    const now = Date.now();
    if (lastRequest && now - parseInt(lastRequest) < 60000) { // 1 minute cooldown
      return Notification.permission === 'granted';
    }

    sessionStorage.setItem('last_notification_request', now.toString());
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
