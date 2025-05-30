
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { generateRandomAvatar } from '@/utils/avatarGenerator';

type Profile = Tables<'profiles'>;

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // If profile doesn't exist, create it with a random avatar
          if (error.code === 'PGRST116') {
            const randomAvatarUrl = generateRandomAvatar(user.id, 150);
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  full_name: user.user_metadata?.full_name || null,
                  avatar_url: randomAvatarUrl,
                }
              ])
              .select()
              .single();

            if (insertError) throw insertError;
            setProfile(newProfile);
          } else {
            throw error;
          }
        } else {
          // If profile exists but has no avatar, update it with a random one
          if (!data.avatar_url) {
            const randomAvatarUrl = generateRandomAvatar(user.id, 150);
            
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({ avatar_url: randomAvatarUrl })
              .eq('id', user.id)
              .select()
              .single();

            if (updateError) throw updateError;
            setProfile(updatedProfile);
          } else {
            setProfile(data);
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
};
