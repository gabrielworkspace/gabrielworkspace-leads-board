import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { DailyMetrics, Lead } from '../types';

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Buscar Leads
      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leadsData) {
        setLeads(leadsData);
      }

      // Buscar Métricas dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: metricsData } = await supabase
        .from('daily_metrics')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Garantir que temos um array contínuo de 30 dias para o gráfico
      const paddedMetrics: DailyMetrics[] = [];
      const dataMap = new Map();
      if (metricsData) {
        metricsData.forEach(m => dataMap.set(m.date, m));
      }

      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        if (dataMap.has(dateStr)) {
          paddedMetrics.push({ ...dataMap.get(dateStr), date: dateStr });
        } else {
          paddedMetrics.push({ date: dateStr, messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0 });
        }
      }
      
      setMetrics(paddedMetrics);
      setLoading(false);
    }
    
    loadData();
  }, []);

  const updateTodayMetrics = async (newMetrics: Partial<DailyMetrics>) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Verifica se já existe métrica para hoje no banco
    const { data: existing } = await supabase.from('daily_metrics').select('id').eq('date', today).maybeSingle();
    
    if (existing) {
      await supabase.from('daily_metrics').update(newMetrics).eq('id', existing.id);
    } else {
      await supabase.from('daily_metrics').insert([{ date: today, ...newMetrics }]);
    }

    // Atualiza estado local para refletir imediatamente na tela
    setMetrics(prev => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last.date === today) {
        copy[copy.length - 1] = { ...last, ...newMetrics };
      }
      return copy;
    });
  };

  const addLead = async (leadData: Omit<Lead, 'id'>) => {
    // Insere no Supabase e recebe o objeto criado com o ID gerado pelo banco
    const { data } = await supabase.from('leads').insert([leadData]).select().single();
    if (data) {
      setLeads(prev => [data, ...prev]);
    }
  };

  const removeLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const clearData = async () => {
    // Deletar tudo do Supabase
    await supabase.from('leads').delete().not('id', 'is', null);
    await supabase.from('daily_metrics').delete().not('id', 'is', null);
    
    setLeads([]);
    
    // Resetar array local para 30 dias zerados
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
