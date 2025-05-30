
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  role: 'admin' | 'user';
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

interface AdminUsersStats {
  totalUsers: number;
  adminCount: number;
  activeInstances: number;
}

interface AdminUsersData {
  users: AdminUser[];
  stats: AdminUsersStats;
}

export function useAdminUsers() {
  const [data, setData] = useState<AdminUsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('admin-users');
      
      if (error) throw error;

      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch admin users:', err);
      setError(err.message);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        }, { 
          onConflict: 'user_id' 
        });

      if (error) throw error;

      toast.success(`Usuário ${newRole === 'admin' ? 'promovido a' : 'rebaixado para'} ${newRole}`);
      fetchUsers(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao alterar role:', error);
      toast.error('Erro ao alterar permissões do usuário');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchUsers,
    toggleUserRole
  };
}
