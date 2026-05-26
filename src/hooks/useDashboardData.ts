import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { DailyMetrics, Lead } from '../types';

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leadsData) {
        // Map promisedate to promiseDate
        setLeads(leadsData.map(l => ({
          ...l,
          promiseDate: l.promisedate
        })));
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: metricsData } = await supabase
        .from('daily_metrics')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const paddedMetrics: DailyMetrics[] = [];
      const dataMap = new Map();
      if (metricsData) {
        metricsData.forEach(m => {
          // Map lowercase DB columns to camelCase frontend
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
        const dateStr = d.toISOString().split('T')[0];
        
        if (dataMap.has(dateStr)) {
          paddedMetrics.push(dataMap.get(dateStr));
        } else {
          paddedMetrics.push({ date: dateStr, messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0 });
        }
      }
      
      setMetrics(paddedMetrics);
      setLoading(false);
    }
    
    loadData();
  }, []);

  const updateTodayMetrics = async (newMetrics: Partial<DailyMetrics>, isIncremental = false) => {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from('daily_metrics').select('*').eq('date', today).maybeSingle();
    
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
      await supabase.from('daily_metrics').update(dbPayload).eq('id', existing.id);
    } else {
      await supabase.from('daily_metrics').insert([{ date: today, ...dbPayload }]);
    }

    setMetrics(prev => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last.date === today) {
        copy[copy.length - 1] = {
          ...last,
          messagesSent: dbPayload.messagessent !== undefined ? dbPayload.messagessent : last.messagesSent,
          messagesReplied: dbPayload.messagesreplied !== undefined ? dbPayload.messagesreplied : last.messagesReplied,
          adSpend: dbPayload.adspend !== undefined ? dbPayload.adspend : last.adSpend,
          lpRevenue: dbPayload.lprevenue !== undefined ? dbPayload.lprevenue : last.lpRevenue,
        };
      }
      return copy;
    });
  };

  const addLead = async (leadData: Omit<Lead, 'id'>) => {
    const dbPayload = {
      name: leadData.name,
      status: leadData.status,
      value: leadData.value,
      promisedate: leadData.promiseDate
    };
    const { data } = await supabase.from('leads').insert([dbPayload]).select().single();
    if (data) {
      setLeads(prev => [{ ...data, promiseDate: data.promisedate }, ...prev]);
    }
  };

  const removeLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const clearData = async () => {
    await supabase.from('leads').delete().not('id', 'is', null);
    await supabase.from('daily_metrics').delete().not('id', 'is', null);
    
    setLeads([]);
    const paddedMetrics: DailyMetrics[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      paddedMetrics.push({ date: d.toISOString().split('T')[0], messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0 });
    }
    setMetrics(paddedMetrics);
  };

  return { metrics, leads, updateTodayMetrics, addLead, removeLead, clearData, loading };
}
