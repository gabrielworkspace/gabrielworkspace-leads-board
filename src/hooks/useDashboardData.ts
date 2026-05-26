import { useState, useEffect } from 'react';
import type { DailyMetrics, Lead } from '../types';
import { format } from 'date-fns';

const INITIAL_METRICS: DailyMetrics[] = [
  {
    day: 1,
    date: format(new Date(), 'MMM dd'),
    lpRevenue: 0,
    adSpend: 0,
    messagesSent: 0,
    messagesReplied: 0,
  }
];

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DailyMetrics[]>(() => {
    const saved = localStorage.getItem('@NexusBoard:metrics');
    if (saved) {
      return JSON.parse(saved);
    }
    return INITIAL_METRICS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('@NexusBoard:leads');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('@NexusBoard:metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('@NexusBoard:leads', JSON.stringify(leads));
  }, [leads]);

  const updateTodayMetrics = (newMetrics: Partial<DailyMetrics>) => {
    setMetrics(prev => {
      const todayDate = format(new Date(), 'MMM dd');
      const lastMetric = prev[prev.length - 1];
      
      if (lastMetric && lastMetric.date === todayDate) {
        // Update today
        const updated = [...prev];
        updated[updated.length - 1] = { ...lastMetric, ...newMetrics };
        return updated;
      } else {
        // Create new day
        return [...prev, {
          day: prev.length + 1,
          date: todayDate,
          lpRevenue: 0,
          adSpend: 0,
          messagesSent: 0,
          messagesReplied: 0,
          ...newMetrics
        }];
      }
    });
  };

  const addLead = (lead: Omit<Lead, 'id'>) => {
    setLeads(prev => [{ ...lead, id: crypto.randomUUID() }, ...prev]);
  };
  
  const removeLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const clearData = () => {
    setMetrics(INITIAL_METRICS);
    setLeads([]);
  };

  return { metrics, leads, updateTodayMetrics, addLead, removeLead, clearData };
}
