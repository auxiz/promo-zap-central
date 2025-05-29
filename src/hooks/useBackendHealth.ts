
import { useState, useEffect, useCallback } from 'react';
import { HEALTH_CHECK_URL } from '@/utils/api-constants';

interface HealthStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  error: string | null;
}

export function useBackendHealth() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    isOnline: false,
    isChecking: false,
    lastCheck: null,
    error: null
  });

  const checkHealth = useCallback(async () => {
    setHealthStatus(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      const response = await fetch(HEALTH_CHECK_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setHealthStatus({
          isOnline: true,
          isChecking: false,
          lastCheck: new Date(),
          error: null
        });
      } else {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setHealthStatus({
        isOnline: false,
        isChecking: false,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  useEffect(() => {
    // Initial health check
    checkHealth();
    
    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    ...healthStatus,
    checkHealth
  };
}
