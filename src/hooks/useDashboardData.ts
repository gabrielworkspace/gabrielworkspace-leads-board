import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { DailyMetrics, Lead } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDashboardData(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ['leads', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data: leadsData, error } = await supabase.from('leads').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) {
        toast.error(`Erro ao carregar leads: ${error.message}`);
        return [];
      }
      return (leadsData || []).map(l => ({
        ...l,
        promiseDate: l.promisedate,
        serviceType: l.service_type
      })) as Lead[];
    },
    enabled: !!userId,
  });

  const { data: metrics = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ['metrics', userId],
    queryFn: async () => {
      if (!userId) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: metricsData, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (error) {
        toast.error(`Erro ao carregar métricas: ${error.message}`);
      }

      const paddedMetrics: DailyMetrics[] = [];
      const dataMap = new Map();
      if (metricsData) {
        metricsData.forEach(m => {
          dataMap.set(m.date, {
            date: m.date,
            messagesSent: m.messagessent || 0,
            messagesReplied: m.messagesreplied || 0,
            adSpend: m.adspend || 0,
            lpRevenue: m.lprevenue || 0,
          });
        });
      }

      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        
        if (dataMap.has(dateStr)) {
          paddedMetrics.push(dataMap.get(dateStr));
        } else {
          paddedMetrics.push({ date: dateStr, messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0 });
        }
      }
      return paddedMetrics;
    },
    enabled: !!userId,
  });

  const updateMetricsMutation = useMutation({
    mutationFn: async ({ newMetrics, isIncremental }: { newMetrics: Partial<DailyMetrics>, isIncremental: boolean }) => {
      if (!userId) throw new Error("No user ID");
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: existing } = await supabase.from('daily_metrics').select('*').eq('user_id', userId).eq('date', today).maybeSingle();
      
      const dbPayload: any = {};
      if (isIncremental) {
        dbPayload.messagessent = (existing?.messagessent || 0) + (newMetrics.messagesSent || 0);
        dbPayload.messagesreplied = (existing?.messagesreplied || 0) + (newMetrics.messagesReplied || 0);
        dbPayload.adspend = (existing?.adspend || 0) + (newMetrics.adSpend || 0);
        dbPayload.lprevenue = (existing?.lprevenue || 0) + (newMetrics.lpRevenue || 0);
      } else {
        if (newMetrics.messagesSent !== undefined) dbPayload.messagessent = newMetrics.messagesSent;
        if (newMetrics.messagesReplied !== undefined) dbPayload.messagesreplied = newMetrics.messagesReplied;
        if (newMetrics.adSpend !== undefined) dbPayload.adspend = newMetrics.adSpend;
        if (newMetrics.lpRevenue !== undefined) dbPayload.lprevenue = newMetrics.lpRevenue;
      }
      
      if (existing) {
        const { error } = await supabase.from('daily_metrics').update(dbPayload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('daily_metrics').insert([{ user_id: userId, date: today, ...dbPayload }]);
        if (error) throw error;
      }
      return { today, dbPayload };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', userId] });
      toast.success('Métricas atualizadas com sucesso!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao atualizar métricas: ${err.message}`);
    }
  });

  const addLeadMutation = useMutation({
    mutationFn: async (leadData: Omit<Lead, 'id'>) => {
      if (!userId) throw new Error("No user ID");
      const dbPayload = {
        user_id: userId,
        name: leadData.name,
        status: leadData.status,
        value: leadData.value,
        promisedate: leadData.promiseDate,
        service_type: leadData.serviceType
      };
      const { data, error } = await supabase.from('leads').insert([dbPayload]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', userId] });
      toast.success('Lead adicionado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao criar lead: ${err.message}`);
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, leadData }: { id: string, leadData: Partial<Lead> }) => {
      if (!userId) throw new Error("No user ID");
      const dbPayload: any = {};
      if (leadData.name !== undefined) dbPayload.name = leadData.name;
      if (leadData.status !== undefined) dbPayload.status = leadData.status;
      if (leadData.value !== undefined) dbPayload.value = leadData.value;
      if (leadData.promiseDate !== undefined) dbPayload.promisedate = leadData.promiseDate;
      if (leadData.serviceType !== undefined) dbPayload.service_type = leadData.serviceType;

      const { data, error } = await supabase.from('leads').update(dbPayload).eq('id', id).eq('user_id', userId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', userId] });
      toast.success('Lead atualizado com sucesso!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao atualizar lead: ${err.message}`);
    }
  });

  const removeLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("No user ID");
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', userId] });
      toast.success('Lead removido!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao remover lead: ${err.message}`);
    }
  });

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No user ID");
      const { error: err1 } = await supabase.from('leads').delete().eq('user_id', userId);
      if (err1) throw err1;
      const { error: err2 } = await supabase.from('daily_metrics').delete().eq('user_id', userId);
      if (err2) throw err2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', userId] });
      queryClient.invalidateQueries({ queryKey: ['metrics', userId] });
      toast.success('Dados apagados com sucesso!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao apagar dados: ${err.message}`);
    }
  });

  return { 
    metrics, 
    leads, 
    updateTodayMetrics: (newMetrics: Partial<DailyMetrics>, isIncremental = false) => updateMetricsMutation.mutate({ newMetrics, isIncremental }), 
    addLead: (lead: Omit<Lead, 'id'>) => addLeadMutation.mutate(lead), 
    updateLead: (id: string, lead: Partial<Lead>) => updateLeadMutation.mutate({ id, leadData: lead }), 
    removeLead: (id: string) => removeLeadMutation.mutate(id), 
    clearData: () => clearDataMutation.mutate(), 
    loading: loadingLeads || loadingMetrics 
  };
}
