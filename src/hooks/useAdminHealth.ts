
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  database: {
    status: string;
    tables: Array<{
      table: string;
      status: string;
      error?: string;
    }>;
  };
  metrics: {
    totalUsers: number;
    activeInstances: number;
  };
  config: any[];
  lastCheck: Date | null;
  error?: string;
}

export function useAdminHealth() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'checking',
    database: { status: 'unknown', tables: [] },
    metrics: { totalUsers: 0, activeInstances: 0 },
    config: [],
    lastCheck: null
  });

  const checkHealth = async () => {
    setHealthStatus(prev => ({ ...prev, status: 'checking' }));
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-health-check');
      
      if (error) throw error;

      setHealthStatus({
        ...data,
        lastCheck: new Date()
      });
    } catch (error: any) {
      console.error('Health check failed:', error);
      setHealthStatus(prev => ({
        ...prev,
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      }));
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    healthStatus,
    checkHealth,
    isHealthy: healthStatus.status === 'healthy'
  };
}
