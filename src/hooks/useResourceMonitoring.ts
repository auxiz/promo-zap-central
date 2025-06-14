
import { useState, useEffect, useCallback } from 'react';

interface ResourceMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
    requests: number;
  };
  storage: {
    used: number;
    available: number;
    percentage: number;
  };
  performance: {
    fps: number;
    renderTime: number;
    scriptExecution: number;
  };
}

interface ResourceAlert {
  id: string;
  type: 'memory' | 'network' | 'storage' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
}

export function useResourceMonitoring() {
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);
  const [alerts, setAlerts] = useState<ResourceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<ResourceMetrics[]>([]);

  const collectResourceMetrics = useCallback(async () => {
    try {
      // Get memory information (simulated for browser environment)
      const memoryInfo = (performance as any)?.memory || {};
      const memoryUsed = memoryInfo.usedJSHeapSize || Math.random() * 100 * 1024 * 1024;
      const memoryTotal = memoryInfo.totalJSHeapSize || 200 * 1024 * 1024;
      
      // Network metrics (simulated)
      const networkMetrics = {
        downloadSpeed: Math.random() * 100 + 10, // Mbps
        uploadSpeed: Math.random() * 50 + 5,
        latency: Math.random() * 100 + 20,
        requests: Math.floor(Math.random() * 50) + 10
      };

      // Storage metrics (using localStorage as proxy)
      let storageUsed = 0;
      try {
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            storageUsed += localStorage[key].length;
          }
        }
      } catch (e) {
        storageUsed = Math.random() * 5 * 1024 * 1024; // 5MB simulated
      }
      
      const storageTotal = 10 * 1024 * 1024; // 10MB quota simulation

      // Performance metrics
      const performanceMetrics = {
        fps: Math.floor(Math.random() * 30) + 30, // 30-60 FPS
        renderTime: Math.random() * 16.67, // Target 60fps = 16.67ms per frame
        scriptExecution: Math.random() * 50 + 10
      };

      const newMetrics: ResourceMetrics = {
        memory: {
          used: memoryUsed,
          total: memoryTotal,
          percentage: (memoryUsed / memoryTotal) * 100
        },
        network: networkMetrics,
        storage: {
          used: storageUsed,
          available: storageTotal - storageUsed,
          percentage: (storageUsed / storageTotal) * 100
        },
        performance: performanceMetrics
      };

      setMetrics(newMetrics);
      setHistory(prev => [...prev, newMetrics].slice(-100)); // Keep last 100 entries

      // Check for alerts
      checkResourceAlerts(newMetrics);

    } catch (error) {
      console.error('Error collecting resource metrics:', error);
    }
  }, []);

  const checkResourceAlerts = useCallback((metrics: ResourceMetrics) => {
    const newAlerts: ResourceAlert[] = [];

    // Memory alerts
    if (metrics.memory.percentage > 90) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'memory',
        severity: 'critical',
        message: 'Memory usage is critically high',
        threshold: 90,
        currentValue: metrics.memory.percentage,
        timestamp: new Date()
      });
    } else if (metrics.memory.percentage > 75) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'memory',
        severity: 'high',
        message: 'Memory usage is high',
        threshold: 75,
        currentValue: metrics.memory.percentage,
        timestamp: new Date()
      });
    }

    // Network alerts
    if (metrics.network.latency > 500) {
      newAlerts.push({
        id: `network-${Date.now()}`,
        type: 'network',
        severity: 'high',
        message: 'Network latency is high',
        threshold: 500,
        currentValue: metrics.network.latency,
        timestamp: new Date()
      });
    }

    // Storage alerts
    if (metrics.storage.percentage > 85) {
      newAlerts.push({
        id: `storage-${Date.now()}`,
        type: 'storage',
        severity: 'medium',
        message: 'Storage usage is high',
        threshold: 85,
        currentValue: metrics.storage.percentage,
        timestamp: new Date()
      });
    }

    // Performance alerts
    if (metrics.performance.fps < 30) {
      newAlerts.push({
        id: `performance-${Date.now()}`,
        type: 'performance',
        severity: 'medium',
        message: 'Frame rate is low',
        threshold: 30,
        currentValue: metrics.performance.fps,
        timestamp: new Date()
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 20)); // Keep last 20 alerts
    }
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    collectResourceMetrics();
  }, [collectResourceMetrics]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const optimizeResources = useCallback(async () => {
    // Simulate resource optimization
    if (metrics) {
      // Clear some cache/storage
      try {
        // Clear some localStorage items if storage is high
        if (metrics.storage.percentage > 80) {
          const keys = Object.keys(localStorage);
          const keysToRemove = keys.slice(0, Math.floor(keys.length * 0.1));
          keysToRemove.forEach(key => {
            if (!key.includes('auth') && !key.includes('theme')) {
              localStorage.removeItem(key);
            }
          });
        }

        // Force garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
      } catch (error) {
        console.warn('Resource optimization failed:', error);
      }
    }
  }, [metrics]);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(collectResourceMetrics, 5000); // Collect every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isMonitoring, collectResourceMetrics]);

  return {
    metrics,
    alerts,
    history,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    optimizeResources,
    collectResourceMetrics
  };
}
