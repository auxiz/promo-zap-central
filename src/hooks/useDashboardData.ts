
import { useState, useEffect } from 'react';
import { WHATSAPP_API_BASE_URL, API_BASE } from '@/utils/api-constants';

interface GroupCount {
  total: number;
  active: number;
}

interface ActivityEvent {
  type: string;
  title: string;
  timestamp: number;
}

export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(false);
  const [monitoredGroups, setMonitoredGroups] = useState<GroupCount>({ total: 0, active: 0 });
  const [sendGroups, setSendGroups] = useState<GroupCount>({ total: 0, active: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      await Promise.all([
        fetchMonitoredGroups(),
        fetchSendGroups(),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMonitoredGroups = async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/monitored/count`);
      if (response.ok) {
        const data = await response.json();
        setMonitoredGroups(data);
      }
    } catch (error) {
      console.error('Error fetching monitored groups count:', error);
    }
  };

  const fetchSendGroups = async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/send/count`);
      if (response.ok) {
        const data = await response.json();
        setSendGroups(data);
      }
    } catch (error) {
      console.error('Error fetching send groups count:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/activity/recent`);
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.events);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  // Count today's conversions
  const getTodayConversions = () => {
    const isToday = (timestamp: number): boolean => {
      const today = new Date().setHours(0, 0, 0, 0);
      const date = new Date(timestamp).setHours(0, 0, 0, 0);
      return today === date;
    };

    return recentActivity.filter(
      event => event.type === 'converted' && isToday(event.timestamp)
    ).length;
  };

  // Load all data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return {
    isLoading,
    monitoredGroups,
    sendGroups,
    recentActivity,
    getTodayConversions,
    fetchData
  };
}

export type { GroupCount, ActivityEvent };
