
import { useState, useEffect, useCallback } from 'react';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export interface WhatsAppMetrics {
  uptime: number;
  connectionState: string;
  messages: {
    sent: number;
    received: number;
    failed: number;
  };
  rateLimits: {
    warnings: Array<{
      timestamp: number;
      message: string;
      details?: any;
    }>;
    lastWarning: {
      timestamp: number;
      message: string;
      details?: any;
    } | null;
    isThrottled: boolean;
  };
  reconnections: number;
}

export const useWhatsAppMetrics = (instanceId: string = 'default', autoRefresh: boolean = true) => {
  const [metrics, setMetrics] = useState<WhatsAppMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/metrics?instanceId=${instanceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data.metrics);
      return data.metrics;
    } catch (err) {
      console.error('Error fetching WhatsApp metrics:', err);
      setError('Failed to fetch WhatsApp metrics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [instanceId]);
  
  const resetMetrics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/metrics`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchMetrics();
      return true;
    } catch (err) {
      console.error('Error resetting metrics:', err);
      setError('Failed to reset metrics');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [instanceId, fetchMetrics]);
  
  const clearRateLimitWarnings = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/metrics/rate-limits`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchMetrics();
      return true;
    } catch (err) {
      console.error('Error clearing rate limit warnings:', err);
      setError('Failed to clear rate limit warnings');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [instanceId, fetchMetrics]);
  
  // Fetch metrics on mount and periodically if autoRefresh is true
  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000);  // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, autoRefresh]);
  
  return {
    metrics,
    isLoading,
    error,
    fetchMetrics,
    resetMetrics,
    clearRateLimitWarnings
  };
};
