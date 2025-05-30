
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalInstances: number;
    activeInstances: number;
    totalGroups: number;
    totalTemplates: number;
    recentActivity: number;
  };
  performance: {
    instanceUtilization: number;
    averageGroupsPerUser: number;
    templatesAdoption: number;
  };
  trends: {
    dailyActivity: Record<string, number>;
    timeframe: string;
  };
  metrics: any[];
  errors: any[];
  lastUpdated: string;
}

export function useAdminAnalytics(timeframe: string = '24h') {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-analytics', {
        body: { timeframe }
      });
      
      if (error) throw error;

      setAnalytics(data);
    } catch (err: any) {
      console.error('Analytics fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}
