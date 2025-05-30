
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAdminBackup() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const createBackup = async (type: 'manual' | 'full' | 'incremental' = 'manual') => {
    setIsCreatingBackup(true);
    
    try {
      toast.info('Iniciando backup do sistema...');
      
      const { data, error } = await supabase.functions.invoke('admin-backup', {
        body: { type }
      });
      
      if (error) throw error;

      toast.success(`Backup ${type} criado com sucesso!`);
      return data;
    } catch (error: any) {
      console.error('Backup failed:', error);
      toast.error('Erro ao criar backup: ' + error.message);
      throw error;
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const getBackupHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('system_backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Failed to fetch backup history:', error);
      throw error;
    }
  };

  return {
    createBackup,
    getBackupHistory,
    isCreatingBackup
  };
}
