
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Router from "@/Router";
import { useBundleOptimization, useIntelligentCodeSplitting } from "@/hooks/useBundleOptimization";
import { useIdlePreloading } from "@/hooks/usePreloadComponents";
import { useAdvancedFeatures } from "@/hooks/useAdvancedFeatures";
import { useEffect } from "react";

// Create query client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function AppFeatures() {
  // Initialize performance optimizations
  useBundleOptimization({
    enablePreloading: true,
    enablePrefetching: true,
    enableResourceHints: true,
  });

  // Start idle preloading after app loads
  useIdlePreloading();

  // Initialize advanced features (PWA, Analytics, Real-time notifications)
  // This must be inside AuthProvider context
  const { pwa, analytics } = useAdvancedFeatures();

  const { isSlowConnection } = useIntelligentCodeSplitting();

  useEffect(() => {
    // Log connection info for debugging
    console.log('🌐 Connection Status:', {
      isSlowConnection: isSlowConnection(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      pwaInstallable: pwa.isInstallable,
      pwaInstalled: pwa.isInstalled,
      offline: pwa.isOffline,
    });

    // Track app initialization
    analytics.trackEvent('app_initialized', {
      isSlowConnection: isSlowConnection(),
      isPWAInstalled: pwa.isInstalled,
      isOffline: pwa.isOffline,
    });
  }, [isSlowConnection, pwa, analytics]);

  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

function AppContent() {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem
      storageKey="vite-ui-theme"
    >
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <AppFeatures />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
