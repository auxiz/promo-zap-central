
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetrics {
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  lastUpdated: Date;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function useSystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const collectMetrics = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      // Simular coleta de métricas do sistema
      const { data: healthData } = await supabase.functions.invoke('admin-health-check');
      const responseTime = Date.now() - startTime;
      
      const newMetrics: SystemMetrics = {
        responseTime,
        errorRate: Math.random() * 5, // Simulated error rate
        activeUsers: healthData?.metrics?.totalUsers || 0,
        memoryUsage: Math.random() * 80 + 20, // Simulated memory usage 20-100%
        lastUpdated: new Date()
      };

      setMetrics(newMetrics);

      // Verificar alertas baseados nas métricas
      const newAlerts: SystemAlert[] = [];
      
      if (newMetrics.responseTime > 2000) {
        newAlerts.push({
          id: `rt-${Date.now()}`,
          type: 'warning' as const,
          message: `Tempo de resposta alto: ${newMetrics.responseTime}ms`,
          timestamp: new Date(),
          resolved: false
        });
      }

      if (newMetrics.errorRate > 2) {
        newAlerts.push({
          id: `er-${Date.now()}`,
          type: 'error' as const,
          message: `Taxa de erro elevada: ${newMetrics.errorRate.toFixed(2)}%`,
          timestamp: new Date(),
          resolved: false
        });
      }

      if (newMetrics.memoryUsage > 85) {
        newAlerts.push({
          id: `mem-${Date.now()}`,
          type: 'warning' as const,
          message: `Uso de memória alto: ${newMetrics.memoryUsage.toFixed(1)}%`,
          timestamp: new Date(),
          resolved: false
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50 alerts
      }

    } catch (error) {
      console.error('Erro ao coletar métricas:', error);
      setAlerts(prev => [{
        id: `error-${Date.now()}`,
        type: 'error' as const,
        message: 'Falha na coleta de métricas do sistema',
        timestamp: new Date(),
        resolved: false
      }, ...prev].slice(0, 50));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  const clearResolvedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(alert => !alert.resolved));
  }, []);

  useEffect(() => {
    collectMetrics();
    const interval = setInterval(collectMetrics, 30000); // Collect metrics every 30 seconds
    return () => clearInterval(interval);
  }, [collectMetrics]);

  return {
    metrics,
    alerts: alerts.filter(alert => !alert.resolved),
    resolvedAlerts: alerts.filter(alert => alert.resolved),
    isLoading,
    collectMetrics,
    resolveAlert,
    clearResolvedAlerts
  };
}
