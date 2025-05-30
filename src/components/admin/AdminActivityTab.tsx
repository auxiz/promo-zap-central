
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateRandomAvatar, generateInitialsAvatar } from '@/utils/avatarGenerator';

interface ActivityWithUser {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
}

export function AdminActivityTab() {
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivities = async () => {
    try {
      // Buscar atividades recentes com informações do usuário
      const { data: activitiesData, error } = await supabase
        .from('user_activity')
        .select(`
          id,
          title,
          description,
          type,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Buscar informações dos usuários
      if (activitiesData) {
        const userIds = [...new Set(activitiesData.map(a => a.user_id))];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        // Combinar dados
        const activitiesWithUsers = activitiesData.map(activity => {
          const userProfile = profilesData?.find(p => p.id === activity.user_id);
          return {
            ...activity,
            user_name: userProfile?.full_name,
            user_avatar: userProfile?.avatar_url
          };
        });

        setActivities(activitiesWithUsers);
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'connection':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'template':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'group':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-medium">Atividades Recentes</h3>
          <Badge variant="secondary">{activities.length} atividades</Badge>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade recente encontrada</p>
            </div>
          ) : (
            activities.map((activity) => {
              const avatarUrl = activity.user_avatar || generateRandomAvatar(activity.user_id, 32);
              const initialsData = generateInitialsAvatar(activity.user_name || 'User', activity.user_id);

              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={avatarUrl} alt={activity.user_name} />
                    <AvatarFallback 
                      style={{
                        backgroundColor: initialsData.backgroundColor,
                        color: initialsData.textColor,
                      }}
                    >
                      {initialsData.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getActivityTypeColor(activity.type)}`}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                    
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {activity.user_name || 'Usuário desconhecido'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(activity.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
