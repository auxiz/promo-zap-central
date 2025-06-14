import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

interface UserBehavior {
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  clickThroughRate: number;
  conversionRate: number;
}

interface SystemResources {
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  diskUsage: number;
  errorRate: number;
}

interface AnalyticsData {
  performance: PerformanceMetrics;
  userBehavior: UserBehavior;
  systemResources: SystemResources;
  timestamp: Date;
}

export function useAdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [historicalData, setHistoricalData] = useState<AnalyticsData[]>([]);

  const collectMetrics = useCallback(async () => {
    setIsCollecting(true);
    
    try {
      // Collect performance metrics using Performance API
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const performanceMetrics: PerformanceMetrics = {
        pageLoadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: Math.random() * 2000 + 1000, // Simulated
        cumulativeLayoutShift: Math.random() * 0.3,
        firstInputDelay: Math.random() * 100,
        timeToInteractive: navigation?.domInteractive - navigation?.fetchStart || 0
      };

      // Simulate user behavior metrics
      const userBehavior: UserBehavior = {
        sessionDuration: Math.random() * 600 + 60, // 1-10 minutes
        pageViews: Math.floor(Math.random() * 10) + 1,
        bounceRate: Math.random() * 0.8,
        clickThroughRate: Math.random() * 0.15,
        conversionRate: Math.random() * 0.05
      };

      // Simulate system resource metrics
      const systemResources: SystemResources = {
        memoryUsage: Math.random() * 80 + 20,
        cpuUsage: Math.random() * 60 + 10,
        networkLatency: Math.random() * 200 + 50,
        diskUsage: Math.random() * 90 + 10,
        errorRate: Math.random() * 5
      };

      const newData: AnalyticsData = {
        performance: performanceMetrics,
        userBehavior,
        systemResources,
        timestamp: new Date()
      };

      setAnalyticsData(newData);
      setHistoricalData(prev => [...prev, newData].slice(-50)); // Keep last 50 entries

    } catch (error) {
      console.error('Error collecting analytics:', error);
    } finally {
      setIsCollecting(false);
    }
  }, []);

  const generateReport = useCallback(() => {
    if (!analyticsData) return null;

    const recommendations = [];
    
    if (analyticsData.performance.largestContentfulPaint > 2500) {
      recommendations.push('Optimize images and reduce render-blocking resources');
    }
    
    if (analyticsData.performance.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reduce layout shifts by setting dimensions for dynamic content');
    }
    
    if (analyticsData.systemResources.memoryUsage > 80) {
      recommendations.push('Consider implementing memory optimization strategies');
    }
    
    if (analyticsData.userBehavior.bounceRate > 0.7) {
      recommendations.push('Improve user engagement and page relevance');
    }

    return {
      score: calculateOverallScore(analyticsData),
      recommendations,
      trends: analyzeTrends(historicalData)
    };
  }, [analyticsData, historicalData]);

  const calculateOverallScore = (data: AnalyticsData): number => {
    let score = 100;
    
    // Performance penalties
    if (data.performance.largestContentfulPaint > 2500) score -= 20;
    if (data.performance.cumulativeLayoutShift > 0.1) score -= 15;
    if (data.performance.firstInputDelay > 100) score -= 10;
    
    // System resource penalties
    if (data.systemResources.memoryUsage > 80) score -= 15;
    if (data.systemResources.cpuUsage > 70) score -= 10;
    if (data.systemResources.errorRate > 2) score -= 20;
    
    return Math.max(0, score);
  };

  const analyzeTrends = (data: AnalyticsData[]) => {
    if (data.length < 2) return null;
    
    const recent = data.slice(-10);
    const older = data.slice(-20, -10);
    
    if (older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.performance.pageLoadTime, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.performance.pageLoadTime, 0) / older.length;
    
    return {
      performance: recentAvg < olderAvg ? 'improving' : 'declining',
      change: Math.abs(((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1)
    };
  };

  useEffect(() => {
    collectMetrics();
    const interval = setInterval(collectMetrics, 60000); // Collect every minute
    return () => clearInterval(interval);
  }, [collectMetrics]);

  return {
    analyticsData,
    historicalData,
    isCollecting,
    collectMetrics,
    generateReport
  };
}
