import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'member';
  plan: 'basic' | 'pro' | 'advanced' | 'enterprise';
  monthly_credits: number;
  addon_credits: number;
  renewal_date: string;
}

interface CreditLog {
  id: string;
  action: string;
  credits_used: number;
  created_at: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchCreditLogs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('credits_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCreditLogs(data || []);
    } catch (error) {
      console.error('Error fetching credit logs:', error);
    }
  };

  const deductCredits = async (action: string, credits: number) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_action: action,
        p_credits: credits
      });

      if (error) throw error;
      
      if (data) {
        await fetchProfile();
        await fetchCreditLogs();
        toast({
          title: "Credits deducted",
          description: `${credits} credits used for ${action}`,
        });
        return true;
      } else {
        toast({
          title: "Insufficient credits",
          description: "You don't have enough credits for this action",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: "Failed to deduct credits",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchProfile(), fetchCreditLogs()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    creditLogs,
    loading,
    deductCredits,
    refetch: () => Promise.all([fetchProfile(), fetchCreditLogs()])
  };
};