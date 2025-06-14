
import { useEffect, useCallback } from 'react';

interface PreloadConfig {
  routes?: string[];
  delay?: number;
  condition?: boolean;
}

// Mapeamento de rotas para imports lazy
const routeImports: Record<string, () => Promise<any>> = {
  '/': () => import('@/pages/Index'),
  '/whatsapp-conexao': () => import('@/pages/WhatsAppConexao'),
  '/grupos-monitorados': () => import('@/pages/GruposMonitorados'),
  '/grupos-envio': () => import('@/pages/GruposEnvio'),
  '/mensagens': () => import('@/pages/Mensagens'),
  '/configuracoes': () => import('@/pages/Configuracoes'),
  '/perfil': () => import('@/pages/Perfil'),
  '/admin': () => import('@/pages/Admin'),
};

export const usePreloadComponents = ({
  routes = [],
  delay = 2000,
  condition = true
}: PreloadConfig = {}) => {
  
  const preloadRoute = useCallback(async (route: string) => {
    try {
      const importFn = routeImports[route];
      if (importFn) {
        await importFn();
        console.log(`✅ Preloaded route: ${route}`);
      }
    } catch (error) {
      console.warn(`❌ Failed to preload route: ${route}`, error);
    }
  }, []);

  const preloadMultipleRoutes = useCallback(async (routesToPreload: string[]) => {
    // Preload routes sequentially to avoid overwhelming the browser
    for (const route of routesToPreload) {
      await preloadRoute(route);
      // Small delay between preloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [preloadRoute]);

  useEffect(() => {
    if (!condition || routes.length === 0) return;

    const timeoutId = setTimeout(() => {
      preloadMultipleRoutes(routes);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [routes, delay, condition, preloadMultipleRoutes]);

  // Preload on hover/focus for instant navigation
  const preloadOnHover = useCallback((route: string) => {
    return {
      onMouseEnter: () => preloadRoute(route),
      onFocus: () => preloadRoute(route),
    };
  }, [preloadRoute]);

  return {
    preloadRoute,
    preloadMultipleRoutes,
    preloadOnHover,
  };
};

// Hook para detectar idle time e precarregar componentes
export const useIdlePreloading = () => {
  const { preloadMultipleRoutes } = usePreloadComponents();

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // User is idle, preload common routes
        const commonRoutes = ['/', '/whatsapp-conexao', '/grupos-monitorados'];
        preloadMultipleRoutes(commonRoutes);
      }, 3000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [preloadMultipleRoutes]);
};
